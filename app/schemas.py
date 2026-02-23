import uuid
from datetime import datetime

from pydantic import BaseModel


class UploadResponse(BaseModel):
    image_id: uuid.UUID
    path: str


class ImageMeta(BaseModel):
    id: uuid.UUID
    name: str
    path: str
    thumb: str | None
    created_at: datetime
    updated_at: datetime
    tags: list[str]


class ImageWithSimilarity(ImageMeta):
    similarity: float


class ListResponse(BaseModel):
    page: int
    page_size: int
    items: list[ImageMeta]


class DeleteResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
