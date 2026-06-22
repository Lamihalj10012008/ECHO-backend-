from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from textblob import TextBlob
from PIL import Image
from sqlalchemy import text
from dotenv import load_dotenv

from database import Base, engine, SessionLocal, LostItem, FoundItem, ItemMatch, SupportRequest, MeetingSchedule
from matching import run_matching

import io
import os
import uuid
import json
import base64
from datetime import datetime, timezone

import anthropic

load_dotenv()  # load ANTHROPIC_API_KEY from backend/.env if present


app = FastAPI(
    title="ECHO - Smart Campus AI System",
    version="2.0.0"
)

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# DATABASE — create tables + migrate columns
# ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)   # creates item_matches if missing


def run_migrations():
    """Add new columns to existing tables without dropping data."""
    new_cols = [
        "ALTER TABLE lost_items ADD COLUMN date_lost TEXT",
        "ALTER TABLE lost_items ADD COLUMN time_lost TEXT",
        "ALTER TABLE lost_items ADD COLUMN location_detail TEXT",
        "ALTER TABLE lost_items ADD COLUMN created_at TEXT",
        "ALTER TABLE found_items ADD COLUMN reported_by TEXT",
        "ALTER TABLE found_items ADD COLUMN date_found TEXT",
        "ALTER TABLE found_items ADD COLUMN additional_notes TEXT",
        "ALTER TABLE found_items ADD COLUMN created_at TEXT",
    ]
    with engine.connect() as conn:
        for sql in new_cols:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass  # column already exists


run_migrations()

# ─────────────────────────────────────────────
# STATIC FILES
# ─────────────────────────────────────────────
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _save_upload(file: UploadFile, contents: bytes) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(contents)
    return name


def _lost_dict(item: LostItem) -> dict:
    return {
        "id":          item.id,
        "item_name":   item.item_name,
        "description": item.description or "",
        "category":    item.category,
        "location":    item.location,
        "date_lost":   item.date_lost or "",
        "time_lost":   item.time_lost or "",
        "image_name":  item.image_name or "",
        "image_url":   f"/uploads/{item.image_name}" if item.image_name else None,
        "reported_by": item.reported_by or "",
        "status":      item.status,
        "created_at":  item.created_at or "",
    }


def _found_dict(item: FoundItem) -> dict:
    return {
        "id":               item.id,
        "item_name":        item.item_name,
        "description":      item.description or "",
        "category":         item.category,
        "location":         item.location,
        "date_found":       item.date_found or "",
        "additional_notes": item.additional_notes or "",
        "image_name":       item.image_name or "",
        "image_url":        f"/uploads/{item.image_name}" if item.image_name else None,
        "reported_by":      item.reported_by or "",
        "status":           item.status,
        "created_at":       item.created_at or "",
    }


# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────
class Complaint(BaseModel):
    complaint: str


class MatchStatusUpdate(BaseModel):
    status: str  # "accepted" | "rejected"


# ─────────────────────────────────────────────
# HOME
# ─────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "ECHO Backend Running Successfully 🚀"}


# ─────────────────────────────────────────────
# TRIAGE
# ─────────────────────────────────────────────
@app.post("/analyze")
def analyze(data: Complaint):
    txt = data.complaint
    polarity = TextBlob(txt).sentiment.polarity
    sentiment = "Positive" if polarity > 0 else ("Negative" if polarity < 0 else "Neutral")
    urgency = "High" if any(
        w in txt.lower() for w in ["urgent", "emergency", "immediately", "critical"]
    ) else "Medium"
    if "hostel" in txt.lower():
        category, assigned = "Facilities",  "Facilities Agent"
    elif "stress" in txt.lower():
        category, assigned = "Stress",       "Stress Agent"
    elif "lost" in txt.lower():
        category, assigned = "Lost & Found", "Lost Agent"
    elif "event" in txt.lower():
        category, assigned = "Events",       "Event Agent"
    else:
        category, assigned = "General",      "Support Agent"
    return {
        "complaint": txt, "sentiment": sentiment,
        "urgency": urgency, "category": category, "assignedAgent": assigned,
    }


# ─────────────────────────────────────────────
# LOST & FOUND AI (Claude Vision image analysis)
# ─────────────────────────────────────────────
_MEDIA_TYPES = {"jpeg": "image/jpeg", "jpg": "image/jpeg",
                "png": "image/png", "gif": "image/gif", "webp": "image/webp"}

