import asyncio
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app import logger as _  # noqa: F401 — registers worker log handler
from app.routers import image
from app.worker.queue import start_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(start_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


app.include_router(prefix="/images", router=image.router, tags=["images"])


if __name__ == "__main__":
    uvicorn.run(app, reload=True, host="0.0.0.0", port=8000)
