from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_admin_user, has_roles 
from app.models.plato import Plato as DBPlato
from app.models.user import User as DBUser
from app.schemas.plato import PlatoCreate, PlatoOut, PlatoUpdate

router = APIRouter()

# --- Endpoints para Administradores y Cocina ---

@router.post(
    "/", 
    response_model=PlatoOut, 
    status_code=status.HTTP_201_CREATED, 
    summary="Crear un nuevo plato",
    description="""Crea un nuevo plato en el menú. Requiere:
    - Nombre único
    - Precio positivo
    - Categoría no vacía
    - Solo para roles: admin, cajero"""
)
async def create_plato(
    current_user_with_roles: Annotated[DBUser, Depends(has_roles(["admin", "cajero"]))],
    plato_in: PlatoCreate,
    db: Session = Depends(get_db)
):
    # Validación de nombre único
    if db.query(DBPlato).filter(DBPlato.nombre == plato_in.nombre).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un plato con este nombre."
        )
    
    # Validación básica de precio
    if plato_in.precio <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El precio debe ser mayor que cero."
        )
    
    # Validación básica de categoría
    if not plato_in.categoria or not plato_in.categoria.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La categoría es requerida."
        )
    
    db_plato = DBPlato(
        nombre=plato_in.nombre,
        descripcion=plato_in.descripcion,
        precio=plato_in.precio,
        categoria=plato_in.categoria,
        is_active=plato_in.is_active
    )
    
    db.add(db_plato)
    db.commit()
    db.refresh(db_plato)
    return db_plato

@router.get(
    "/", 
    response_model=List[PlatoOut], 
    summary="Listar platos",
    description="Obtiene lista de platos con filtros por estado y categoría. Accesible para todo el personal."
)
async def read_platos(
    current_user: Annotated[DBUser, Depends(has_roles(["admin", "mesonero", "cajero", "cocina"]))],
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo/inactivo"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría (ej: entrada, principal)"),
    db: Session = Depends(get_db)
):
    query = db.query(DBPlato)
    
    if is_active is not None:
        query = query.filter(DBPlato.is_active == is_active)
    if categoria:
        query = query.filter(DBPlato.categoria.ilike(f"%{categoria}%"))
        
    platos = query.offset(skip).limit(limit).all()
    
    if not platos and skip == 0:  # Solo mostrar error si es la primera página
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron platos con los filtros aplicados."
        )
    return platos

@router.get(
    "/{plato_id}", 
    response_model=PlatoOut, 
    summary="Obtener plato por ID",
    responses={404: {"description": "Plato no encontrado"}}
)
async def read_plato_by_id(
    current_user: Annotated[DBUser, Depends(has_roles(["admin", "mesonero", "cajero", "cocina"]))],
    plato_id: int,
    db: Session = Depends(get_db)
):
    plato = db.query(DBPlato).filter(DBPlato.id == plato_id).first()
    if not plato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plato no encontrado."
        )
    return plato

@router.put(
    "/{plato_id}", 
    response_model=PlatoOut, 
    summary="Actualizar plato",
    description="Actualiza los datos de un plato existente. Solo para admin y cajero.",
    responses={
        404: {"description": "Plato no encontrado"},
        400: {"description": "Datos de actualización inválidos"}
    }
)
async def update_plato(
    current_user_with_roles: Annotated[DBUser, Depends(has_roles(["admin", "cajero"]))],
    plato_id: int,
    plato_in: PlatoUpdate,
    db: Session = Depends(get_db)
):
    plato = db.query(DBPlato).filter(DBPlato.id == plato_id).first()
    if not plato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plato no encontrado."
        )

    update_data = plato_in.model_dump(exclude_unset=True)
    
    # Validación de nombre único si se está actualizando
    if 'nombre' in update_data and update_data['nombre'] != plato.nombre:
        if db.query(DBPlato).filter(DBPlato.nombre == update_data['nombre']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un plato con este nombre."
            )
    
    # Validación de precio positivo
    if 'precio' in update_data and update_data['precio'] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El precio debe ser mayor que cero."
        )
    
    # Actualización segura de campos
    for field, value in update_data.items():
        setattr(plato, field, value)
    
    db.commit()
    db.refresh(plato)
    return plato

@router.delete(
    "/{plato_id}", 
    status_code=status.HTTP_204_NO_CONTENT, 
    summary="Eliminar plato",
    description="Elimina permanentemente un plato del menú. Solo para administradores.",
    responses={404: {"description": "Plato no encontrado"}}
)
async def delete_plato(
    current_admin_user: Annotated[DBUser, Depends(get_current_admin_user)],
    plato_id: int,
    db: Session = Depends(get_db)
):
    plato = db.query(DBPlato).filter(DBPlato.id == plato_id).first()
    if not plato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plato no encontrado."
        )
    
    db.delete(plato)
    db.commit()