from fastapi import (APIRouter, Depends, HTTPException, status, Query)
from typing import (Annotated, List, Optional)
from sqlalchemy.orm import (Session, joinedload)
from app.api.dependencies import (get_current_user, get_current_mesonero_user, get_current_cajero_user, get_current_cocina_user, get_current_admin_user, has_roles)
from app.models import Pedido, Plato, User
from app.schemas import (PedidoCreate, PedidoOut, PedidoUpdate)
from app.models.db_utils import get_db

router = APIRouter()

@router.post(
    "/",
    response_model=PedidoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo pedido",
    description="Crea un nuevo pedido en el sistema. Requiere permisos de admin, mesonero o cajero."
)
async def crear_pedido(
    pedido: PedidoCreate,
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero"])),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo pedido con validaciones básicas:
    - Verifica que los platos existan
    - Calcula el total automáticamente
    - Asocia el usuario actual como creador del pedido
    """
    # Validar que los platos existen
    platos = []
    for plato_id in pedido.platos_ids:
        plato = db.query(Plato).filter(Plato.id == plato_id).first()
        if not plato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plato con ID {plato_id} no encontrado"
            )
        if not plato.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El plato con ID {plato_id} no está disponible actualmente"
            )
        platos.append(plato)
    
    # Calcular total
    total = sum(plato.precio for plato in platos)
    
    # Crear pedido
    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        estado="pendiente",
        total=total,
        notas=pedido.notas
    )
    
    # Asociar platos al pedido
    nuevo_pedido.platos = platos
    
    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)

    # Recargar el pedido con relaciones
    loaded_pedido = db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == nuevo_pedido.id).first()

    if not loaded_pedido:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al recargar el pedido creado."
        )
    
    return loaded_pedido

@router.get(
    "/",
    response_model=List[PedidoOut],
    summary="Obtener todos los pedidos",
    description="Retorna todos los pedidos con opción de filtrar por estado."
)
async def obtener_pedidos(
    estado: Optional[str] = Query(None, description="Filtrar por estado (pendiente, en_proceso, completado, cancelado)"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero", "cocina"])),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los pedidos con paginación y filtrado por estado.
    """
    query = db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    )
    
    if estado:
        query = query.filter(Pedido.estado == estado)
    
    pedidos = query.offset(skip).limit(limit).all()
    return pedidos

@router.get(
    "/pendientes",
    response_model=List[PedidoOut],
    summary="Obtener pedidos pendientes",
    description="Retorna todos los pedidos con estado 'pendiente'. Solo para cocina."
)
async def obtener_pedidos_pendientes(
    current_user: User = Depends(get_current_cocina_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene los pedidos pendientes para la cocina.
    """
    pedidos = db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    ).filter(Pedido.estado == "pendiente").all()

    return pedidos

@router.get(
    "/{pedido_id}",
    response_model=PedidoOut,
    summary="Obtener pedido por ID",
    description="Retorna un pedido específico por su ID."
)
async def obtener_pedido(
    pedido_id: int,
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero", "cocina"])),
    db: Session = Depends(get_db)
):
    """
    Obtiene un pedido específico por su ID con todas sus relaciones.
    """
    pedido = db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado."
        )
    
    return pedido

@router.put(
    "/{pedido_id}",
    response_model=PedidoOut,
    summary="Actualizar pedido",
    description="Actualiza un pedido existente. Solo admin o mesonero pueden cambiar el estado."
)
async def actualizar_pedido(
    pedido_id: int,
    pedido_update: PedidoUpdate,
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero"])),
    db: Session = Depends(get_db)
):
    """
    Actualiza un pedido existente con validaciones:
    - Solo admin/mesonero pueden cambiar el estado
    - Verifica que los platos existan si se actualizan
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado."
        )
    
    update_data = pedido_update.model_dump(exclude_unset=True)
    
    # Validar cambio de estado
    if 'estado' in update_data and current_user.role not in ['admin', 'mesonero']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para cambiar el estado del pedido."
        )
    
    # Validar platos si se actualizan
    if 'platos_ids' in update_data:
        platos = []
        for plato_id in update_data['platos_ids']:
            plato = db.query(Plato).filter(Plato.id == plato_id).first()
            if not plato:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Plato con ID {plato_id} no encontrado"
                )
            platos.append(plato)
        pedido.platos = platos
        update_data['total'] = sum(plato.precio for plato in platos)
    
    # Actualizar campos
    for field, value in update_data.items():
        if field not in ['platos_ids', 'total']:  # Estos ya los manejamos aparte
            setattr(pedido, field, value)
    
    db.commit()
    db.refresh(pedido)
    
    # Retornar el pedido con relaciones cargadas
    return db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == pedido_id).first()

@router.delete(
    "/{pedido_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pedido",
    description="Elimina un pedido. Solo para administradores."
)
async def eliminar_pedido(
    pedido_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un pedido del sistema (solo administradores).
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado."
        )
    
    db.delete(pedido)
    db.commit()