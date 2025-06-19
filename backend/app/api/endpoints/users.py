from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_admin_user, get_current_user, has_roles
from app.models.user import User as DBUser
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()

# --- Endpoints para Administrador ---

@router.post(
    "/", 
    response_model=UserOut, 
    status_code=status.HTTP_201_CREATED, 
    summary="Crear un nuevo usuario (solo administradores)",
    response_description="Usuario creado exitosamente"
)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)] = None
):
    """
    Crea un nuevo usuario en el sistema con validaciones básicas.
    Requisitos:
    - Email único
    - Contraseña no vacía
    - Rol no vacío
    """
    # Validación de email existente
    if db.query(DBUser).filter(DBUser.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
    
    # Validación básica de contraseña
    if not user_in.password or len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres."
        )
    
    # Validación básica de rol
    if not user_in.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol es requerido."
        )
    
    # Creación del usuario
    db_user = DBUser(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get(
    "/", 
    response_model=List[UserOut], 
    summary="Obtener todos los usuarios (solo administradores)",
    response_description="Lista de usuarios obtenida exitosamente"
)
async def read_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)] = None
):
    """
    Obtiene una lista paginada de usuarios con filtro opcional por estado activo.
    """
    query = db.query(DBUser)
    
    if is_active is not None:
        query = query.filter(DBUser.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    
    if not users and skip == 0:  # Solo mostrar error si es la primera página
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No se encontraron usuarios."
        )
    return users

@router.get(
    "/{user_id}", 
    response_model=UserOut, 
    summary="Obtener un usuario por ID (solo administradores)",
    responses={
        404: {"description": "Usuario no encontrado"}
    }
)
async def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)] = None
):
    """
    Obtiene un usuario específico por su ID con validación de existencia.
    """
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
    return user

@router.put(
    "/{user_id}", 
    response_model=UserOut, 
    summary="Actualizar un usuario (solo administradores)",
    responses={
        404: {"description": "Usuario no encontrado"},
        400: {"description": "Datos de actualización inválidos"}
    }
)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)] = None
):
    """
    Actualiza un usuario existente con validación de datos.
    """
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )

    update_data = user_in.model_dump(exclude_unset=True)
    
    # Validación de email único si se está actualizando
    if 'email' in update_data and update_data['email'] != user.email:
        if db.query(DBUser).filter(DBUser.email == update_data['email']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo correo electrónico ya está registrado."
            )
    
    # Actualización segura de campos
    for field, value in update_data.items():
        if field == "password":
            if value and len(value) >= 6:  # Validación básica de contraseña
                setattr(user, "hashed_password", get_password_hash(value))
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete(
    "/{user_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un usuario (solo administradores)",
    responses={
        404: {"description": "Usuario no encontrado"}
    }
)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)] = None
):
    """
    Elimina un usuario del sistema con validación de existencia.
    Considerar cambiar a desactivación en futuras versiones.
    """
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
    
    db.delete(user)
    db.commit()