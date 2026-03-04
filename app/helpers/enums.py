from enum import Enum


class UserRole(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    ADMIN = "ADMIN"


class ServiceStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ServiceType(str, Enum):
    THUMB = "THUMB"
    VECTOR = "VECTOR"
    DETECTOR = "DETECTOR"
