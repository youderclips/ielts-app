# -*- mode: python ; coding: utf-8 -*-
#
# PyInstaller spec for vocab-server sidecar.
#
# Build command (run from the ielts-app repo root):
#   pyinstaller sidecar/vocab_server.spec --distpath sidecar/dist --workpath sidecar/build
#
# Output: sidecar/dist/vocab-server[.exe]  (onefile)
# The CI workflow renames it to vocab-server-{target_triple}[.exe]
# and copies it into src-tauri/sidecar/.
#
# Directory layout assumed at build time:
#   ielts-app/              <- SPEC_DIR parent / REPO_ROOT
#     sidecar/
#       vocab_server.py     <- entry point
#       vocab_server.spec   <- this file
#     vocab_app/            <- FastAPI app package (copied from 雅思材料/vocab_app/)
#       __init__.py
#       main.py
#       api.py
#     analysis/
#       vocab_db.json       <- 14 MB vocabulary database (tracked via git lfs)

import os

# Paths relative to the spec file location (ielts-app/sidecar/)
SPEC_DIR = os.path.dirname(os.path.abspath(SPEC))   # ielts-app/sidecar/
REPO_ROOT = os.path.dirname(SPEC_DIR)                # ielts-app/

VOCAB_APP_DIR = os.path.join(REPO_ROOT, "vocab_app")
VOCAB_DB_SRC  = os.path.join(REPO_ROOT, "analysis", "vocab_db.json")

a = Analysis(
    [os.path.join(SPEC_DIR, "vocab_server.py")],
    pathex=[REPO_ROOT],
    binaries=[],
    datas=[
        # vocab_db.json → unpacked to sys._MEIPASS/data/vocab_db.json at runtime
        (VOCAB_DB_SRC, "data"),
        # vocab_app package → sys._MEIPASS/vocab_app/
        (VOCAB_APP_DIR, "vocab_app"),
    ],
    hiddenimports=[
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "fastapi",
        "fastapi.staticfiles",
        "fastapi.responses",
        "starlette",
        "starlette.routing",
        "starlette.middleware",
        "starlette.staticfiles",
        "anyio",
        "anyio._backends._asyncio",
        "email.mime.text",
        "email.mime.multipart",
        "vocab_app.main",
        "vocab_app.api",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "tkinter",
        "matplotlib",
        "numpy",
        "pandas",
        "scipy",
        "PIL",
        "cv2",
        "torch",
        "tensorflow",
    ],
    noarchive=False,
    optimize=1,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="vocab-server",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,       # UPX can trigger AV false positives; keep off
    console=True,    # keep console — Tauri reads stdout for readiness detection
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
