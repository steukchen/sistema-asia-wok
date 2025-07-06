# backend/app/api/endpoints/pedidos.py
from fastapi import (APIRouter, Depends, HTTPException, status, Query)
from typing import (Annotated, List, Optional)
from sqlalchemy.orm import (Session, joinedload)
from app.api.dependencies import (get_current_user, get_current_mesonero_user, get_current_cajero_user, get_current_cocina_user, get_current_admin_user, has_roles)
from app.models import Pedido, Plato, User, OrderItem 
from app.schemas import (PedidoCreate, PedidoOut, PedidoUpdate, OrderItemCreate) 
from app.models.db_utils import get_db
from datetime import datetime, timezone 

router = APIRouter()

@router.post(
    "/",
    response_model=PedidoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo pedido",
    description="Crea un nuevo pedido en el sistema. Requiere permisos de admin, mesonero o cajero."
)
async def crear_pedido(
    pedido_data: PedidoCreate, 
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero"])),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo pedido con validaciones:
    - Verifica que los platos existan y estén activos.
    - Calcula el total automáticamente basado en la cantidad de cada plato.
    - Asocia el usuario actual como creador del pedido.
    - Guarda el número de mesa y los ítems del pedido (plato y cantidad).
    """
    db_order_items = [] # Usaremos esta lista para las instancias de OrderItem
    total = 0.0

    # Validar que los platos existen y crear los OrderItem
    for item_data in pedido_data.items:
        plato = db.query(Plato).filter(Plato.id == item_data.plato_id).first()
        if not plato:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plato con ID {item_data.plato_id} no encontrado."
            )
        if not plato.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El plato '{plato.nombre}' (ID: {item_data.plato_id}) no está disponible actualmente."
            )
        
        # Crear una instancia de OrderItem para cada plato con su cantidad
        db_order_item = OrderItem(
            plato_id=item_data.plato_id,
            cantidad=item_data.cantidad
        )
        db_order_items.append(db_order_item)
        total += plato.precio * item_data.cantidad
    
    # Crear la instancia del pedido
    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        numero_mesa=pedido_data.numero_mesa,
        estado="pendiente",
        total=total,
        notas=pedido_data.notas,
        fecha_creacion=datetime.now(timezone.utc),
        fecha_actualizacion=datetime.now(timezone.utc)
    )
    
    # Asociar los OrderItem al pedido (SQLAlchemy manejará la relación)
    nuevo_pedido.items = db_order_items 

    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)

    # Recargar el pedido con relaciones para la respuesta
    loaded_pedido = db.query(Pedido).options(
        joinedload(Pedido.items).joinedload(OrderItem.plato), 
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
    estado: Optional[str] = Query(None, description="Filtrar por estado (pendiente, en_preparacion, listo, entregado, cancelado)"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero", "cocina"])),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los pedidos con paginación y filtrado por estado.
    """
    query = db.query(Pedido).options(
        joinedload(Pedido.items).joinedload(OrderItem.plato),
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
        joinedload(Pedido.items).joinedload(OrderItem.plato),
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
        joinedload(Pedido.items).joinedload(OrderItem.plato),
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
    description="Actualiza un pedido existente. Admin, cocina o cajero pueden cambiar el estado. Admin y Cajero pueden modificar ítems y datos del pedido."
)
async def actualizar_pedido(
    pedido_id: int,
    pedido_update: PedidoUpdate,
    current_user: User = Depends(has_roles(["admin", "cocina", "cajero"])),
    db: Session = Depends(get_db)
):
    """
    Actualiza un pedido existente con validaciones:
    - Admin y Cajero pueden modificar número de mesa, notas e ítems.
    - Admin, Cocina y Cajero pueden cambiar el estado.
    - Recalcula el total si los ítems son modificados.
    """
    pedido = db.query(Pedido).options(
        joinedload(Pedido.items).joinedload(OrderItem.plato), 
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == pedido_id).first()
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado."
        )
    
    # No usar model_dump() para 'items' si queremos mantenerlos como Pydantic objects
    update_data = pedido_update.model_dump(exclude_unset=True) 
    
    # Actualizar numero_mesa y notas (permitido para admin y cajero)
    if current_user.role in ['admin', 'cajero']:
        if 'numero_mesa' in update_data and update_data['numero_mesa'] is not None:
            pedido.numero_mesa = update_data['numero_mesa']
        if 'notas' in update_data and update_data['notas'] is not None:
            pedido.notas = update_data['notas']
    elif 'numero_mesa' in update_data or 'notas' in update_data:
        # Si el usuario no es admin/cajero e intenta cambiar mesa/notas
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar el número de mesa o las notas del pedido."
        )

    # Actualizar estado (permitido para admin, cocina, cajero)
    if 'estado' in update_data and update_data['estado'] is not None:
        if current_user.role not in ['admin', 'cocina', 'cajero']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para cambiar el estado del pedido."
            )
        if update_data['estado'] not in ["pendiente", "listo", "en_preparacion", "entregado", "cancelado"]: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estado de pedido inválido."
            )
        pedido.estado = update_data['estado']
    
    # Accede directamente a pedido_update.items que ya son OrderItemCreate objetos
    if pedido_update.items is not None: 
        if current_user.role not in ['admin', 'cajero']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para modificar los ítems del pedido."
            )
        
        if not pedido_update.items: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La lista de ítems no puede estar vacía al modificar un pedido."
            )

        new_total = 0.0
        new_db_order_items = []

        # Eliminar ítems existentes (gracias a cascade="all, delete-orphan" en el modelo Pedido)
        pedido.items = [] 
        db.flush() 

        # Validar y crear nuevos OrderItem
        for item_data in pedido_update.items: 
            plato = db.query(Plato).filter(Plato.id == item_data.plato_id).first()
            if not plato:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Plato con ID {item_data.plato_id} no encontrado."
                )
            if not plato.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El plato '{plato.nombre}' (ID: {item_data.plato_id}) no está disponible actualmente."
                )
            
            db_order_item = OrderItem(
                plato_id=item_data.plato_id,
                cantidad=item_data.cantidad,
                pedido_id=pedido_id 
            )
            new_db_order_items.append(db_order_item)
            new_total += plato.precio * item_data.cantidad
        
        pedido.items = new_db_order_items 
        pedido.total = new_total 
    
    pedido.fecha_actualizacion = datetime.now(timezone.utc)
    
    db.add(pedido) 
    db.commit()
    db.refresh(pedido)
    
    loaded_pedido = db.query(Pedido).options(
        joinedload(Pedido.items).joinedload(OrderItem.plato), 
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == pedido_id).first()

    if not loaded_pedido:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al recargar el pedido actualizado."
        )

    return loaded_pedido

@router.delete(
    "/{pedido_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pedido",
    description="Elimina un pedido. Solo para administradores y Cajero"
)
async def eliminar_pedido(
    pedido_id: int,
    current_user: User = Depends(has_roles(["admin", "cajero"])),
    db: Session = Depends(get_db)
):
    """
    Elimina un pedido del sistema (solo administradores y cajeros).
    Gracias a `cascade="all, delete-orphan"` en la relación `items` del modelo Pedido,
    los OrderItems asociados a este pedido también se eliminarán automáticamente.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado."
        )
    
    db.delete(pedido)
    db.commit()
