from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

class OrderItem(Base):
    __tablename__ = 'order_items'

    pedido_id = Column(Integer, ForeignKey('pedidos.id'), primary_key=True)
    plato_id = Column(Integer, ForeignKey('platos.id'), primary_key=True)
    cantidad = Column(Integer, nullable=False, comment="Cantidad del plato en este pedido")

    # Relaciones con Pedido y Plato
    pedido = relationship("Pedido", back_populates="items")
    plato = relationship("Plato")

class Pedido(Base):
    __tablename__ = 'pedidos'

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey('users.id'))
    numero_mesa = Column(Integer, nullable=False, comment="Número de mesa asociado al pedido")
    estado = Column(String, default="pendiente", comment="Estado actual del pedido: 'pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'")
    total = Column(Float, comment="Costo total del pedido")
    notas = Column(String, nullable=True, comment="Notas adicionales para el pedido")
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc), comment="Fecha y hora de creación del pedido")
    fecha_actualizacion = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), comment="Fecha y hora de la última actualización del pedido")

    # Relaciones
    usuario = relationship("User", back_populates="pedidos")
    items = relationship("OrderItem", back_populates="pedido", cascade="all, delete-orphan")


