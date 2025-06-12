import logging
from app.models.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    logger.info("¡Tablas creadas exitosamente!")

if __name__ == "__main__":
    init_db()