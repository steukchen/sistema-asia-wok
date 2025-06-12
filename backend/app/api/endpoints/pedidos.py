from fastapi import (APIRouter, Depends, HTTPException, status)
from sqlalchemy.orm import (Session, joinedload)
from app.core.security import (get_current_user, get_current_mesonero_user, get_current_cajero_user, get_current_cocina_user, get_current_admin_user, has_roles)
from app.models import Pedido, Plato, User
from app.schemas import PedidoCreate, PedidoOut
from app.models.db_utils import get_db

router = APIRouter()

@router.post("/", response_model=PedidoOut)
async def crear_pedido(
    pedido: PedidoCreate,
    db: Session = Depends(get_db),  # Misma función de dependencia
    current_user: User = Depends(has_roles(["admin", "mesonero", "cajero"]))
):

    # Validar que los platos existen
    platos = []
    for plato_id in pedido.platos_ids:
        plato = db.query(Plato).filter(Plato.id == plato_id).first()
        if not plato:
            raise HTTPException(status_code=404, detail=f"Plato con ID {plato_id} no encontrado")
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

    loaded_pedido = db.query(Pedido).options(
        joinedload(Pedido.platos),
        joinedload(Pedido.usuario)
    ).filter(Pedido.id == nuevo_pedido.id).first()

    if not loaded_pedido:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al recargar el pedido creado.")
    
    return loaded_pedido

@router.get("/pendientes", response_model=list[PedidoOut])
async def obtener_pedidos_pendientes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_cocina_user)
):
    pedidos = db.query(Pedido).options(
        joinedload(Pedido.platos), # <-- ¡Añadir esto!
        joinedload(Pedido.usuario) # <-- ¡Añadir esto!
    ).filter(Pedido.estado == "pendiente").all()

    return pedidos