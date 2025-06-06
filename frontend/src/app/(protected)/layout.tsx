'use client';
import { useAuth } from '../providers/providers';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../components/ui/Navbar';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading]);

    if (isLoading || !user) {
        return <div>Cargando...</div>;
    }

    return <>{children}</>;
}