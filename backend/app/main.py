from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as api_router

app = FastAPI(title="Olympic Data API")

# Configuração CORS para permitir que o frontend (localhost:3000) acesse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Olympic Data API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