_AI_PROMPT = (
    "You are an AI assistant for a university Lost & Found system. "
    "Analyze this image and identify the item shown.\n\n"
    "Respond with ONLY a valid JSON object, no other text:\n"
    '{"item": "<specific item name, e.g. Lenovo Laptop Charger or Blue Hydro Flask>", '
    '"category": "<one of: Electronics, Documents, Clothing, Accessories, Keys, Other>", '
    '"location": "<most likely campus location where this item is commonly lost, '
    'e.g. Main Library, Cafeteria, Computer Lab, Sports Complex, Admin Block>", '
    '"confidence": <integer between 60 and 95>, '
    '"description": "<one sentence describing key identifying features>"}'
)


_YOLO_MODEL = None
_YOLO_LOAD_FAILED = False

# Maps COCO-80 class names (what YOLOv8 detects) to campus Lost & Found taxonomy
_COCO_TO_CAMPUS = {
    "backpack":    ("Backpack or Bag",       "Accessories", "Library, Cafeteria or Lecture Hall"),
    "handbag":     ("Handbag or Bag",        "Accessories", "Library, Cafeteria or Lecture Hall"),
    "suitcase":    ("Suitcase or Travel Bag","Accessories", "Hostel or Admin Block"),
    "cell phone":  ("Smartphone",            "Electronics", "Cafeteria or Lecture Hall"),
    "laptop":      ("Laptop",                "Electronics", "Library or Computer Lab"),
    "keyboard":    ("Keyboard",              "Electronics", "Computer Lab"),
    "mouse":       ("Computer Mouse",        "Electronics", "Computer Lab"),
    "remote":      ("Remote Control",        "Electronics", "Lecture Hall"),
    "tv":          ("Monitor or TV",         "Electronics", "Lecture Hall or Lab"),
    "book":        ("Book or Notebook",      "Documents",   "Library"),
    "umbrella":    ("Umbrella",              "Accessories", "Main Entrance"),
    "bottle":      ("Water Bottle",          "Accessories", "Cafeteria or Sports Complex"),
    "cup":         ("Cup or Mug",            "Accessories", "Cafeteria"),
    "wine glass":  ("Cup or Glass",          "Accessories", "Cafeteria"),
    "tie":         ("Tie or Clothing Item",  "Clothing",    "Admin Block"),
    "scissors":    ("Scissors",              "Other",       "Admin Block"),
    "clock":       ("Clock or Watch",        "Accessories", "Admin Block"),
    "teddy bear":  ("Soft Toy",              "Other",       "Hostel"),
    "hair drier":  ("Hair Dryer",            "Other",       "Hostel"),
    "toothbrush":  ("Toothbrush",            "Other",       "Hostel"),
    "vase":        ("Vase or Decor Item",    "Other",       "Admin Block"),
}

# Per-class minimum confidence required to trust a YOLO detection.
# Classes that YOLO frequently confuses with unrelated objects need higher bars.
_YOLO_CLASS_MIN_CONF = {
    "cell phone": 0.82,   # rectangular dark objects (chargers, remotes) often trigger this
    "laptop":     0.65,   # flat surfaces / books can look similar
    "handbag":    0.72,
    "backpack":   0.60,
}
_YOLO_DEFAULT_MIN_CONF = 0.52


def _get_yolo_model():
    """Lazily load the YOLOv8n model once per process."""
    global _YOLO_MODEL, _YOLO_LOAD_FAILED
    if _YOLO_MODEL is not None or _YOLO_LOAD_FAILED:
        return _YOLO_MODEL
    try:
        from ultralytics import YOLO
        _YOLO_MODEL = YOLO("yolov8n.pt")
    except Exception:
        _YOLO_LOAD_FAILED = True
        _YOLO_MODEL = None
    return _YOLO_MODEL


