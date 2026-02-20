import os
import uuid

import aiofiles
import aiofiles.os
from http import HTTPStatus
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import select

from app.constants import ALLOWED_IMAGE_EXTENSIONS, UPLOAD_DIR
from app.db import SessionDep
from app.db.model import Image, ServiceQ
from app.enums import ServiceType
from app.logger import logger


router = APIRouter()


@router.post("/")
async def upload_file(file: UploadFile, session: SessionDep):
    try:
        if file.content_type not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Only image files are accepted.",
            )

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        ext = os.path.splitext(file.filename or "")[-1]
        unique_filename = f"{uuid.uuid7().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        async with aiofiles.open(file_path, "wb") as buffer:
            content = await file.read()
            await buffer.write(content)

        image = Image(
            name=file.filename or unique_filename, path=file_path, thumb=file_path
        )
        session.add(image)
        await session.commit()
        await session.refresh(image)

        for service_type in ServiceType:
            session.add(ServiceQ(image_id=image.id, service_type=service_type))
        await session.commit()

        return {
            "image_id": image.id,
            "path": file_path,
        }

    except HTTPException as e:
        logger.error(f"Error uploading image: {e.detail}")
        raise

    except Exception as e:
        await session.rollback()
        try:
            await aiofiles.os.remove(file_path)
        except Exception:
            pass
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Error uploading image"
        )


@router.get("/list")
async def list_files(
    session: SessionDep,
    page: int = 1,
    page_size: int = 20,
):
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
        result = await session.exec(select(Image).offset(offset).limit(page_size))
        images = result.all()

        return {"page": page, "page_size": page_size, "items": images}

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


@router.patch("/{image_id}")
async def update_file(
    image_id: uuid.UUID,
    session: SessionDep,
    name: str | None = None,
    tags: list[str] | None = None,
):
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        if name is not None:
            image.name = name
        if tags is not None:
            image.tags = tags
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


@router.delete("/{image_id}")
async def delete_file(image_id: uuid.UUID, session: SessionDep):
    try:
        image = await session.get(Image, image_id)
        if not image:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, detail="Image not found"
            )

        try:
            await aiofiles.os.remove(image.path)
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


@router.get("/{image_id}/")
async def get_image(image_id: uuid.UUID, session: SessionDep):
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
