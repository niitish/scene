import hashlib
import io

from PIL import Image
from sqlmodel import or_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.model import Image as Img
from app.helpers.logger import logger


def calc_sha(img: Image.Image) -> str:
    """Calculate the SHA256 hash of the image."""
    return hashlib.sha256(img.tobytes()).hexdigest()


async def image_exists(
    file_bytes: bytes, filename: str, session: AsyncSession
) -> dict[str, bool | str]:
    """Check if the image exists in the database."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        sha = calc_sha(img)

        where_clauses = []
        if sha:
            where_clauses.append(Img.hash == sha)
        if filename:
            where_clauses.append(Img.name == filename)

        result = await session.exec(select(Img).where(or_(*where_clauses)))
        exists = result.first() is not None
        return {"exists": exists, "hash": sha}
    except Exception as e:
        logger.error(f"Error checking if image exists: {e}")
        raise
