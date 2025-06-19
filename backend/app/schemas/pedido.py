from pydantic import (Field, validator)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserOut
from .plato import PlatoOut


class PedidoCreate(BaseModel):
    platos_ids: List[int]
    notas: Optional[str] = None

# Esquema para la actualización parcial de un pedido (por ejemplo, cambiar el estado)
class PedidoUpdate(BaseModel):
    estado: Optional[str] = None # 'pendiente', 'listo'
    notas: Optional[str] = None

class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    estado: str
    total: float
    notas: Optional[str]
    fecha_creacion: str 
    
    # Si quieres incluir los detalles del usuario y los platos asociados en la respuesta:
    usuario: UserOut 
    platos: List[PlatoOut] 
    
    @validator('fecha_creacion', pre=True)
    def format_fecha_creacion(cls, value):
        """Convierte datetime a string con formato YYYY-MM-DD"""
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d")
        return value
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d")
        }
        allow_population_by_field_name = True