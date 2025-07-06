# backend/app/schemas/pedido.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from .user import UserOut
from .plato import PlatoOut

# esquema para representar un ítem dentro de un pedido al crearlo
class OrderItemCreate(BaseModel):
    plato_id: int = Field(..., description="ID del plato")
    cantidad: int = Field(..., gt=0, description="Cantidad del plato en el pedido")

# esquema para la salida de un ítem de pedido (incluye detalles del plato)
class OrderItemOut(BaseModel):
    plato_id: int = Field(..., description="ID del plato")
    cantidad: int = Field(..., description="Cantidad del plato en el pedido")
    plato: PlatoOut = Field(..., description="Detalles del plato") # Detalles completos del plato

    class Config:
        from_attributes = True 

# Esquema para la creación de un nuevo pedido
class PedidoCreate(BaseModel):
    numero_mesa: int = Field(..., gt=0, description="Número de mesa asociado al pedido")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Lista de platos y sus cantidades en el pedido")
    notas: Optional[str] = Field(None, max_length=500, description="Notas adicionales para el pedido")

# Esquema para la actualización de un pedido
class PedidoUpdate(BaseModel):
    numero_mesa: Optional[int] = Field(None, gt=0, description="Nuevo número de mesa")
    estado: Optional[str] = Field(None, description="Nuevo estado del pedido: 'pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'")
    notas: Optional[str] = Field(None, max_length=500, description="Nuevas notas para el pedido")
    items: Optional[List[OrderItemCreate]] = Field(None, description="Lista de ítems actualizados (plato_id y cantidad)")


# Esquema para la salida de un pedido (respuesta del API)
class PedidoOut(BaseModel):
    id: int = Field(..., description="ID único del pedido")
    usuario_id: int = Field(..., description="ID del usuario que creó el pedido")
    numero_mesa: int = Field(..., description="Número de mesa asociado al pedido")
    estado: str = Field(..., description="Estado actual del pedido")
    total: float = Field(..., description="Costo total del pedido")
    notas: Optional[str] = Field(None, description="Notas adicionales del pedido")
    fecha_creacion: datetime = Field(..., description="Fecha y hora de creación del pedido")
    fecha_actualizacion: datetime = Field(..., description="Fecha y hora de la última actualización del pedido")
    
    usuario: UserOut = Field(..., description="Detalles del usuario que creó el pedido")
    items: List[OrderItemOut] = Field(..., description="Lista de ítems (platos con cantidad y detalles) incluidos en el pedido") 
    
    class Config:
        from_attributes = True 
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

