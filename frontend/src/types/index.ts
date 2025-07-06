// Definiciones de roles de usuario
export type UserRole = 'admin' | 'cajero' | 'mesonero' | 'cocina';

// Interfaz para el usuario
export interface User {
    id: number;
    email: string;
    nombre: string;
    role: UserRole;
    is_active: boolean;
}

// Interfaz para los datos del formulario de usuario
export interface UserFormData {
    email: string;
    nombre: string;
    role: string;
    password?: string;
    is_active: boolean;
}

// Interfaz para un plato
export interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

// Interfaz para los datos del formulario de plato
export interface DishFormData {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

// Definición de estados de pedido
export type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'; // Asegúrate de que esto coincida con tu backend

// Interfaz para un ítem de pedido al crearlo o enviarlo para actualización
export interface OrderItemCreation {
    plato_id: number;
    cantidad: number;
}

// Interfaz para un ítem de pedido que se recibe del backend (incluye detalles del plato)
export interface OrderItem {
    plato_id: number;
    cantidad: number;
    plato: Plato; // Detalles completos del plato
    nombre_plato: string; 
    precio_unitario: number;
}

// Interfaz para la data de creación de un pedido 
export interface OrderCreationFormData {
    numero_mesa: number;
    items: OrderItemCreation[]; 
    notas?: string;
}

// Interfaz para la data de actualización de un pedido
export interface OrderUpdateFormData {
    numero_mesa?: number; 
    estado?: OrderStatus; 
    notas?: string; 
    items?: OrderItemCreation[]; 
}

// Interfaz para un Pedido completo (lo que se recibe del backend)
export interface Order {
    id: number;
    usuario_id: number;
    numero_mesa: number;
    estado: OrderStatus;
    total: number;
    notas?: string;
    fecha_creacion: string; 
    fecha_actualizacion: string; 
    usuario: User; 
    items: OrderItem[]; 
}
