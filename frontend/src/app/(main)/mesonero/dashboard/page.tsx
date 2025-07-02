'use client';

import { useAuth } from '../../../providers/providers';
import Button from '../../../../components/ui/button'
import { useRouter, usePathname } from 'next/navigation';

export default function MesoneroPage() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col text-center items-center sm:flex-col bg-gray-50 p-4 sm:p-6 lg:p-6 rounded-lg p-4 text-black">
            <h1 className="text-2xl font-bold text-black">Panel Pedidos Mesonero</h1>
            <p>Bienvenido, {user?.nombre} (Rol: {user?.role})</p>
            <p className="mt-2">Aquí puedes gestionar los pedidos de los clientes.</p>

            <Button
                onClick={logout}
                className='mt-5 sm:w-10 md:w-20 text-center bg-red-600 hover:bg-red-400'>
                Salir
            </Button>


        </div>

    );
}