import asyncio
import logging
import uuid
from datetime import datetime

from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession

from app.constants import MAX_CONCURRENT_JOBS, POLL_INTERVAL
from app.db import async_session
from app.db.model import Image, ServiceQ
from app.enums import ServiceStatus, ServiceType
from app.worker.detect import detect_objects
from app.worker.thumb import generate_thumb
from app.worker.vector import generate_vector

logger = logging.getLogger("worker")

_sem = asyncio.Semaphore(MAX_CONCURRENT_JOBS)


async def _dequeue(session: AsyncSession) -> dict | None:
    """Atomically claim the next pending job. Returns the row or None."""

    result = await session.exec(
        text("""
        WITH next_job AS (
            SELECT id FROM serviceq
            WHERE status = 'PENDING'
              AND attempts < max_attempts
            ORDER BY created_at
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        )
        UPDATE serviceq
        SET status = 'RUNNING',
            attempts = attempts + 1,
            updated_at = NOW()
        FROM next_job
        WHERE serviceq.id = next_job.id
        RETURNING serviceq.id, serviceq.image_id, serviceq.service_type,
                  serviceq.attempts, serviceq.max_attempts
    """)
    )
    await session.commit()
    row = result.fetchone()
    if row is None:
        return None
    return {
        "id": row[0],
        "image_id": row[1],
        "service_type": row[2],
        "attempts": row[3],
        "max_attempts": row[4],
    }


async def _mark_done(session: AsyncSession, job_id: uuid.UUID, success: bool) -> None:
    await session.exec(
        text("""
            UPDATE serviceq
            SET status = CASE
                WHEN :success THEN 'COMPLETED'::servicestatus
                WHEN attempts >= max_attempts THEN 'FAILED'::servicestatus
                ELSE 'PENDING'::servicestatus
            END,
            updated_at = NOW()
            WHERE id = :id
        """).bindparams(success=success, id=job_id)
    )


async def _handle_job(job: dict) -> None:
    async with _sem:
        async with async_session() as session:
            try:
                match job["service_type"]:
                    case ServiceType.THUMB:
                        image = await session.get(Image, job["image_id"])
                        if image is None:
                            raise ValueError(
                                f"THUMB: Image {job['image_id']} not found"
                            )
                        thumb_path = await asyncio.to_thread(generate_thumb, image.path)
                        image.thumb = thumb_path
                        image.updated_at = datetime.now()
                        session.add(image)
                        session.add(
                            ServiceQ(
                                image_id=job["image_id"],
                                service_type=ServiceType.VECTOR,
                                status=ServiceStatus.PENDING,
                            )
                        )
                        await _mark_done(session, job["id"], success=True)
                        await session.commit()
                        return

                    case ServiceType.VECTOR:
                        image = await session.get(Image, job["image_id"])
                        if image is None:
                            raise ValueError(
                                f"VECTOR: Image {job['image_id']} not found"
                            )
                        if image.thumb is None:
                            raise ValueError(
                                f"VECTOR: Image {job['image_id']} has no thumbnail yet"
                            )
                        embeddings = await asyncio.to_thread(
                            generate_vector, image.thumb
                        )
                        image.embeddings = embeddings
                        image.updated_at = datetime.now()
                        session.add(image)

                        # TODO: add a new serviceq for the detector

                        await _mark_done(session, job["id"], success=True)
                        await session.commit()
                        return

                    case ServiceType.DETECTOR:
                        await asyncio.to_thread(detect_objects, job)
                        await _mark_done(session, job["id"], success=True)
                        await session.commit()
                        return

                    case _:
                        logger.warning("Unknown service_type: %s", job["service_type"])

            except Exception:
                logger.exception("Job failed: %s", job)
                try:
                    await session.rollback()
                    await _mark_done(session, job["id"], success=False)
                    await session.commit()
                except Exception:
                    logger.exception("Failed to mark job as done: %s", job["id"])


_tasks: set[asyncio.Task] = set()


async def start_worker() -> None:
    """Poll the DB and dispatch jobs. Runs until cancelled."""

    logger.info(
        "Worker started (poll_interval=%ss, concurrency=%s)",
        POLL_INTERVAL,
        MAX_CONCURRENT_JOBS,
    )

    try:
        while True:
            await _sem.acquire()
            _sem.release()

            async with async_session() as session:
                job = await _dequeue(session)

            if job:
                task = asyncio.create_task(_handle_job(job))
                _tasks.add(task)
                task.add_done_callback(_tasks.discard)
            else:
                await asyncio.sleep(POLL_INTERVAL)

    except asyncio.CancelledError:
        logger.info("Worker stopped, waiting for %d running jobs...", len(_tasks))
        if _tasks:
            await asyncio.gather(*_tasks, return_exceptions=True)
        logger.info("Worker shut down cleanly")
