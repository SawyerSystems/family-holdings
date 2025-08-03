#!/usr/bin/env python
"""Test imports for the backend."""

try:
    import fastapi
    import uvicorn
    from fastapi.middleware.cors import CORSMiddleware
    print("Successfully imported FastAPI and Uvicorn!")
    print(f"FastAPI version: {fastapi.__version__}")
    print(f"Uvicorn version: {uvicorn.__version__}")
except ImportError as e:
    print(f"Import error: {e}")