def _yolo_analyze(contents: bytes) -> dict | None:
    """
    Real object detection using a pretrained YOLOv8n model (COCO-80 classes).
    Returns the highest-confidence detection mapped to campus Lost & Found
    terms, or None if nothing was detected / the model isn't available.
    """
    model = _get_yolo_model()
    if model is None:
        return None
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        # Use a low initial scan threshold so we can examine all detections,
        # then apply per-class minimum confidence gates before accepting.
        preds = model.predict(img, verbose=False, conf=0.30)
        if not preds:
            return None
        boxes = preds[0].boxes
        if boxes is None or len(boxes) == 0:
            return None

        # Evaluate all detections in descending confidence order and return
        # the first one that passes its per-class minimum confidence gate.
        import torch
        sorted_indices = boxes.conf.argsort(descending=True).tolist()
        for idx in sorted_indices:
            cls_id     = int(boxes.cls[idx].item())
            yolo_conf  = float(boxes.conf[idx].item())
            class_name = (model.names.get(cls_id, "object")
                          if isinstance(model.names, dict) else model.names[cls_id])

            min_conf = _YOLO_CLASS_MIN_CONF.get(class_name, _YOLO_DEFAULT_MIN_CONF)
            if yolo_conf < min_conf:
                continue   # this detection is below the trust bar for its class

            mapped = _COCO_TO_CAMPUS.get(class_name)
            if mapped:
                item_name, category, location = mapped
            else:
                item_name = class_name.replace("_", " ").title()
                category  = "Other"
                location  = "Lost & Found Counter"

            confidence = min(96, max(60, int(yolo_conf * 100)))
            return {
                "item":        item_name,
                "category":    category,
                "location":    location,
                "confidence":  confidence,
                "description": (f"YOLOv8 detected '{class_name}' with "
                                f"{int(yolo_conf * 100)}% confidence."),
            }
        return None   # no detection passed its confidence gate
    except Exception:
        return None


