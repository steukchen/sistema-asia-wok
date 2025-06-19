from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Para manejar CORS, muy importante para el frontend
from app.api.endpoints import auth
from app.api.endpoints import pedidos
from app.api.endpoints import platos
from app.api.endpoints import users

from app.models.database import Base, engine

app = FastAPI(
    title="Sistema de Gestión Asia Wok",
    description="API para la gestión interna de pedidos, platos y usuarios.",
    version="0.1.0",
)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permite todos los encabezados
)

app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(pedidos.router, prefix="/pedidos", tags=["Pedidos"])


app.include_router(platos.router, prefix="/platos", tags=["Platos"])
app.include_router(users.router, prefix="/users", tags=["Usuarios"])

# --- Evento de inicio de la aplicación para crear tablas ---
@app.on_event("startup")
async def startup_event():
    # Crea todas las tablas definidas en los modelos si no existen

    # o que Base.metadata.create_all(engine) tenga acceso a ellos.
    # El __init__.py en app.models ayuda a exponerlos.
    Base.metadata.create_all(bind=engine)
    print("Base de datos y tablas verificadas/creadas.")


# --- Endpoint de prueba (opcional) ---
@app.get("/")
async def read_root():
    return {"message": "Bienvenido al Sistema de Gestión Asia Wok API"}
