import asyncio
import hashlib
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image as PILImage
from sqlmodel import select, or_


from app.db import async_session
from app.db.model import Image


def calc_sha(img: PILImage.Image) -> str:
    return hashlib.sha256(img.tobytes()).hexdigest()


async def backfill_hashes() -> None:
    updated = 0
    skipped = 0
    failed = 0

    async with async_session() as session:
        result = await session.exec(
            select(Image)
            .where(or_(Image.hash == "", Image.hash.is_(None)))
            .order_by(Image.id)
        )
        images = result.all()

        if not images:
            print("No images with empty hash found.")
            return

        print(f"Found {len(images)} image(s) to backfill.")

        for img in images:
            try:
                if not os.path.exists(img.path):
                    print(f"SKIP {img.id}: file not found: {img.path}")
                    skipped += 1
                    continue

                with open(img.path, "rb") as f:
                    content = f.read()

                pil_img = PILImage.open(io.BytesIO(content))
                file_hash = calc_sha(pil_img)

                img.hash = file_hash
                session.add(img)
                await session.flush()

                updated += 1
                print(f"UPDATED {img.id}: {file_hash[:16]}...")

            except Exception as e:
                failed += 1
                print(f"FAIL {img.id}: {e}")

        await session.commit()

    print(
        f"\nDone: {updated} updated, {skipped} skipped (missing file), {failed} failed."
    )


if __name__ == "__main__":
    asyncio.run(backfill_hashes())
