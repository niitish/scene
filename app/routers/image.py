import asyncio
import os
from datetime import datetime
from http import HTTPStatus
from uuid import UUID

import aiofiles
import aiofiles.os
import uuid_utils
from app.db import SessionDep
from app.db.model import Image, ServiceQ
from app.db.types import (
    DeleteResponse,
    ErrorResponse,
    ImageMeta,
    ImageUpdateRequest,
    ImageWithSimilarity,
    ListResponse,
    SimilarityListResponse,
    UploadResponse,
)
from app.helpers.constants import (
    ALLOWED_IMAGE_EXTENSIONS,
    SIMILARITY_THRESHOLD,
    TEXT_SIMILARITY_THRESHOLD,
    UPLOAD_DIR,
)
from app.helpers.deps import ReadUser, WriteUser
from app.helpers.enums import ServiceType, UserRole
from app.helpers.logger import logger
from app.helpers.presence import image_exists
from app.worker.vector import generate_text_vector
from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

router = APIRouter()

_ERRORS = {
    400: {"model": ErrorResponse},
    403: {"model": ErrorResponse},
    404: {"model": ErrorResponse},
    409: {"model": ErrorResponse},
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
    Image.uploaded_by,
)


@router.post(
    "/",
    responses={
        400: _ERRORS[400],
        403: _ERRORS[403],
        409: _ERRORS[409],
        500: _ERRORS[500],
    },
)
async def upload_file(
    file: UploadFile, session: SessionDep, current_user: WriteUser
) -> UploadResponse:
    file_path = None
    try:
        if file.content_type not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Only image files are accepted.",
            )

        content = await file.read()
        result = await image_exists(content, session)

        if result["exists"]:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Image already exists",
            )

        file_hash = result["hash"]

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        raw_ext = os.path.splitext(os.path.basename(file.filename or ""))[-1].lower()
        ext = raw_ext if raw_ext.lstrip(".").isalpha() else ""
        unique_filename = f"{uuid_utils.uuid7()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        async with aiofiles.open(file_path, "wb") as buffer:
            await buffer.write(content)

        image = Image(
            name=file.filename or unique_filename,
            path=file_path,
            uploaded_by=current_user.id,
            hash=file_hash,
        )
        session.add(image)
        await session.flush()

        session.add(ServiceQ(image_id=image.id, service_type=ServiceType.THUMB))
        await session.commit()
        await session.refresh(image)

        return UploadResponse(image_id=image.id, path=file_path)

    except HTTPException as e:
        logger.error(f"Error uploading image: {e.detail}")
        raise

    except IntegrityError as e:
        await session.rollback()
        try:
            if file_path is not None:
                await aiofiles.os.remove(file_path)
        except Exception:
            pass
        logger.error(f"Duplicate image (race condition): {e}")
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT, detail="Image already exists"
        )

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


@router.get(
    "/list", responses={400: _ERRORS[400], 403: _ERRORS[403], 500: _ERRORS[500]}
)
async def list_files(
    session: SessionDep,
    current_user: ReadUser,
    page: int = 1,
    page_size: int = 20,
    tag: str | None = None,
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
        tag_filter = Image.tags.contains([tag.strip()]) if tag and tag.strip() else None  # type: ignore[attr-defined]

        count_stmt = select(func.count()).select_from(Image)
        if tag_filter is not None:
            count_stmt = count_stmt.where(tag_filter)
        count_result = await session.exec(count_stmt)
        total = count_result.one()

        list_stmt = (
            select(*_IMAGE_COLS)  # type: ignore[call-overload]
            .order_by(Image.id.desc())  # type: ignore[attr-defined]
            .offset(offset)
            .limit(page_size)
        )
        if tag_filter is not None:
            list_stmt = list_stmt.where(tag_filter)
        result = await session.exec(list_stmt)
        images = [ImageMeta.model_validate(row) for row in result.mappings().all()]

        return ListResponse(page=page, page_size=page_size, count=total, items=images)

    except HTTPException as e:
        logger.error(
            f"Error listing images {page} with page_size {page_size}: {e.detail} tag: {tag}"
        )
        raise

    except Exception as e:
        logger.error(
            f"Error listing images {page} with page_size {page_size}: {e} tag: {tag}"
        )
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error listing images",
        )


@router.patch(
    "/{image_id}", responses={403: _ERRORS[403], 404: _ERRORS[404], 500: _ERRORS[500]}
)
async def update_file(
    image_id: UUID,
    session: SessionDep,
    current_user: WriteUser,
    body: ImageUpdateRequest,
) -> ImageMeta:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if current_user.role != UserRole.ADMIN and image.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="Only the uploader can edit this image",
            )

        if body.name is not None:
            image.name = body.name
        if body.tags is not None:
            image.tags = body.tags
        image.updated_at = datetime.now()

        session.add(image)
        await session.commit()
        await session.refresh(image)
        return ImageMeta.model_validate(image, from_attributes=True)

    except HTTPException as e:
        logger.error(f"Error updating image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error updating image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error updating image",
        )


