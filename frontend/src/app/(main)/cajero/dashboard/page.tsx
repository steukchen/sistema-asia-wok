'use client';

import { useAuth } from '../../../providers/providers';
import Button from '../../../../components/ui/button'

export default function CajeroPage() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col text-center items-center sm:flex-col bg-gray-50 p-4 sm:p-6 lg:p-6 rounded-lg p-4 text-black">
            <h1 className="text-2xl font-bold">Panel Caja</h1>
            <p>Bienvenido, {user?.nombre} (Rol: {user?.role})</p>
            <p className="mt-2">Aquí puedes gestionar los pedidos, imprimir la cuenta y facturar</p>

            <Button
                onClick={logout}
                className='mt-5 sm:w-10 md:w-20 text-center bg-red-600 hover:bg-red-400'>
                Salir
            </Button>
        </div>
    );
}