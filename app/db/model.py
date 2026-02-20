import uuid
from datetime import datetime
from typing import Any

from pgvector.sqlalchemy import VECTOR
from sqlmodel import ARRAY, Field, SQLModel, String

from app.enums import ServiceStatus, ServiceType


class Image(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid7, primary_key=True)
    name: str
    path: str
    thumb: str
    created_at: datetime = Field(default=datetime.now())
    updated_at: datetime = Field(default=datetime.now())
    tags: list[str] = Field(default=[], sa_type=ARRAY(String))
    embeddings: Any | None = Field(sa_type=VECTOR(3), default=None)


class ServiceQ(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid7, primary_key=True)
    image_id: uuid.UUID = Field(foreign_key="image.id")
    service_type: ServiceType
    status: ServiceStatus = Field(default=ServiceStatus.PENDING)
    created_at: datetime = Field(default=datetime.now())
    updated_at: datetime = Field(default=datetime.now())
