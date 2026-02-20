import uvicorn
from fastapi import FastAPI

from app.routers import image


app = FastAPI()


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


app.include_router(prefix="/images", router=image.router, tags=["images"])


if __name__ == "__main__":
    uvicorn.run(app, reload=True, host="0.0.0.0", port=8000)