@router.delete(
    "/{image_id}", responses={403: _ERRORS[403], 404: _ERRORS[404], 500: _ERRORS[500]}
)
async def delete_file(
    image_id: UUID, session: SessionDep, current_user: WriteUser
) -> DeleteResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if current_user.role != UserRole.ADMIN and image.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="Only the uploader can delete this image",
            )

        try:
            await aiofiles.os.remove(image.path)
        except FileNotFoundError:
            logger.warning(f"Image file not found during delete: {image.path}")

        thumb_path = image.thumb
        if not thumb_path:
            thumb_path = os.path.join(
                UPLOAD_DIR, "thumbs", os.path.basename(image.path)
            )
            logger.warning(
                f"No thumb path stored for image {image_id}, guessing: {thumb_path}"
            )
        try:
            await aiofiles.os.remove(thumb_path)
        except FileNotFoundError:
            logger.warning(f"Thumb file not found during delete: {thumb_path}")

        await session.delete(image)
        await session.commit()
        return DeleteResponse(message=f"Image {image_id} deleted")

    except HTTPException as e:
        logger.error(f"Error deleting image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error deleting image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error deleting image",
        )


@router.get("/search", responses={403: _ERRORS[403], 500: _ERRORS[500]})
async def search_images(
    query: str,
    session: SessionDep,
    current_user: ReadUser,
    page: int = 1,
    page_size: int = 10,
) -> SimilarityListResponse:
    try:
        text_embeddings = await asyncio.to_thread(generate_text_vector, query)
        distance = Image.embeddings.cosine_distance(text_embeddings)  # type: ignore[attr-defined]
        similarity = (1 - distance).label("similarity")

        count_result = await session.exec(
            select(func.count())
            .select_from(Image)
            .where(distance < TEXT_SIMILARITY_THRESHOLD)
        )
        total = count_result.one()

        results = await session.exec(
            select(*_IMAGE_COLS, similarity)  # type: ignore[call-overload]
            .where(distance < TEXT_SIMILARITY_THRESHOLD)
            .order_by(distance, Image.id.desc())  # type: ignore[attr-defined]
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = results.mappings().all()
        items = [
            ImageWithSimilarity.model_validate(
                {
                    **row,
                    "similarity": round(float(row["similarity"]), 4),
                }
            )
            for row in rows
        ]
        return SimilarityListResponse(
            page=page, page_size=page_size, count=total, items=items
        )

    except HTTPException as e:
        logger.error(f"Error searching images {query}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error searching images {query}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error searching images",
        )


@router.get(
    "/{image_id}/", responses={403: _ERRORS[403], 404: _ERRORS[404], 500: _ERRORS[500]}
)
async def get_image(
    image_id: UUID, session: SessionDep, current_user: ReadUser
) -> FileResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )
        return FileResponse(
            image.path, headers={"Cache-Control": "public, max-age=31536000, immutable"}
        )

    except HTTPException as e:
        logger.error(f"Error getting image {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error getting image {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error getting image",
        )


@router.get(
    "/{image_id}/thumb",
    responses={403: _ERRORS[403], 404: _ERRORS[404], 500: _ERRORS[500]},
)
async def get_thumb(
    image_id: UUID, session: SessionDep, current_user: ReadUser
) -> FileResponse:
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if not image.thumb:
            return FileResponse(
                image.path,
                headers={"Cache-Control": "public, max-age=31536000, immutable"},
            )

        return FileResponse(
            image.thumb,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )

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
    image_id: UUID,
    session: SessionDep,
    current_user: ReadUser,
    page: int = 1,
    page_size: int = 10,
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

        distance = Image.embeddings.cosine_distance(image.embeddings)  # type: ignore[attr-defined]
        similarity = (1 - distance).label("similarity")

        count_result = await session.exec(
            select(func.count())
            .select_from(Image)
            .where(distance < SIMILARITY_THRESHOLD)
        )
        total = count_result.one()

        results = await session.exec(
            select(*_IMAGE_COLS, similarity)  # type: ignore[call-overload]
            .where(distance < SIMILARITY_THRESHOLD)
            .order_by(distance, Image.id.desc())  # type: ignore[attr-defined]
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = results.mappings().all()
        items = [
            ImageWithSimilarity.model_validate(
                {
                    **row,
                    "similarity": round(float(row["similarity"]), 4),
                }
            )
            for row in rows
        ]
        return SimilarityListResponse(
            page=page, page_size=page_size, count=total, items=items
        )

    except HTTPException as e:
        logger.error(f"Error getting similar images {image_id}: {e.detail}")
        raise

    except Exception as e:
        logger.error(f"Error getting similar images {image_id}: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="Error getting similar images",
        )
