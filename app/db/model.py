from datetime import datetime
from uuid import UUID

import uuid_utils
from pgvector.sqlalchemy import VECTOR
from sqlmodel import ARRAY, Field, SQLModel, String

from app.enums import ServiceStatus, ServiceType, UserRole


def uuid7() -> UUID:
    return UUID(str(uuid_utils.uuid7()))


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    provider: str
    provider_id: str
    email: str | None = Field(default=None)
    name: str | None = Field(default=None)
    avatar_url: str | None = Field(default=None)
    role: UserRole = Field(default=UserRole.READ)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Image(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    name: str
    path: str
    thumb: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    tags: list[str] = Field(default=[], sa_type=ARRAY[str](String))
    embeddings: list[float] | None = Field(sa_type=VECTOR(512), default=None)
    uploaded_by: UUID | None = Field(
        default=None, foreign_key="user.id", ondelete="SET NULL"
    )


class ServiceQ(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    image_id: UUID = Field(foreign_key="image.id", ondelete="CASCADE")
    service_type: ServiceType
    status: ServiceStatus = Field(default=ServiceStatus.PENDING)
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=3)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
