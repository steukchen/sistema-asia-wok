'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../app/providers/providers';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/footer';


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
            // Si el usuario no está autenticado, redirige a la página de inicio (que luego redirige a login)
            if (!isAuthenticated) {
                router.push('/'); 
                return;
            }

        }
    }, [isLoading, isAuthenticated, user, router, pathname]); 

    // Muestra un estado de carga mientras se verifica el usuario
    if (isLoading || (isAuthenticated && !user)) { // Si está autenticado pero user es null (aún cargando)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando...</p>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return null; 
    }

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
