from enum import Enum


class ServiceStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ServiceType(str, Enum):
    THUMB = "THUMB"
    VECTOR = "VECTOR"
    DETECTOR = "DETECTOR"
