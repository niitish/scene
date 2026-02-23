import logging
from logging.handlers import RotatingFileHandler

from app.constants import WORKER_LOG_PATH

logger = logging.getLogger("uvicorn.error")

worker_logger = logging.getLogger("worker")
worker_logger.setLevel(logging.DEBUG)
worker_logger.propagate = False  # don't leak into uvicorn/root logger

_fmt = logging.Formatter("%(asctime)s %(levelname)-9s %(name)s - %(message)s")

_file_handler = RotatingFileHandler(
    WORKER_LOG_PATH, maxBytes=10 * 1024 * 1024, backupCount=5
)
_file_handler.setFormatter(_fmt)
worker_logger.addHandler(_file_handler)
