from .database import SessionLocal

def get_db():
    """
    Proveedor de sesión de base de datos para inyección de dependencias.
    Usar como: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()