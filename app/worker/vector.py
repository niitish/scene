import logging
import threading

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

from app.constants import CLIP_MODEL, CPU_ONLY

logger = logging.getLogger("worker.vector")

_lock = threading.Lock()
_device: str | None = None
_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None


def _load_model() -> tuple[CLIPModel, CLIPProcessor, str]:
    global _device, _model, _processor
    if _model is None:
        with _lock:
            if _model is None:
                _device = (
                    "cpu"
                    if CPU_ONLY
                    else ("cuda" if torch.cuda.is_available() else "cpu")
                )
                logger.info("[VECTOR] Using device: %s", _device)
                _model = CLIPModel.from_pretrained(CLIP_MODEL).to(_device)
                _processor = CLIPProcessor.from_pretrained(CLIP_MODEL)
                _model.eval()
    return _model, _processor, _device


def generate_text_vector(text: str) -> list[float]:
    """Generate a CLIP embedding for a text query."""

    model, processor, _ = _load_model()

    inputs = processor(text=[text], return_tensors="pt", padding=True)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    with torch.no_grad():
        text_outputs = model.text_model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
        )
        pooled = text_outputs.pooler_output
        outputs = model.text_projection(pooled)

    embeddings = outputs / outputs.norm(dim=-1, keepdim=True)
    return embeddings.cpu().numpy().squeeze(0).tolist()


def generate_vector(image_path: str) -> list[float]:
    """Generate a vector for the image."""

    logger.info("[VECTOR] Processing image: %s", image_path)

    model, processor, _ = _load_model()

    with Image.open(image_path) as img:
        inputs = processor(images=img, return_tensors="pt", padding=True)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

        with torch.no_grad():
            vision_outputs = model.vision_model(pixel_values=inputs["pixel_values"])
            pooled = vision_outputs.pooler_output
            outputs = model.visual_projection(pooled)

        embeddings = outputs / outputs.norm(dim=-1, keepdim=True)

        return embeddings.cpu().numpy().squeeze(0).tolist()
