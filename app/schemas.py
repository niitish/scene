from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UploadResponse(BaseModel):
    image_id: UUID
    path: str


class ImageMeta(BaseModel):
    id: UUID
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
    count: int
    items: list[ImageMeta]


class SimilarityListResponse(BaseModel):
    page: int
    page_size: int
    count: int
    items: list[ImageWithSimilarity]


class ImageUpdateRequest(BaseModel):
    name: str | None = None
    tags: list[str] | None = None


class DeleteResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class UserResponse(BaseModel):
    id: UUID
    email: str | None
    name: str | None
    avatar_url: str | None
    provider: str
