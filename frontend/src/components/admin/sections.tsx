'use client';
import { useAuth } from '../../app/providers/providers';
import React from 'react';
import Button from '../ui/button';
import { lusitana } from '../font';
import UserTable from './UserTable';
import UserForm from './UserForm';  
import DishTable from './DishTable';
import DishForm from './DishForm'; 
import AdminSectionLayout from './AdminSectionLayout';
import { useCrudManagement } from '../../hooks/useCrudManagement'; 

interface User {
    id: number;
    email: string;
    nombre: string;
    role: string;
    is_active: boolean;
}

interface UserFormData {
    email: string;
    nombre: string;
    role: string;
    password?: string;
    is_active: boolean;
}

interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

interface DishFormData {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

// --- Componente para la Gestión de Usuarios ---
export const UserManagement: React.FC = () => {
    // Usa el hook useCrudManagement para toda la lógica de datos y estado
    const {
        items: users,
        loading,
        error,
        showForm,
        editingItem: editingUser,
        handleSaveItem: handleSaveUser,
        handleDeleteItem: handleDeleteUser,
        handleCreateNew,
        handleEditItem: handleEditUser,
        handleCancelForm,
        setError 
    } = useCrudManagement<User, UserFormData, UserFormData>('/users'); // Endpoint para usuarios

    return (
        <AdminSectionLayout<User, UserFormData>
            title="Gestión de Usuarios"
            createButtonText="Crear Nuevo Usuario"
            loading={loading}
            error={error}
            showForm={showForm}
            editingItem={editingUser}
            items={users}
            TableComponent={UserTable} // Pasa el componente de tabla de usuarios
            FormComponent={UserForm}   // Pasa el componente de formulario de usuarios
            onSave={handleSaveUser}
            onCancelForm={handleCancelForm}
            onEditItem={handleEditUser}
            onDeleteItem={handleDeleteUser}
            onCreateNew={handleCreateNew}
        />
    );
};

// --- Componente para la Gestión de Platos ---
export const DishManagement: React.FC = () => {
    // Usa el hook useCrudManagement para toda la lógica de datos y estado
    const {
        items: platos,
        loading,
        error,
        showForm,
        editingItem: editingPlato,
        handleSaveItem: handleSavePlato,
        handleDeleteItem: handleDeletePlato,
        handleCreateNew,
        handleEditItem: handleEditPlato,
        handleCancelForm,
        setError
    } = useCrudManagement<Plato, DishFormData, DishFormData>('/platos'); // Endpoint para platos

    return (
        <AdminSectionLayout<Plato, DishFormData>
            title="Gestión de Platos"
            createButtonText="Crear Nuevo Plato"
            loading={loading}
            error={error}
            showForm={showForm}
            editingItem={editingPlato}
            items={platos}
            TableComponent={DishTable} // Pasa el componente de tabla de platos
            FormComponent={DishForm}   // Pasa el componente de formulario de platos
            onSave={handleSavePlato}
            onCancelForm={handleCancelForm}
            onEditItem={handleEditPlato}
            onDeleteItem={handleDeletePlato}
            onCreateNew={handleCreateNew}
        />
    );
};

// --- Componente para la Gestión de Pedidos (completa para Admin) ---
export const OrderManagement: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Gestión de Pedidos
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Visualiza, crea, modifica y elimina todos los pedidos del restaurante.
            </p>
            <Button
                onClick={() => alert('¡Ir a la gestión de Pedidos!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                type="button"
            >
                Administrar Pedidos
            </Button>
        </div>
    );
};

// --- Componente para la Configuración del Restaurante ---
export const RestaurantSettings: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Configuración del Restaurante
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Ajusta parámetros generales, como la gestión de mesas y categorías.
            </p>
            <Button
                onClick={() => alert('¡Ir a la Configuración!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                type="button"
            >
                Configurar
            </Button>
        </div>
    );
};
