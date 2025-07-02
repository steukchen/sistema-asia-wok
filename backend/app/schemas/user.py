from pydantic import BaseModel, EmailStr, Field, field_validator # Importa field_validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr # Usa EmailStr para validación de formato de correo
    nombre: str #campo para el nombre del usuario
    role: str # Puede ser "admin", "mesonero", "cocina", "cajero", "cliente"
    is_active: bool = True # Campo para indicar si el usuario está activo, por defecto es True


# Esquema para crear un nuevo usuario (incluye la contraseña sin hashear)
class UserCreate(UserBase):
    password: str = Field( min_length=8,
        example="MiContrasenaSegura123*",
        json_schema_extra={"format": "password"})

# Esquema para actualizar un usuario (campos opcionales)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field( 
        None,
        min_length=8,
        example="MiContrasenaSegura123*",
        json_schema_extra={"format": "password"})
    
    @field_validator('password', mode='before')
    @classmethod
    def empty_string_to_none(cls, v: str | None) -> str | None:
        """
        Convierte una cadena vacía a None para el campo 'password'.
        Esto permite que el campo sea opcional en las actualizaciones
        sin fallar la validación de min_length si se envía "".
        """
        if isinstance(v, str) and v == "":
            return None
        return v

# Esquema para la salida de datos de usuario (no incluye la contraseña hasheada)
class UserOut(UserBase):
    id: int
    
    class Config:
        from_attributes = True 

# Esquema para la autenticación de usuario (login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field( min_length=8,
        example="MiContrasenaSegura123*",
        json_schema_extra={"format": "password"})