def _local_analyze(contents: bytes) -> dict | None:
    """
    PIL-based heuristic classifier.  Analyses pixel statistics and geometry
    to make a best-guess identification for the most common campus lost items:
    bags, smartphones, laptops, keys, earphones, clothing, documents.
    Used when no Anthropic API key is configured.
    """
    try:
        from PIL import ImageStat
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        orig_w, orig_h = img.size

        # Normalised aspect ratio (> 1 = landscape, < 1 = portrait)
        ratio = orig_w / orig_h if orig_h else 1.0

        # Work on a 150×150 thumbnail for speed
        thumb = img.resize((150, 150))
        stat  = ImageStat.Stat(thumb)
        r_mu, g_mu, b_mu = stat.mean[:3]
        r_sd, g_sd, b_sd = stat.stddev[:3]
        brightness  = (r_mu + g_mu + b_mu) / 3
        color_var   = (r_sd + g_sd + b_sd) / 3   # high = colourful, low = grey/mono

        # Pixel counts on the thumbnail (22 500 pixels)
        pixels = list(thumb.getdata())
        n = len(pixels)

        dark_px      = sum(1 for p in pixels if (p[0]+p[1]+p[2])/3 < 70)
        very_dark_px = sum(1 for p in pixels if (p[0]+p[1]+p[2])/3 < 40)
        metallic_px  = sum(1 for p in pixels
                           if abs(p[0]-p[1]) < 18 and abs(p[1]-p[2]) < 18
                           and 80 < (p[0]+p[1]+p[2])/3 < 200)
        white_px     = sum(1 for p in pixels if (p[0]+p[1]+p[2])/3 > 210)

        dark_ratio      = dark_px / n
        very_dark_ratio = very_dark_px / n
        metallic_ratio  = metallic_px / n
        white_ratio     = white_px / n

        # ── Scoring each candidate ──────────────────────────────────────────
        # Each rule adds/subtracts from a per-class score.

        scores = {
            "bag":       0,
            "phone":     0,
            "laptop":    0,
            "keys":      0,
            "earphones": 0,
            "clothing":  0,
            "document":  0,
            "charger":   0,   # charger / cable / power adapter
            "wallet":    0,   # wallet / purse / cardholder
        }

        # --- Bag / Backpack ---
        # Uniform dark fabric, large, no metallic shine, little background visible
        if dark_ratio > 0.35:                              scores["bag"] += 30
        if 0.55 < ratio < 1.80:                            scores["bag"] += 20
        if very_dark_ratio > 0.25:                         scores["bag"] += 15
        if color_var < 35:                                 scores["bag"] += 10
        if orig_w > 400:                                   scores["bag"] += 10
        if dark_ratio > 0.40 and very_dark_ratio > 0.12:  scores["bag"] += 25   # solid dark mass filling frame
        if metallic_ratio > 0.18:                          scores["bag"] -= 25   # fabric bags aren't metallic
        if white_ratio > 0.35:                             scores["bag"] -= 15   # bags don't sit on white bg

        # --- Smartphone ---
        # Tall/thin portrait shape, very dark glossy screen, compact frame
        if ratio < 0.60:               scores["phone"] += 50   # strong: very tall & thin
        if 0.40 < ratio < 0.65:        scores["phone"] += 20
        if very_dark_ratio > 0.40:     scores["phone"] += 25   # dark screen dominates
        if orig_w < 500:               scores["phone"] += 15   # compact
        if metallic_ratio > 0.20:      scores["phone"] += 10   # metal frame
        if ratio > 0.80:               scores["phone"] -= 20   # phones are portrait

        # --- Laptop ---
        # Landscape, dark lid fills the frame, low white background
        if ratio > 1.40:               scores["laptop"] += 35
        if 0.40 < brightness < 145:    scores["laptop"] += 10   # bright bg → not laptop
        if dark_ratio > 0.25:          scores["laptop"] += 15
        if orig_w > 600:               scores["laptop"] += 15
        if metallic_ratio > 0.15:      scores["laptop"] += 10
        if white_ratio > 0.30:         scores["laptop"] -= 30   # laptop fills frame, not on white bg
        if brightness > 145:           scores["laptop"] -= 15   # chargers sit on bright tables

        # --- Keys ---
        # Metallic, small, usually on a light background
        if metallic_ratio > 0.30:      scores["keys"] += 45
        if orig_w < 500:               scores["keys"] += 20
        if white_ratio > 0.35:         scores["keys"] += 15
        if color_var < 35:             scores["keys"] += 10
        if dark_ratio < 0.25:          scores["keys"] += 10

        # --- Earphones / Earbuds ---
        # Small, white or metallic, mono-colour, often white background
        if orig_w < 400 and orig_h < 400:  scores["earphones"] += 25
        if white_ratio > 0.30:             scores["earphones"] += 20
        if metallic_ratio > 0.15:          scores["earphones"] += 15
        if color_var < 30:                 scores["earphones"] += 15
        if dark_ratio < 0.20:              scores["earphones"] += 10

        # --- Clothing ---
        # Colourful, varied texture, no specific shape constraint
        if color_var > 55:             scores["clothing"] += 30
        if 0.5 < ratio < 2.0:         scores["clothing"] += 10
        if brightness > 120:           scores["clothing"] += 10
        if dark_ratio < 0.20:         scores["clothing"] += 10

        # --- Document / ID Card ---
        # Predominantly white/bright, portrait or near-square
        if white_ratio > 0.45:         scores["document"] += 35
        if 0.55 < ratio < 0.90:        scores["document"] += 25
        if brightness > 150:           scores["document"] += 20

        # --- Charger / Cable / Power Adapter ---
        # Thin dark cable + grey adapter body + bright white background (photographed on a desk).
        # CRITICAL gate: dark_ratio must be < 0.42 — a cable is a thin element (charger dark≈0.29),
        # whereas bags/phones fill the frame (dark≈0.50+). Any object with dark_ratio ≥ 0.42 is
        # NOT a charger; it's a solid dark object (bag, phone, laptop).
        if 0.10 < dark_ratio < 0.42 and metallic_ratio > 0.12:   scores["charger"] += 45
        if white_ratio > 0.45:                                    scores["charger"] += 25   # very white desk background
        if white_ratio > 0.35 and brightness > 140:               scores["charger"] += 20   # bright scene + white area
        if metallic_ratio > 0.15 and dark_ratio < 0.40:           scores["charger"] += 15   # adapter body visible
        if very_dark_ratio < 0.25 and dark_ratio > 0.10:          scores["charger"] += 10   # cable present but not solid black
        if dark_ratio > 0.42:                                     scores["charger"] -= 40   # solid dark mass = bag/phone
        if ratio < 0.65:                                          scores["charger"] -= 25   # portrait shape = likely phone

        # --- Wallet / Purse / Cardholder ---
        # Flat rectangular object, dark leather or fabric, compact
        if 1.45 < ratio < 2.30:        scores["wallet"] += 30
        if dark_ratio > 0.20:          scores["wallet"] += 15
        if brightness < 130:           scores["wallet"] += 10
        if orig_w < 600:               scores["wallet"] += 15
        if color_var < 45:             scores["wallet"] += 10
        if white_ratio > 0.40:         scores["wallet"] -= 20

        best  = max(scores, key=scores.get)
        score = scores[best]

        # Clamp confidence: maps raw score 0–120 → 62–88 %
        conf  = min(88, max(62, 62 + int(score * 0.22)))

        CLASSES = {
            "bag":       ("Backpack or Bag",          "Accessories", "Library, Cafeteria or Lecture Hall"),
            "phone":     ("Smartphone",               "Electronics", "Cafeteria or Lecture Hall"),
            "laptop":    ("Laptop",                   "Electronics", "Library or Computer Lab"),
            "keys":      ("Keys",                     "Keys",        "Parking Lot or Main Entrance"),
            "earphones": ("Earphones or Earbuds",     "Electronics", "Cafeteria or Sports Complex"),
            "clothing":  ("Clothing or Jacket",       "Clothing",    "Sports Complex or Lecture Hall"),
            "document":  ("Documents or ID Card",     "Documents",   "Admin Block or Library"),
            "charger":   ("Charger or Power Adapter", "Electronics", "Library or Computer Lab"),
            "wallet":    ("Wallet or Purse",          "Accessories", "Cafeteria or Admin Block"),
        }

        item_name, category, location = CLASSES[best]

        DESCS = {
            "bag":       "Dark-coloured bag or backpack detected — common item left in study areas.",
            "phone":     "Smartphone-shaped object detected — check nearby cafeteria or lecture hall.",
            "laptop":    "Laptop or portable computer detected — likely left in a study or lab area.",
            "keys":      "Metallic key-like object detected — check parking lots and reception desks.",
            "earphones": "Small earphone or earbud device detected — commonly left in common areas.",
            "clothing":  "Clothing or textile item detected — check the nearest lost property bin.",
            "document":  "Document, card or paper item detected — visit the Admin Block or Library.",
            "charger":   "Charger or power adapter detected — commonly left at study desks and labs.",
            "wallet":    "Wallet or purse detected — check the cafeteria, Admin Block or reception.",
        }

        return {
            "item":        item_name,
            "category":    category,
            "location":    location,
            "confidence":  conf,
            "description": DESCS[best],
        }
    except Exception:
        return None


