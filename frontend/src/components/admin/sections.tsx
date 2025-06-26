'use client';
import React from 'react';
import Button from '../ui/button';
import { lusitana } from '../font';

// --- Componente para la Gestión de Usuarios ---
export const UserManagement: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Gestión de Usuarios
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Aquí podrás ver, crear, editar y eliminar los usuarios del sistema.
            </p>
            <Button
                onClick={() => alert('¡Ir a la tabla de Usuarios!')} // Placeholder de acción
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Administrar Usuarios
            </Button>
        </div>
    );
};

// --- Componente para la Gestión de Platos ---
export const DishManagement: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Gestión de Platos
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Gestiona el menú del restaurante: añade nuevos platos, actualiza precios y descripciones.
            </p>
            <Button
                onClick={() => alert('¡Ir a la lista de Platos!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Administrar Platos
            </Button>
        </div>
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
                onClick={() => alert('¡Ir a la gestión de Pedidos!')} // Placeholder de acción
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
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
                onClick={() => alert('¡Ir a la Configuración!')} // Placeholder de acción
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Configurar
            </Button>
        </div>
    );
};
