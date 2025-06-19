from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.user import User as DBUser
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependency para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency para obtener el usuario actual desde el token JWT
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token, credentials_exception)
    
    user_email = payload.get("sub")
    if user_email is None:
        raise credentials_exception
    
    user = db.query(DBUser).filter(DBUser.email == user_email).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
        
    return user

# Dependencias de rol
async def get_current_admin_user(current_user: Annotated[DBUser, Depends(get_current_user)]):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user

async def get_current_mesonero_user(current_user: Annotated[DBUser, Depends(get_current_user)]):
    if current_user.role not in ["admin", "mesonero"]: # Admin también puede hacer lo de mesonero
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de mesonero"
        )
    return current_user

async def get_current_cajero_user(current_user: Annotated[DBUser, Depends(get_current_user)]):
    if current_user.role not in ["admin", "cajero"]: # Admin también puede hacer lo de cajero
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de cajero"
        )
    return current_user

async def get_current_cocina_user(current_user: Annotated[DBUser, Depends(get_current_user)]):
    if current_user.role not in ["admin", "cocina"]: # Admin también puede hacer lo de cocina
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de cocina"
        )
    return current_user

# Para un uso más general de roles, si lo necesitas en otros routers
def has_roles(allowed_roles: list[str]):
    def check_roles(current_user: Annotated[DBUser, Depends(get_current_user)]):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes los permisos necesarios. Roles permitidos: {', '.join(allowed_roles)}"
            )
        return current_user
    return check_roles