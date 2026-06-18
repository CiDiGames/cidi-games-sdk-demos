import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.callbacks.router import router as callbacks_router
from src.config import get_settings
from src.demo.router import router as demo_router

app = FastAPI(
    title="CIDI Python Demo Server",
    description="FastAPI demo server for CIDI Game SDK server-side OpenAPI integration.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo_router)
app.include_router(callbacks_router)


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.port, reload=True)
