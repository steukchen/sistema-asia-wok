'use client';
import { useAuth } from '../../app/providers/providers';
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '../../components/font';
import Button from '../ui/button'

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-gray-900 text-white p-3 shadow-lg  top-0 z-50 opacity-100">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 px-4">
                {/* Sección izquierda: Logo y Título */}
                <div className="flex items-center space-x-3">
                    <Link href={`/${user.rol}/dashboard`} className="flex items-center space-x-2">
                        {/* Logo pequeño */}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-700">
                            <Image
                                src="/asia-wok-logo.jpg"
                                alt="Asia Wok Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Título responsivo */}
                        <span className={`${lusitana.className} text-xl font-bold whitespace-nowrap hidden sm:inline`}>
                            ASIA WOK
                        </span>
                    </Link>
                    {/* Rol del usuario */}
                    <span className="text-gray-300 text-sm sm:text-base font-medium capitalize">
                        ({user.rol})
                    </span>
                </div>

                {/* Sección derecha: Botón de Cerrar Sesión */}
                <div className="flex items-center">
                    <Button
                        onClick={logout}
                        className="bg-black/60 hover:bg-[#E03A00]/70 text-white font-semibold py-2 px-4 rounded-xl"
                        aria-label="Cerrar Sesión"
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </nav>
    );
}
