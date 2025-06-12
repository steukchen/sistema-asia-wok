from fastapi import FastAPI
from app.api.endpoints import auth
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

app = FastAPI(title="Asia Wok API", version = "0.1.0")
app.include_router(auth.router)

@app.get("/")
def read_root():
    return{"message": "Asia Wok API is ON!!"}