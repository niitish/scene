import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/scene"
)

UPLOAD_DIR = "uploads"
ALLOWED_IMAGE_EXTENSIONS = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/heic",
}

POLL_INTERVAL = 2
MAX_CONCURRENT_JOBS = 10
THUMB_SIZE = (448, 448)

CLIP_MODEL = "openai/clip-vit-base-patch32"

CPU_ONLY = True
SIMILARITY_THRESHOLD = 0.5
TEXT_SIMILARITY_THRESHOLD = 0.9

WORKER_LOG_PATH = "worker.log"

SESSION_SECRET = os.getenv("SESSION_SECRET", "")
JWT_SECRET = os.getenv("JWT_SECRET", "")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "false").lower() == "true"

if (
    not SESSION_SECRET
    or not JWT_SECRET
    or not GOOGLE_CLIENT_ID
    or not GOOGLE_CLIENT_SECRET
    # or not GITHUB_CLIENT_ID
    # or not GITHUB_CLIENT_SECRET
):
    raise ValueError("Missing environment variables")
