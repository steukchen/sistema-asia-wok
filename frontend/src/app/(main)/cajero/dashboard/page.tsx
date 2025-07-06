// frontend/src/app/(main)/cajero/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../app/providers/providers';

export default function CajeroDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user && user.role === 'cajero') {
                // Redirige al dashboard principal si es cajero
                router.replace('/admin/dashboard'); 
            } else if (user) {
                // Si está logueado pero no es cajero, redirige a no autorizado
                router.replace('/unauthorized');
            } else {
                // Si no está logueado, redirige al login
                router.replace('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Redirigiendo al dashboard...</p>
        </div>
    );
}
