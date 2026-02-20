import logging

logger = logging.getLogger("worker.vector")


def generate_vector(job: dict) -> str:
    """Generate a vector for the image."""

    logger.info("[VECTOR] Processing image_id=%s", job["image_id"])
