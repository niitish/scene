import logging
import os

from PIL import Image

from app.constants import THUMB_SIZE, UPLOAD_DIR

logger = logging.getLogger("worker.thumb")


def generate_thumb(image_path: str) -> str:
    """
    Generate a thumbnail that fits within 448x448 preserving aspect ratio.
    Saves it under a thumbs/ sibling directory and returns the thumb path.
    """
    thumb_dir = os.path.join(UPLOAD_DIR, "thumbs")
    os.makedirs(thumb_dir, exist_ok=True)
    thumb_path = os.path.join(thumb_dir, os.path.basename(image_path))

    with Image.open(image_path) as img:
        img.thumbnail(THUMB_SIZE)
        img.save(thumb_path)

    logger.info("[THUMB] Saved thumbnail to %s", thumb_path)
    return thumb_path
