"""
matching.py — Text-similarity matching engine for Lost & Found.

Weights:
  Category exact match   → 30 pts
  Item name similarity   → 30 pts
  Description similarity → 25 pts
  Location match         → 15 pts
  Both items have images →  5 pts bonus (capped at 99.9)

Minimum threshold to surface a match: 25 pts (configurable).
"""

from difflib import SequenceMatcher
import re

# ──────────────────────────────────────────────────────────────────────────────
# TEXT UTILITIES
# ──────────────────────────────────────────────────────────────────────────────

_STOP = {
    'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'of', 'and', 'or',
    'with', 'my', 'i', 'was', 'had', 'have', 'near', 'found', 'lost',
    'item', 'this', 'that', 'its', 'by', 'to', 'for', 'from', 'up',
    'some', 'one', 'two', 'been', 'are', 'has', 'not', 'but', 'its',
    'very', 'also', 'just', 'use', 'used', 'using', 'via',
}

_LOCATION_GENERICS = {'block', 'hall', 'room', 'area', 'lab', 'centre', 'center'}


def _tokenize(text: str) -> set:
    """Lower-case word tokens, stop-words removed, length ≥ 3."""
    words = re.findall(r'\b[a-z0-9]+\b', text.lower())
    return {w for w in words if w not in _STOP and len(w) >= 3}


def _seq_ratio(a: str, b: str) -> float:
    """SequenceMatcher cosine on raw strings."""
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _jaccard(a: str, b: str) -> float:
    """Jaccard similarity on meaningful tokens."""
    ta, tb = _tokenize(a), _tokenize(b)
    if not (ta or tb):
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _text_sim(a: str, b: str) -> float:
    """Weighted combination: 55 % sequence ratio + 45 % token Jaccard."""
    return _seq_ratio(a, b) * 0.55 + _jaccard(a, b) * 0.45


def _location_score(loc_a: str, loc_b: str) -> float:
    """1.0 = exact match, 0.5 = same campus area, 0.0 = unrelated."""
    if not loc_a or not loc_b:
        return 0.0
    a, b = loc_a.lower().strip(), loc_b.lower().strip()
    if a == b:
        return 1.0
    common = _tokenize(loc_a) & _tokenize(loc_b)
    meaningful = common - _LOCATION_GENERICS
    if meaningful:
        return 0.5
    return 0.0


# ──────────────────────────────────────────────────────────────────────────────
# CORE SCORING
# ──────────────────────────────────────────────────────────────────────────────

def calculate_confidence(lost, found) -> tuple:
    """
    Returns (confidence: float 0–99.9, match_method: str).
    `lost` and `found` are SQLAlchemy ORM objects (LostItem / FoundItem).
    """
    score = 0.0
    reasons = []

    # ── Category (30 pts) ─────────────────────────────────────────────────────
    cat_l = (lost.category or "").strip().lower()
    cat_f = (found.category or "").strip().lower()
    if cat_l and cat_f and cat_l == cat_f:
        score += 0.30
        reasons.append("Category")

    # ── Item Name (30 pts) ────────────────────────────────────────────────────
    name_sim = _text_sim(lost.item_name or "", found.item_name or "")
    score += name_sim * 0.30
    if name_sim >= 0.40:
        reasons.append("Name")

    # ── Description (25 pts) ──────────────────────────────────────────────────
    desc_sim = _text_sim(lost.description or "", found.description or "")
    score += desc_sim * 0.25
    if desc_sim >= 0.30:
        reasons.append("Description")

    # ── Location (15 pts) ─────────────────────────────────────────────────────
    loc = _location_score(lost.location or "", found.location or "")
    score += loc * 0.15
    if loc > 0:
        reasons.append("Location")

    # ── Image evidence bonus (up to +5 pts) ───────────────────────────────────
    if lost.image_name and found.image_name:
        score = min(score + 0.05, 0.999)

    confidence  = round(min(score * 100, 99.9), 1)
    match_method = " + ".join(reasons) if reasons else "Partial Text"
    return confidence, match_method


# ──────────────────────────────────────────────────────────────────────────────
# BATCH MATCHING
# ──────────────────────────────────────────────────────────────────────────────

def run_matching(db_session, found_item, threshold: float = 25.0) -> tuple:
    """
    Compare `found_item` against every open LostItem in the database.

    Returns:
        matches  : list of (LostItem, confidence, method) — sorted desc, top 10
        scanned  : total number of lost items evaluated
    """
    from database import LostItem   # local import avoids circular dependency

    lost_items = db_session.query(LostItem).filter(
        LostItem.status == "Lost"
    ).all()

    scanned = len(lost_items)
    results = []

    for lost in lost_items:
        conf, method = calculate_confidence(lost, found_item)
        if conf >= threshold:
            results.append((lost, conf, method))

    results.sort(key=lambda x: x[1], reverse=True)
    return results[:10], scanned
