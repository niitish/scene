import asyncio
import os
import uuid
from datetime import datetime
from http import HTTPStatus

import aiofiles
import aiofiles.os
from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import func, select

from app.constants import (
    ALLOWED_IMAGE_EXTENSIONS,
    SIMILARITY_THRESHOLD,
    TEXT_SIMILARITY_THRESHOLD,
    UPLOAD_DIR,
)
from app.db import SessionDep
from app.db.model import Image, ServiceQ
from app.enums import ServiceType
from app.logger import logger
from app.schemas import (
    DeleteResponse,
    ErrorResponse,
    ImageMeta,
    ImageUpdateRequest,
    ListResponse,
    SimilarityListResponse,
    UploadResponse,
)
from app.worker.vector import generate_text_vector

router = APIRouter()

_ERRORS = {
    400: {"model": ErrorResponse},
    404: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
    500: {"model": ErrorResponse},
}


_IMAGE_COLS = (
    Image.id,
    Image.name,
    Image.path,
    Image.thumb,
    Image.created_at,
    Image.updated_at,
    Image.tags,
)


@router.post("/", responses={400: _ERRORS[400], 500: _ERRORS[500]})
async def upload_file(file: UploadFile, session: SessionDep) -> UploadResponse:
    file_path = None
    try:
        if file.content_type not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Only image files are accepted.",
            )

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        raw_ext = os.path.splitext(os.path.basename(file.filename or ""))[-1].lower()
        ext = raw_ext if raw_ext.lstrip(".").isalpha() else ""
        unique_filename = f"{uuid.uuid7().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        async with aiofiles.open(file_path, "wb") as buffer:
            content = await file.read()
            await buffer.write(content)

        image = Image(
            name=file.filename or unique_filename,
            path=file_path,
        )
        session.add(image)
        await session.flush()

        session.add(ServiceQ(image_id=image.id, service_type=ServiceType.THUMB))
        await session.commit()
        await session.refresh(image)

        return {"image_id": image.id, "path": file_path}

    except HTTPException as e:
        logger.error(f"Error uploading image: {e.detail}")
        raise

    except Exception as e:
        await session.rollback()
        try:
            if file_path is not None:
                await aiofiles.os.remove(file_path)
        except Exception:
            pass
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Error uploading image"
        )


@router.get("/list", responses={400: _ERRORS[400], 500: _ERRORS[500]})
async def list_files(
    session: SessionDep,
    page: int = 1,
    page_size: int = 20,
) -> ListResponse:
    try:
        if page < 1:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST, detail="page must be >= 1"
            )
        if not (1 <= page_size <= 100):
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="page_size must be between 1 and 100",
            )

        offset = (page - 1) * page_size
        count_result = await session.exec(select(func.count()).select_from(Image))
        total = count_result.one()

        result = await session.exec(
            select(*_IMAGE_COLS).order_by(Image.id).offset(offset).limit(page_size)
        )
        images = result.mappings().all()

        return {"page": page, "page_size": page_size, "count": total, "items": images}

    except HTTPException as e:
        logger.error(
            f"Error listing images {page} with page_size {page_size}: {e.detail}"
        )
        raise

    except Exception as e:
        logger.error(f"Error listing images {page} with page_size {page_size}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error listing images",
        )


@router.patch("/{image_id}", responses={404: _ERRORS[404], 500: _ERRORS[500]})
async def update_file(
    image_id: uuid.UUID,
    session: SessionDep,
    body: ImageUpdateRequest,
) -> ImageMeta:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if body.name is not None:
            image.name = body.name
        if body.tags is not None:
            image.tags = body.tags
        image.updated_at = datetime.now()

        session.add(image)
        await session.commit()
        await session.refresh(image)
        return image

    except HTTPException as e:
        logger.error(f"Error updating image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error updating image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error updating image",
        )


@router.delete("/{image_id}", responses={404: _ERRORS[404], 500: _ERRORS[500]})
async def delete_file(image_id: uuid.UUID, session: SessionDep) -> DeleteResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        try:
            await aiofiles.os.remove(image.path)
            if image.thumb:
                await aiofiles.os.remove(image.thumb)
        except FileNotFoundError:
            pass

        await session.delete(image)
        await session.commit()
        return {"message": f"Image {image_id} deleted"}

    except HTTPException as e:
        logger.error(f"Error deleting image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error deleting image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error deleting image",
        )


@router.get("/search", responses={500: _ERRORS[500]})
async def search_images(
    query: str, session: SessionDep, page: int = 1, page_size: int = 10
) -> SimilarityListResponse:
    try:
        text_embeddings = await asyncio.to_thread(generate_text_vector, query)
        distance = Image.embeddings.cosine_distance(text_embeddings)
        similarity = (1 - distance).label("similarity")

        count_result = await session.exec(
            select(func.count())
            .select_from(Image)
            .where(distance < TEXT_SIMILARITY_THRESHOLD)
        )
        total = count_result.one()

        results = await session.exec(
            select(*_IMAGE_COLS, similarity)
            .where(distance < TEXT_SIMILARITY_THRESHOLD)
            .order_by(distance, Image.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = results.mappings().all()
        items = [
            {**row, "similarity": round(float(row["similarity"]), 4)} for row in rows
        ]
        return {"page": page, "page_size": page_size, "count": total, "items": items}

    except HTTPException as e:
        logger.error(f"Error searching images {query}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error searching images {query}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error searching images",
        )


@router.get("/{image_id}/", responses={404: _ERRORS[404], 500: _ERRORS[500]})
async def get_image(image_id: uuid.UUID, session: SessionDep) -> FileResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )
        return FileResponse(image.path)

    except HTTPException as e:
        logger.error(f"Error getting image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error getting image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error getting image",
        )


@router.get("/{image_id}/thumb", responses={404: _ERRORS[404], 500: _ERRORS[500]})
async def get_thumb(image_id: uuid.UUID, session: SessionDep) -> FileResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if not image.thumb:
            return FileResponse(image.path)

        return FileResponse(image.thumb)

    except HTTPException as e:
        logger.error(f"Error getting thumb {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error getting thumb {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error getting thumb",
        )


@router.get(
    "/{image_id}/similar",
    responses={404: _ERRORS[404], 422: _ERRORS[422], 500: _ERRORS[500]},
)
async def get_similar(
    image_id: uuid.UUID, session: SessionDep, page: int = 1, page_size: int = 10
) -> SimilarityListResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if image.embeddings is None:
            raise HTTPException(
                status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
                detail="Image has not been embedded yet",
            )

        distance = Image.embeddings.cosine_distance(image.embeddings)
        similarity = (1 - distance).label("similarity")

        count_result = await session.exec(
            select(func.count())
            .select_from(Image)
            .where(distance < SIMILARITY_THRESHOLD)
        )
        total = count_result.one()

        results = await session.exec(
            select(*_IMAGE_COLS, similarity)
            .where(distance < SIMILARITY_THRESHOLD)
            .order_by(distance, Image.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = results.mappings().all()
        items = [
            {**row, "similarity": round(float(row["similarity"]), 4)} for row in rows
        ]
        return {"page": page, "page_size": page_size, "count": total, "items": items}

    except HTTPException as e:
        logger.error(f"Error getting similar images {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error getting similar images {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error getting similar images",
        )
