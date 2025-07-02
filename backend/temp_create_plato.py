import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app.models.database import SessionLocal, engine, Base
from app.models.plato import Plato

Base.metadata.create_all(bind=engine) # Asegúrate de que las tablas existan

db = SessionLocal()
try:
    plato1 = Plato(
        nombre="Arroz Frito Asia Wok",
        descripcion="Delicioso arroz frito con vegetales y pollo.",
        precio=12.50,
        categoria="Plato Principal",
        is_active=True
    )
    plato2 = Plato(
        nombre="Rollitos Primavera",
        descripcion="Rollitos crujientes de vegetales.",
        precio=5.00,
        categoria="Entrada",
        is_active=True
    )
    db.add_all([plato1, plato2])
    db.commit()
    db.refresh(plato1)
    db.refresh(plato2)
    print(f"Plato creado: {plato1.nombre} con ID {plato1.id}")
    print(f"Plato creado: {plato2.nombre} con ID {plato2.id}")
except Exception as e:
    db.rollback()
    print(f"Error al crear plato: {e}")
finally:
    db.close()