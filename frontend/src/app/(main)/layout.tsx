'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../app/providers/providers';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/footer';

/**
 * @param {Object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos a renderizar.
 * @returns {JSX.Element} El layout principal con protección de rutas.
 */
export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/'); // Redirige a la página de login si no está autenticado
                return;
            }

            const checkRoleRedirect = () => {
                if (pathname.startsWith('/admin') && user?.role !== 'admin') {
                    router.push('/unauthorized');
                } else if (pathname.startsWith('/cajero') && user?.role !== 'cajero') {
                    router.push('/unauthorized');
                } else if (pathname.startsWith('/mesonero') && user?.role !== 'mesonero') {
                    router.push('/unauthorized');
                } else if (pathname.startsWith('/cocina') && user?.role !== 'cocina') {
                    router.push('/unauthorized');
                }
            };
            checkRoleRedirect();

        }
    }, [isLoading, isAuthenticated, user, router, pathname]); // Verifica el estado de autenticación y redirige según el rol del usuario
    if (isLoading || (isAuthenticated && !user)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando...</p>
            </div>
        );
    }
    // Si el usuario no está autenticado, no renderiza nada
    if (!isAuthenticated) {
        return null;
    }

    // Renderiza el contenido del dashboard si el usuario está autenticado y autorizado
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1 p-4 sm:p-6 ">
                {children} {/* Contenido específico de cada dashboard (admin, cajero, etc.) */}
            </main>
            <Footer />
        </div>
    );
}
