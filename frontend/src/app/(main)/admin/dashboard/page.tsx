'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../app/providers/providers';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import { UserManagement, DishManagement, OrderManagement, RestaurantSettings, } from '../../../../components/admin/sections';
import { lusitana } from '../../../../components/font';

/**
 * @returns {JSX.Element} La interfaz del dashboard de administrador.
 */

export default function AdminDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('users');

    useEffect(() => {
        // Solo actúa una vez que la carga ha terminado y si el usuario no es nulo
        if (!isLoading && user && user.role !== 'admin') {
            router.push('/unauthorized'); // Redirige a página no autorizada
        }
    }, [isLoading, user, router]);

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando dashboard de administrador...</p>
            </div>
        );
    }

    // Función para renderizar el componente de la sección activa
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'users':
                return <UserManagement />;
            case 'dishes':
                return <DishManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'settings':
                return <RestaurantSettings />;
            default:
                return <UserManagement />; // Por defecto muestra Gestión de Usuarios
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-6 rounded-lg">
            {/* Barra lateral de navegación para el administrador */}
            <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

            {/* Área de contenido principal del dashboard */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                {/* Título de bienvenida */}
                <h1 className={`${lusitana.className} text-3xl sm:text-4xl font-bold text-[#FB3D01] mb-6 sm:mb-3 text-center`}>
                    Bienvenido, {user.nombre} ({user.role})
                </h1>
                <p className="text-gray-800 text-lg sm:text-xl mb-8 text-center">
                    Gestión de datos Restaurante Asia Wok.
                </p>

                {renderActiveSection()}
            </div>
        </div>
    );
}
