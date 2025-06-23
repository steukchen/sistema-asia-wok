from sqlalchemy import Column, Integer, String, Boolean
from .database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String)  # 'admin', 'mesonero', 'cajero' o 'cocina'
    nombre = Column(String)
    pedidos = relationship("Pedido", back_populates="usuario")
    is_active = Column(Boolean, default=True)

    pedidos = relationship("Pedido", back_populates="usuario")