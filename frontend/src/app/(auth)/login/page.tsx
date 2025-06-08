'use client';
import { useAuth } from '../../providers/providers';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import Footer from '../../../components/ui/footer';
import {lusitana} from '../../../components/font'
import {montserrat} from '../../../components/font'

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleLogin = (role: string) => {
        console.log(role);
        login(role as any, 'Usuario Demo'); // Simulación
        router.push(`/${role}`);
};

    const roles = ['admin', 'mesonero', 'cajero', 'cocina'];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4 cursor-default">
            {/* Logo y Título */}
            <div className="flex flex-col items-center mb-3">
                <div className="w-40 h-40 relative">
                    <Image
                        src="/asia-wok-logo.jpg"
                        alt="Asia Wok Logo"
                        fill
                        className="rounded-full"
                        priority
                    />
                </div>
                <h1 className="text-3xl font-bold text-[#FB3D01]">
                    SISTEMA DE GESTIÓN
                </h1>

                <p className="text-gray-600 mt-2">
                    Inicie sesión según su rol
                </p>
            </div>

        {/* Tarjeta de Login */}
            <div className="w-full max-w-md bg-gray-100 rounded-lg shadow-full border border-black/20 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Seleccione su rol
                </h2>
                <div className="space-y-3">
                    {roles.map((role) => (
                        <button
                        key={role}
                        onClick={() => handleLogin(role)}
                        disabled={selectedRole === role}
                        className={`w-full py-3 px-4 rounded-lg transition-all bg-black/60 
                            ${selectedRole === role ? '' : 'text-[white]/100 hover:bg-custom-orange/90 cursor-pointer border'} capitalize`}
                        >
                        {selectedRole === role ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Redirigiendo...
                            </span>
                        ) : (
                            `Acceder como ${role}`
                        )}
                        </button>
                    ))}
                </div>
            </div>

        {/* Footer */}
                <Footer/>
        </div>
    );
}
