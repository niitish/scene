import logging

logger = logging.getLogger("worker.detect")


def detect_objects(job: dict) -> str:
    """Detect objects in the image."""

    logger.info("[DETECT] Processing image_id=%s", job["image_id"])

    return job["image_id"]
