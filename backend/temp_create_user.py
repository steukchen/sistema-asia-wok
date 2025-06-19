import sys
import os
# Añadir la ruta del proyecto al PATH para las importaciones
# Esto es crucial para que el script pueda importar módulos como 'app.core.security'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))


from app.core.security import get_password_hash
from app.models.database import SessionLocal, engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    hashed_password_admin = get_password_hash("AsiaWok123") 
    
    # Crea un usuario administrador
    admin_user = User(
        email="admin@asiawok.com",
        hashed_password=hashed_password_admin,
        role="admin",
        name="Admin General",
        is_active=True
    )
    
    # Crea un usuario mesonero
    mesonero_user = User(
        email="mesonero@asiawok.com",
        hashed_password=get_password_hash("MesoneroPass123"),
        role="mesonero",
        name="Juan Mesonero",
        is_active=True
    )

    # Crea un usuario cajero
    cajero_user = User(
        email="cajero@asiawok.com",
        hashed_password=get_password_hash("CajeroPass123"),
        role="cajero",
        name="Maria Cajera",
        is_active=True
    )
    
    # Crea un usuario cocina
    cocina_user = User(
        email="cocina@asiawok.com",
        hashed_password=get_password_hash("CocinaPass123"),
        role="cocina",
        name="Pedro Cocinero",
        is_active=True
    )

    # Añade todos los usuarios a la sesión y commitea
    db.add_all([admin_user, mesonero_user, cajero_user, cocina_user])
    db.commit()

    # Opcional: Refresca los objetos para obtener sus IDs asignados por la DB
    db.refresh(admin_user)
    db.refresh(mesonero_user)
    db.refresh(cajero_user)
    db.refresh(cocina_user)

    print(f"Usuario Admin creado: {admin_user.email} (ID: {admin_user.id})")
    print(f"Usuario Mesonero creado: {mesonero_user.email} (ID: {mesonero_user.id})")
    print(f"Usuario Cajero creado: {cajero_user.email} (ID: {cajero_user.id})")
    print(f"Usuario Cocina creado: {cocina_user.email} (ID: {cocina_user.id})")

except Exception as e:
    # Si algo sale mal, haz rollback para no dejar cambios parciales
    db.rollback()
    print(f"Error al crear usuarios: {e}")
finally:
    # Siempre cierra la sesión de la base de datos
    db.close()
