from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Plato(Base):
    __tablename__ = "platos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)  # Ej: 'entrada', 'principal', 'postre'
    is_active = Column(Boolean, default=True)  # Indica si el plato está activo o no

    pedidos = relationship("Pedido", secondary="pedido_plato", back_populates="platos") 