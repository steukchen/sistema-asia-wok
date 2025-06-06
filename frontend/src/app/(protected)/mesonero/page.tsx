'use client';

import { useAuth } from '../../providers/providers';

export default function MesoneroPage() {
    const { user, logout } = useAuth();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Panel Pedidos Mesonero</h1>
            <p>Bienvenido, {user?.name} (Rol: {user?.role})</p>
            <p className="mt-2">Aquí puedes gestionar los pedidos de los clientes.</p>

            <button 
            onClick={logout}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
            >
                Cerrar Sesión
            </button>
        </div>
    );  
}