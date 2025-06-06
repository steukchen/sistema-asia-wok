'use client';
import { useAuth } from '../../app/providers/providers'

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <span>Asia Wok - {user.role}</span>
                <button onClick={logout} className="hover:underline">
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
}