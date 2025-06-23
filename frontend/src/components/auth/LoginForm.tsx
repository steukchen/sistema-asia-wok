'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { lusitana, montserrat } from '../../components/font';
import Button from '../../components/ui/button';

interface LoginFormProps {
    login: (email: string, password: string) => Promise<void>;
    isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ login, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            console.error("Error during login:", err);
            setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-100 rounded-lg shadow-2xl shadow-gray-800/50 border border-gray-400/60 p-6">


            {/* Formulario de login */}
            <form onSubmit={handleSubmit}>

                {/* Campo de Correo Electrónico */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01] text-gray-900"
                        required
                        aria-label="Correo Electrónico"
                    />
                </div>

                {/* Campo de Contraseña */}
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01] text-gray-900"
                        required
                        aria-label="Contraseña"
                    />
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-4 text-red-500 text-center text-sm" role="alert">
                        {error}
                    </div>
                )}
                {/* Botón de Iniciar Sesión*/}
                <Button isLoading={isLoading}>
                    Iniciar Sesión
                </Button>
            </form>
        </div>
    );
};

export default LoginForm;
