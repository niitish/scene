import hashlib
import io

from PIL import Image
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.model import Image as Img
from app.db.types import ImageExistsResult
from app.helpers.logger import logger


def calc_sha(img: Image.Image) -> str:
    """Calculate the SHA256 hash of the image."""
    return hashlib.sha256(img.tobytes()).hexdigest()


async def image_exists(file_bytes: bytes, session: AsyncSession) -> ImageExistsResult:
    """Check if the image exists in the database."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        sha = calc_sha(img)

        result = await session.exec(select(Img).where(Img.hash == sha))
        exists = result.first() is not None
        return {"exists": exists, "hash": sha}
    except Exception as e:
        logger.error(f"Error checking if image exists: {e}")
        raise
