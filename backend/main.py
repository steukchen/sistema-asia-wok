from fastapi import FastAPI

app = FastAPI(title="Asia Wok API", version = "0.1.0")

@app.get("/")
def read_root():
    return{"message": "Asia Wok API is ON!!"}