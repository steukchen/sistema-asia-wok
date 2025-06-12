'use client';
import { useAuth } from '../../providers/providers';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import Footer from '../../../components/ui/footer';
import { lusitana } from '../../../components/font';
import { montserrat } from '../../../components/font';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('mesonero@asiawok.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

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
                <h1 className={`${lusitana.className} text-3xl font-bold text-[#FB3D01]`}>
                    SISTEMA DE GESTIÓN
                </h1>
                <p className={`${montserrat.className} text-gray-600 mt-2`}>
                    Ingrese sus credenciales
                </p>
            </div>

            {/* Tarjeta de Login */}
            <div className="w-full max-w-md bg-gray-100 rounded-lg shadow-2xl shadow-gray-800/50 border border-gray-400/60 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01]"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01]"
                            required
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-red-500 text-center">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg transition-all shadow-xl bg-black/80 text-white hover:bg-[#FB3D01] focus:outline-none focus:ring-2 focus:ring-[#FB3D01] focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verificando...
                            </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}