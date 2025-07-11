// Definiciones de roles de usuario
export type UserRole = 'superadmin' | 'cajero' | 'mesonero' | 'cocina';

// Interfaz para el usuario
export interface User {
    id: string;
    email: string;
    username: string;
    rol: UserRole;
    status: boolean;
}

// Interfaz para los datos del formulario de usuario
export interface UserFormData {
    email: string;
    username: string;
    rol: string;
    password?: string;
    status: boolean;
}

export interface TipoPlato{
    id: number;
    name: string
}

// Interfaz para un plato
export interface Plato {
    id: number;
    name: string;
    description: string;
    price: number;
    type: TipoPlato;
    status: boolean;
}

// Interfaz para los datos del formulario de plato
export interface DishFormData {
    name: string;
    description: string;
    price: number;
    type_id: number;
    status: boolean;
}

// Definición de estados de pedido
export type OrderStatus = 'pending' | 'completed' | 'cancelled'; // Asegúrate de que esto coincida con tu backend

// Interfaz para un ítem de pedido al crearlo o enviarlo para actualización
export interface OrderItemCreation {
    dish_id: number;
    quantity: number;
}

// Interfaz para un ítem de pedido que se recibe del backend (incluye detalles del plato)
export interface OrderItem {
    quantity: number;
    dish: Plato; 
}

// Interfaz para la data de creación de un pedido 
export interface OrderCreationFormData {
    table_id: number;
    dishes: OrderItemCreation[]; 
    // notas?: string;
}

// Interfaz para la data de actualización de un pedido
export interface OrderUpdateFormData {
    table_id?: number; 
    state?: OrderStatus; 
    // notas?: string; 
    dishes?: OrderItemCreation[]; 
}

// Interfaz para un Pedido completo (lo que se recibe del backend)
export interface Order {
    id: number;
    created_by: string;
    table_id: number;
    state: OrderStatus;
    notes?: string;
    order_date: string; 
}

export interface OrderWithDishes {
    id: number;
    created_by: string;
    table_id: number;
    state: OrderStatus;
    notes?: string;
    order_date: string; 
    dishes: OrderItem[]; 
}

export interface Table{
    id: number;
    name: string
    state: string
}