from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

pedido_plato = Table(
    'pedido_plato',
    Base.metadata,
    Column('pedido_id', Integer, ForeignKey('pedidos.id')),
    Column('plato_id', Integer, ForeignKey('platos.id'))
)

class Pedido(Base):
    __tablename__ = 'pedidos'

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey('users.id'))
    estado = Column(String, default="pendiente")  # 'pendiente', 'en_preparacion', 'listo'
    total = Column(Float)
    notas = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    usuario = relationship("User", back_populates="pedidos")
    platos = relationship("Pedido", secondary=pedido_plato, back_populates="platos")