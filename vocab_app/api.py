"""API routes for Vocab Explorer."""

from __future__ import annotations

import random
from collections import defaultdict
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# --- In-memory indexes (built on first request) ---
_indexes_ready = False
_by_topic: dict[str, list[str]] = defaultdict(list)
_by_band: dict[str, list[str]] = defaultdict(list)
_all_words: list[str] = []
_topic_counts: dict[str, int] = {}


def _ensure_indexes():
    global _indexes_ready, _all_words, _topic_counts
    if _indexes_ready:
        return
    from vocab_app.main import VOCAB_DB

    for word, entry in VOCAB_DB.items():
        _all_words.append(word)
        band = entry.get("band_level", "")
        if band:
            _by_band[band].append(word)
        for t in entry.get("topics", []):
            _by_topic[t].append(word)
    _topic_counts = {t: len(ws) for t, ws in _by_topic.items()}
    _indexes_ready = True


def _brief(word: str, entry: dict) -> dict:
    """Compact card representation."""
    return {
        "word": word,
        "meaning_cn": entry.get("meaning_cn", ""),
        "score": entry["corpus"]["score"],
        "freq": entry["corpus"]["freq"],
        "spread": entry["corpus"]["spread"],
        "band_level": entry.get("band_level", ""),
        "tier": entry.get("tier", 0),
        "is_awl": entry["corpus"].get("is_awl", False),
        "is_answer_word": entry.get("is_answer_word", False),
        "topics": entry.get("topics", []),
        "trend": entry.get("trend", ""),
        "primary_section": entry.get("primary_section", ""),
    }


# ---- Endpoints ----

@router.get("/stats")
async def stats():
    _ensure_indexes()
    from vocab_app.main import VOCAB_DB

    awl_count = sum(1 for e in VOCAB_DB.values() if e["corpus"].get("is_awl"))
    ans_count = sum(1 for e in VOCAB_DB.values() if e.get("is_answer_word"))
    return {
        "total_words": len(VOCAB_DB),
        "awl_count": awl_count,
        "answer_word_count": ans_count,
        "topic_count": len(_topic_counts),
    }


@router.get("/topics")
async def topics():
    _ensure_indexes()
    result = []
    for t, count in sorted(_topic_counts.items(), key=lambda x: -x[1]):
        result.append({"topic": t, "count": count})
    return result


@router.get("/search")
async def search(
    q: str = "",
    topic: str = "",
    band: str = "",
    section: str = "",
    awl: Optional[bool] = None,
    answer: Optional[bool] = None,
    sort: str = "score",
    page: int = 1,
    size: int = 24,
):
    _ensure_indexes()
    from vocab_app.main import VOCAB_DB

    # Start with all words or filtered set
    if topic and topic in _by_topic:
        candidates = _by_topic[topic]
    elif band and band in _by_band:
        candidates = _by_band[band]
    else:
        candidates = _all_words

    results = []
    q_lower = q.lower().strip()
    for w in candidates:
        entry = VOCAB_DB[w]
        # Text search
        if q_lower:
            if not (
                q_lower in w.lower()
                or q_lower in entry.get("meaning_cn", "")
            ):
                continue
        # Filters
        if band and entry.get("band_level") != band:
            continue
        if topic and topic not in entry.get("topics", []):
            continue
        if section:
            sections = entry["corpus"].get("sections", {})
            if sections.get(section, 0) == 0:
                continue
        if awl is not None and entry["corpus"].get("is_awl", False) != awl:
            continue
        if answer is not None and entry.get("is_answer_word", False) != answer:
            continue
        results.append((w, entry))

    # Sort
    if sort == "score":
        results.sort(key=lambda x: -x[1]["corpus"]["score"])
    elif sort == "freq":
        results.sort(key=lambda x: -x[1]["corpus"]["freq"])
    elif sort == "alpha":
        results.sort(key=lambda x: x[0])

    total = len(results)
    start = (page - 1) * size
    page_items = results[start : start + size]

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [_brief(w, e) for w, e in page_items],
    }


@router.get("/word/{word}")
async def word_detail(word: str):
    from vocab_app.main import VOCAB_DB

    entry = VOCAB_DB.get(word)
    if not entry:
        # Try case-insensitive
        for k, v in VOCAB_DB.items():
            if k.lower() == word.lower():
                entry = v
                word = k
                break
    if not entry:
        return {"error": "not found"}
    return {"word": word, **entry}


@router.get("/random")
async def random_words(
    topic: str = "",
    band: str = "",
    count: int = 10,
):
    _ensure_indexes()
    from vocab_app.main import VOCAB_DB

    if topic and topic in _by_topic:
        pool = _by_topic[topic]
    elif band and band in _by_band:
        pool = _by_band[band]
    else:
        pool = _all_words

    chosen = random.sample(pool, min(count, len(pool)))
    return [_brief(w, VOCAB_DB[w]) for w in chosen]
