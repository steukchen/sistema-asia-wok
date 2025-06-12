from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.models.user import User
from app.models.db_utils import get_db
from app.schemas.tokens import TokenData
from sqlalchemy.orm import Session

# --- Configuración de Hashing de Contraseñas ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password): # Verifica si una contraseña en texto plano coincide con una contraseña hasheada.
    return pwd_context.verify(plain_password, hashed_password) 

def get_password_hash(password): # Genera un hash seguro para una contraseña en texto plano.
    return pwd_context.hash(password)

# --- Funciones de JWT ---
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire}) # Añadir la fecha de expiración
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Dependencia para la autenticación de usuario ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") # Asegúrate que esta URL coincida con tu endpoint de login

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)

    except JWTError:
        raise credentials_exception
    
    # Buscar el usuario en la base de datos usando el email del token
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception # El usuario no existe en la DB

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)): 
        # Devuelve el usuario actualmente autenticado (activo).

    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario inactivo")
    
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
        # Requiere que el usuario sea un 'admin'.
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos de administrador")
    
    return current_user

def get_current_cocina_user(current_user: User = Depends(get_current_user)):
        # Requiere que el usuario sea 'admin' o 'cocina'.
    if current_user.role not in ["admin", "cocina"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta sección (cocina)")
    
    return current_user

def get_current_mesonero_user(current_user: User = Depends(get_current_user)):
        # Requiere que el usuario sea 'admin' o 'mesonero'.
    if current_user.role not in ["admin", "mesonero"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta sección (mesonero)")
    
    return current_user

def get_current_cajero_user(current_user: User = Depends(get_current_user)):
        # Requiere que el usuario sea 'admin' o 'cajero'.
    if current_user.role not in ["admin", "cajero"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta sección (cajero)")
    
    return current_user

def has_roles(allowed_roles: list[str]):
        # Dependencia que verifica si el usuario autenticado tiene alguno de los roles permitidos. Uso: Depends(has_roles(["admin", "mesonero", "cajero"]))

    def check_roles(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes los permisos necesarios. Rol requerido: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return check_roles