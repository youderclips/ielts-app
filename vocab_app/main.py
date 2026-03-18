"""Vocab Explorer — FastAPI entry point."""

import os
import sys
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse


def _resolve_base():
    """Resolve paths for both dev and PyInstaller frozen mode."""
    if getattr(sys, "frozen", False):
        # PyInstaller onedir: _MEIPASS = _internal/ directory
        meipass = Path(sys._MEIPASS)
        return meipass / "vocab_app", meipass
    return Path(__file__).parent, Path(__file__).parent.parent


BASE, ROOT = _resolve_base()

app = FastAPI(title="IELTS Vocab Explorer")

# Load vocab_db.json into memory at startup
VOCAB_DB: dict = {}


@app.on_event("startup")
async def _load():
    global VOCAB_DB
    # VOCAB_DB_PATH env var is set by the Tauri sidecar entry point so that the
    # bundled data file is found regardless of which PyInstaller exe is running.
    env_path = os.environ.get("VOCAB_DB_PATH")
    if env_path:
        db_path = Path(env_path)
    else:
        db_path = ROOT / "analysis" / "vocab_db.json"
    with open(db_path, "r", encoding="utf-8") as f:
        VOCAB_DB = json.load(f)
    print(f"[vocab_app] Loaded {len(VOCAB_DB)} words from {db_path}")


# Mount static files only when the directory exists (not needed in sidecar mode)
_static_dir = BASE / "static"
if _static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")

# Import and include API router
from vocab_app.api import router as api_router  # noqa: E402

app.include_router(api_router, prefix="/api")


@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = BASE / "templates" / "index.html"
    if not html_path.exists():
        return HTMLResponse("<p>Sidecar API server running. Use the Tauri app UI.</p>")
    return html_path.read_text(encoding="utf-8")
