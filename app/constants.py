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
