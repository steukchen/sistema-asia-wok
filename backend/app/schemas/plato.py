from pydantic import BaseModel
from typing import Optional

# Esquema para crear un nuevo plato
class PlatoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    is_active: Optional[bool] = True

# Esquema para actualizar un plato
class PlatoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    is_active: Optional[bool] = None

# Esquema para la salida de datos de un plato
class PlatoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    is_active: bool
    
    class Config:
        from_attributes = True