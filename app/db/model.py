import uuid
from datetime import datetime

from pgvector.sqlalchemy import VECTOR
from sqlmodel import ARRAY, Field, SQLModel, String

from app.enums import ServiceStatus, ServiceType


class Image(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid7, primary_key=True)
    name: str
    path: str
    thumb: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    tags: list[str] = Field(default=[], sa_type=ARRAY[str](String))
    embeddings: list[float] | None = Field(sa_type=VECTOR(512), default=None)


class ServiceQ(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid7, primary_key=True)
    image_id: uuid.UUID = Field(foreign_key="image.id", ondelete="CASCADE")
    service_type: ServiceType
    status: ServiceStatus = Field(default=ServiceStatus.PENDING)
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=3)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
