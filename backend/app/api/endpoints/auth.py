from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.api.dependencies import get_db, get_current_user
from app.models.user import User as DBUser
from app.schemas.tokens import Token
from app.schemas.user import UserOut

router = APIRouter()

@router.post("/login", response_model=Token, summary="Iniciar sesión y obtener token de acceso")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = db.query(DBUser).filter(DBUser.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut, summary="Obtener información del usuario autenticado")

async def read_users_me(
    current_user: Annotated[DBUser, Depends(get_current_user)]
):
    return current_user
