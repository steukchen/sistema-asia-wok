# backend/app/models/plato.py
from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Plato(Base):
    __tablename__ = "platos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)  # Ej: 'entrada', 'principal', 'postre'
    is_active = Column(Boolean, default=True) 


