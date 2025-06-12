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
    estado: Optional[str] = None # 'pendiente', 'entregado'
    notas: Optional[str] = None

class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    estado: str
    total: float
    notas: Optional[str]
    fecha_creacion: datetime
    
    # Si quieres incluir los detalles del usuario y los platos asociados en la respuesta:
    usuario: UserOut 
    platos: List[PlatoOut] 

    class Config:
        from_attributes = True 