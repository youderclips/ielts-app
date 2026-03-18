"""Vocab API server — Tauri sidecar entry point.

Starts FastAPI/uvicorn on 127.0.0.1:11435.
Prints a ready message to stdout once the server is listening so Tauri can
detect startup completion.

Works in two modes:
  1. Dev mode  — run directly with Python; vocab_app/ is on sys.path via the
                 project root (雅思材料/).
  2. Frozen mode — compiled by PyInstaller into a single-file exe; vocab_app/
                   is bundled inside sys._MEIPASS and vocab_db.json sits at
                   sys._MEIPASS/data/vocab_db.json.
"""

import sys
import os

# ---------------------------------------------------------------------------
# Path setup — must happen before any vocab_app imports
# ---------------------------------------------------------------------------

if getattr(sys, "frozen", False):
    # PyInstaller onefile: sys._MEIPASS is the temp extraction directory.
    # vocab_app/ is bundled there by the spec's datas entry.
    _MEIPASS = sys._MEIPASS  # type: ignore[attr-defined]
    # Make bundled packages importable
    if _MEIPASS not in sys.path:
        sys.path.insert(0, _MEIPASS)
    # Tell vocab_app where vocab_db.json lives (overrides its default logic)
    os.environ.setdefault("VOCAB_DB_PATH", os.path.join(_MEIPASS, "data", "vocab_db.json"))
else:
    # Dev / source mode: resolve project root (雅思材料/) from this file's location.
    # __file__ = ielts-app/sidecar/vocab_server.py → two levels up = 雅思材料/
    _PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    if _PROJECT_ROOT not in sys.path:
        sys.path.insert(0, _PROJECT_ROOT)

HOST = "127.0.0.1"
PORT = 11435


def main() -> None:
    import uvicorn
    from vocab_app.main import app  # noqa: F401 — triggers VOCAB_DB load on startup

    print(f"[vocab-server] starting on {HOST}:{PORT}", flush=True)

    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
