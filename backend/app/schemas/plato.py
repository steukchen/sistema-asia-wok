from pydantic import BaseModel, Field
from typing import Optional

# Esquema para crear un nuevo plato
class PlatoCreate(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio: float = Field(..., gt=0, description="El precio debe ser mayor que cero")
    categoria: str = Field(..., examples=["entrada", "principal", "postre", "bebida"])
    is_active: bool = True 

# Esquema para actualizar un plato
class PlatoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio: Optional[float] = Field(None, gt=0)
    categoria: Optional[str] = Field(None, examples=["entrada", "principal", "postre", "bebida"])
    is_active: Optional[bool] = None

# Esquema para la salida de datos de un plato
class PlatoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    categoria: str # <--- AÑADIR ESTE CAMPO
    is_active: bool
    
    class Config:
        from_attributes = True