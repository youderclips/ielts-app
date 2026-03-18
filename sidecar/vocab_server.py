"""Vocab API server — Tauri sidecar entry point.

Starts FastAPI/uvicorn on 127.0.0.1:11435.
Prints "READY" to stdout once the server is listening (Tauri can detect this).
No browser auto-open — Tauri's webview is the frontend.
"""

import sys
import os

# Ensure the project root (雅思材料/) is on sys.path so `vocab_app` is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

HOST = "127.0.0.1"
PORT = 11435


def main():
    import uvicorn
    from vocab_app.main import app  # noqa: F401 — triggers VOCAB_DB load

    # Flush stdout so Tauri sees the print immediately
    print(f"[vocab-server] starting on {HOST}:{PORT}", flush=True)

    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