@app.post("/lost-found-ai")
async def lost_found_ai(file: UploadFile = File(...)):
    contents = await file.read()
    image_name = _save_upload(file, contents)

    # Detect media type via PIL (more reliable than filename)
    try:
        pil_img = Image.open(io.BytesIO(contents))
        media_type = _MEDIA_TYPES.get((pil_img.format or "jpeg").lower(), "image/jpeg")
    except Exception:
        media_type = "image/jpeg"

    # ── Claude Vision analysis (primary, needs API key) ────────────────────
    result = None

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if api_key and api_key != "your_anthropic_api_key_here":
        try:
            client = anthropic.Anthropic(api_key=api_key)
            img_b64 = base64.standard_b64encode(contents).decode("utf-8")
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=512,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "image",
                         "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                        {"type": "text", "text": _AI_PROMPT},
                    ],
                }],
            )
            raw = msg.content[0].text.strip()
            # Strip markdown fences Claude sometimes wraps around JSON
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:].strip()
                raw = raw.strip()
            # Extract JSON object if there's surrounding text
            start = raw.find("{")
            end   = raw.rfind("}") + 1
            if start != -1 and end > start:
                raw = raw[start:end]
            parsed = json.loads(raw)
            result = {
                "item":        parsed.get("item", "Unknown Item"),
                "category":    parsed.get("category", "Other"),
                "location":    parsed.get("location", "Lost & Found Counter"),
                "confidence":  f"{parsed.get('confidence', 70)}%",
                "description": parsed.get("description", ""),
            }
        except Exception:
            result = None   # fall through to local analysis

    # ── YOLOv8 object detection (real ML, no API key needed) ───────────────
    if not result:
        yolo = _yolo_analyze(contents)
        if yolo:
            result = {
                "item":        yolo["item"],
                "category":    yolo["category"],
                "location":    yolo["location"],
                "confidence":  f"{yolo['confidence']}%",
                "description": yolo["description"],
            }

    # ── Local PIL-based analysis (final fallback) ───────────────────────────
    if not result:
        local = _local_analyze(contents)
        if local:
            result = {
                "item":        local["item"],
                "category":    local["category"],
                "location":    local["location"],
                "confidence":  f"{local['confidence']}%",
                "description": local["description"],
            }
        else:
            result = {
                "item":        "Personal Item",
                "category":    "Other",
                "location":    "Lost & Found Counter",
                "confidence":  "60%",
                "description": "Item detected but could not be classified. Please describe it manually when reporting.",
            }

    # NOTE: this endpoint only analyses the image — it does NOT persist a
    # LostItem. The user must explicitly submit "Report Lost" to log it,
    # otherwise every preview scan would create a duplicate database record.
    return {"filename": image_name, "result": result}


