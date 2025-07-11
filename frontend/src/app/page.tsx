// frontend/src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers/providers';

export default function HomePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && user) {
                // Si está autenticado, redirige al dashboard principal de admin
                // Desde ahí, la lógica de admin/dashboard/page.tsx se encargará de mostrar
                // la sección correcta según el rol del usuario.
                router.replace('/dashboard'); 
            } else {
                // Si no está autenticado, redirige al login
                router.replace('/login');
            }
        }
    }, [isAuthenticated, user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando aplicación...</p>
        </div>
    );
}
