from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.review import router as review_router

app = FastAPI(title="CodeLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router, prefix="/api")
