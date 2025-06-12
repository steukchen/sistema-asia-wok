from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr # Usa EmailStr para validación de formato de correo
    role: str # Puede ser "admin", "mesonero", "cocina", "cajero", "cliente"

# Esquema para crear un nuevo usuario (incluye la contraseña sin hashear)
class UserCreate(UserBase):
    password: str 

# Esquema para actualizar un usuario (campos opcionales)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# Esquema para la salida de datos de usuario (no incluye la contraseña hasheada)
class UserOut(UserBase):
    id: int
    is_active: bool = True
    
    class Config:
        from_attributes = True 

# Esquema para la autenticación de usuario (login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str