# ─────────────────────────────────────────────
# REPORT LOST ITEM
# ─────────────────────────────────────────────
@app.post("/report-lost")
async def report_lost(
    item_name:       str        = Form(...),
    description:     str        = Form(...),
    category:        str        = Form(...),
    location:        str        = Form(...),
    date_lost:       str        = Form(""),
    time_lost:       str        = Form(""),
    location_detail: str        = Form(""),
    reported_by:     str        = Form("Student"),
    image:           UploadFile = File(None),
):
    errors = {}
    if not item_name.strip():             errors["item_name"]    = "Item name is required"
    if len(description.strip()) < 10:     errors["description"]  = "Minimum 10 characters"
    if not category.strip():              errors["category"]     = "Category is required"
    if not location.strip():              errors["location"]     = "Location is required"
    if errors:
        raise HTTPException(status_code=422, detail=errors)

    image_name = ""
    if image and image.filename:
        try:
            image_name = _save_upload(image, await image.read())
        except Exception:
            pass

    db = SessionLocal()
    try:
        item = LostItem(
            item_name=item_name.strip(),   description=description.strip(),
            category=category.strip(),     location=location.strip(),
            date_lost=date_lost,           time_lost=time_lost,
            location_detail=location_detail, image_name=image_name,
            confidence="0%",               status="Lost",
            reported_by=reported_by,       created_at=_now(),
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {
            "message":   "Lost item reported successfully",
            "id":        item.id,
            "image_url": f"/uploads/{image_name}" if image_name else None,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        db.close()


# ─────────────────────────────────────────────
# REPORT FOUND ITEM  ← triggers matching
# ─────────────────────────────────────────────
@app.post("/report-found")
async def report_found(
    item_name:        str        = Form(...),
    description:      str        = Form(""),
    category:         str        = Form(...),
    location:         str        = Form(...),
    date_found:       str        = Form(""),
    additional_notes: str        = Form(""),
    reported_by:      str        = Form("Student"),
    image:            UploadFile = File(None),
):
    errors = {}
    if not item_name.strip():   errors["item_name"] = "Item name is required"
    if not category.strip():    errors["category"]  = "Category is required"
    if not location.strip():    errors["location"]  = "Location is required"
    if errors:
        raise HTTPException(status_code=422, detail=errors)

    image_name = ""
    if image and image.filename:
        try:
            image_name = _save_upload(image, await image.read())
        except Exception:
            pass

    db = SessionLocal()
    try:
        # ── 1. Save the found item ──────────────────────────────────────────
        found = FoundItem(
            item_name=item_name.strip(),    description=description.strip(),
            category=category.strip(),      location=location.strip(),
            date_found=date_found,          additional_notes=additional_notes,
            image_name=image_name,          status="Found",
            reported_by=reported_by,        created_at=_now(),
        )
        db.add(found)
        db.commit()
        db.refresh(found)

        # ── 2. Run AI matching against all open lost items ─────────────────
        raw_matches, scanned = run_matching(db, found, threshold=25.0)

        # ── 3. Persist matches + build response payload ────────────────────
        matches_payload = []
        for (lost, conf, method) in raw_matches:
            match_rec = ItemMatch(
                lost_item_id=lost.id,
                found_item_id=found.id,
                confidence=conf,
                match_method=method,
                status="pending",
                created_at=_now(),
            )
            db.add(match_rec)
            db.flush()   # get match_rec.id before commit

            matches_payload.append({
                "match_id":     match_rec.id,
                "confidence":   conf,
                "match_method": method,
                "lost_item":    _lost_dict(lost),
            })

        db.commit()

        return {
            "message":   "Found item reported successfully",
            "id":        found.id,
            "image_url": f"/uploads/{image_name}" if image_name else None,
            "scanned":   scanned,
            "matches":   matches_payload,
        }

    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        db.close()


# ─────────────────────────────────────────────
# GET ALL MATCHES
# ─────────────────────────────────────────────
@app.get("/matches")
def get_matches():
    db = SessionLocal()
    try:
        records = db.query(ItemMatch).order_by(ItemMatch.confidence.desc()).all()

        # De-duplicate matches that point at content-identical lost items
        # matched to the same found item (e.g. repeated AI-scanner previews
        # of the same object). Keep the earliest (lowest id) per signature,
        # but prefer one that already has a non-pending status.
        best_by_sig = {}
        for m in records:
            lost  = db.query(LostItem).filter(LostItem.id  == m.lost_item_id).first()
            found = db.query(FoundItem).filter(FoundItem.id == m.found_item_id).first()
            if not lost or not found:
                continue

            sig = (
                m.found_item_id,
                (lost.item_name or "").strip().lower(),
                (lost.category or "").strip().lower(),
                (lost.location or "").strip().lower(),
                round(m.confidence, 1),
            )

            existing = best_by_sig.get(sig)
            if existing is None:
                best_by_sig[sig] = (m, lost, found)
            else:
                existing_m = existing[0]
                # Prefer a non-pending status (accepted/rejected) over pending,
                # otherwise keep the earliest-created match.
                if existing_m.status == "pending" and m.status != "pending":
                    best_by_sig[sig] = (m, lost, found)
                elif existing_m.status == m.status and m.id < existing_m.id:
                    best_by_sig[sig] = (m, lost, found)

        result = [{
            "id":           m.id,
            "confidence":   m.confidence,
            "match_method": m.match_method,
            "status":       m.status,
            "created_at":   m.created_at or "",
            "lost_item":    _lost_dict(lost),
            "found_item":   _found_dict(found),
        } for (m, lost, found) in best_by_sig.values()]

        result.sort(key=lambda r: r["confidence"], reverse=True)
        return result
    finally:
        db.close()


# ─────────────────────────────────────────────
# GET MATCHES FOR A SPECIFIC FOUND ITEM
# ─────────────────────────────────────────────
@app.get("/matches/found/{found_item_id}")
def get_matches_for_found(found_item_id: int):
    db = SessionLocal()
    try:
        records = db.query(ItemMatch).filter(
            ItemMatch.found_item_id == found_item_id
        ).order_by(ItemMatch.confidence.desc()).all()

        result = []
        for m in records:
            lost = db.query(LostItem).filter(LostItem.id == m.lost_item_id).first()
            result.append({
                "match_id":     m.id,
                "confidence":   m.confidence,
                "match_method": m.match_method,
                "status":       m.status,
                "lost_item":    _lost_dict(lost) if lost else None,
            })
        return result
    finally:
        db.close()


# ─────────────────────────────────────────────
# UPDATE MATCH STATUS  (accept / reject)
# ─────────────────────────────────────────────
@app.put("/matches/{match_id}/status")
def update_match_status(match_id: int, body: MatchStatusUpdate):
    if body.status not in ("accepted", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="status must be accepted | rejected | pending")

    db = SessionLocal()
    try:
        match = db.query(ItemMatch).filter(ItemMatch.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        match.status = body.status

        if body.status == "accepted":
            # Mark both items as Matched so they stop appearing in future scans
            lost  = db.query(LostItem).filter(LostItem.id  == match.lost_item_id).first()
            found = db.query(FoundItem).filter(FoundItem.id == match.found_item_id).first()
            if lost:  lost.status  = "Matched"
            if found: found.status = "Matched"

        db.commit()
        return {"message": "Match status updated", "id": match_id, "status": body.status}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        db.close()


# ─────────────────────────────────────────────
# GET LOST ITEMS
# ─────────────────────────────────────────────
@app.get("/lost-items")
def get_lost_items():
    db = SessionLocal()
    items = db.query(LostItem).order_by(LostItem.id.desc()).all()
    db.close()
    return items


# ─────────────────────────────────────────────
# GET FOUND ITEMS
# ─────────────────────────────────────────────
@app.get("/found-items")
def get_found_items():
    db = SessionLocal()
    items = db.query(FoundItem).order_by(FoundItem.id.desc()).all()
    db.close()
    return items


# ─────────────────────────────────────────────
# MY LOST ITEMS  (per student, with match counts)
# ─────────────────────────────────────────────
@app.get("/my-lost-items/{reported_by}")
def my_lost_items(reported_by: str):
    db = SessionLocal()
    try:
        items = db.query(LostItem).filter(
            LostItem.reported_by == reported_by
        ).order_by(LostItem.id.desc()).all()

        result = []
        for item in items:
            pending_matches = db.query(ItemMatch).filter(
                ItemMatch.lost_item_id == item.id,
                ItemMatch.status == "pending",
            ).count()
            confirmed_matches = db.query(ItemMatch).filter(
                ItemMatch.lost_item_id == item.id,
                ItemMatch.status == "accepted",
            ).count()
            d = _lost_dict(item)
            d["match_count"]     = pending_matches
            d["confirmed_count"] = confirmed_matches
            result.append(d)
        return result
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────
# MENTOR SUPPORT
# ─────────────────────────────────────────────────────────────

_MOCK_MENTOR = {
    "id": 1,
    "name": "Dr. Aisha Patel",
    "designation": "Associate Professor",
    "department": "Computer Science & Engineering",
    "email": "aisha.patel@campus.edu",
    "phone": "+1-555-0192",
    "office": "Block A, Room 204",
    "availability": "available",
    "availability_hours": "Mon–Fri, 9 AM – 5 PM",
    "specialization": "Academic Stress, Career Guidance, Research",
}


@app.get("/mentor/{student_id}")
def get_mentor(student_id: str):
    return _MOCK_MENTOR


class SupportRequestBody(BaseModel):
    student_id: str
    message: str
    urgency: str = "medium"


@app.post("/support-request")
def create_support_request(body: SupportRequestBody):
    db = SessionLocal()
    try:
        req = SupportRequest(
            student_id=body.student_id,
            mentor_id=1,
            message=body.message.strip(),
            urgency=body.urgency,
            status="pending",
            created_at=_now(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return {"id": req.id, "status": "sent", "message": "Support request sent to your mentor."}
    finally:
        db.close()


class MeetingScheduleBody(BaseModel):
    student_id: str
    preferred_date: str
    preferred_time: str
    topic: str


@app.post("/schedule-meeting")
def schedule_meeting(body: MeetingScheduleBody):
    db = SessionLocal()
    try:
        mtg = MeetingSchedule(
            student_id=body.student_id,
            mentor_id=1,
            preferred_date=body.preferred_date,
            preferred_time=body.preferred_time,
            topic=body.topic.strip(),
            status="pending",
            created_at=_now(),
        )
        db.add(mtg)
        db.commit()
        db.refresh(mtg)
        return {
            "id": mtg.id,
            "status": "scheduled",
            "message": f"Meeting request sent for {body.preferred_date} at {body.preferred_time}.",
        }
    finally:
        db.close()

# ─────────────────────────────────────────────
# NOTIFICATIONS  (generated from DB events)
# ─────────────────────────────────────────────
@app.get("/notifications/{reported_by}")
def get_notifications(reported_by: str):
    db = SessionLocal()
    try:
        notifications = []
        nid = 1

        lost_items = db.query(LostItem).filter(
            LostItem.reported_by == reported_by
        ).order_by(LostItem.id.desc()).all()

        for item in lost_items:
            # 1. Submission notification (always present)
            notifications.append({
                "id":      nid,
                "type":    "system",
                "title":   "Report Submitted",
                "message": f"Your lost item report for '{item.item_name}' has been logged. "
                           f"AI matching is now active across all found item reports.",
                "time":    item.created_at or "",
                "is_read": True,
                "action":  None,
            })
            nid += 1

            # 2. Match notifications for this item
            matches = db.query(ItemMatch).filter(
                ItemMatch.lost_item_id == item.id
            ).order_by(ItemMatch.id.desc()).all()

            for match in matches:
                found = db.query(FoundItem).filter(
                    FoundItem.id == match.found_item_id
                ).first()
                loc = f" at {found.location}" if found and found.location else ""

                if match.status == "accepted":
                    notifications.append({
                        "id":      nid,
                        "type":    "found",
                        "title":   "Item Located & Matched!",
                        "message": f"Your '{item.item_name}' was matched with a found item{loc}. "
                                   f"Visit the Lost & Found desk with your Student ID to collect.",
                        "time":    match.created_at or "",
                        "is_read": False,
                        "action":  "View Matches",
                    })
                elif match.status == "pending":
                    conf = round(match.confidence, 1)
                    notifications.append({
                        "id":      nid,
                        "type":    "match",
                        "title":   f"AI Match Detected — {conf}% confidence",
                        "message": f"Your '{item.item_name}' may match a found item{loc}. "
                                   f"Review the match and confirm if it's yours.",
                        "time":    match.created_at or "",
                        "is_read": False,
                        "action":  "View Matches",
                    })
                nid += 1

        # Sort newest first
        notifications.sort(key=lambda x: x["time"], reverse=True)
        return notifications
    finally:
        db.close()
