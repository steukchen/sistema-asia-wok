"use client";
import React, { useState } from "react";
import Button from "@/app/components/ui/button";
import { useAuth } from "@/app/providers/authProvider";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                const dataError = await response.json();
                throw dataError;
            }
            const user: User = await response.json();
            await setUser(user);
            router.push("/dashboard");
        } catch (err) {
            console.log("Error durante el login:", err);
            setError("Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.");
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-xs sm:max-w-sm bg-gray-100 rounded-lg shadow-2xl shadow-gray-800/50 border border-gray-400/60 p-6 mx-auto">
            {/* Formulario de login */}
            <form onSubmit={handleSubmit}>
                {/* Campo de Correo Electrónico */}
                <div className="mb-4">
                    <label
                        htmlFor="username"
                        className="block text-gray-700 text-sm sm:text-base font-medium mb-2"
                    >
                        Nombre de Usuario
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setEmail(e.target.value)}
                        // 'w-full' ya es responsivo. 'px-3 py-2' y los bordes son consistentes.
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01] text-gray-900 text-sm sm:text-base"
                        required
                        aria-label="Nombre de Usuario"
                    />
                </div>

                {/* Campo de Contraseña */}
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-gray-700 text-sm sm:text-base font-medium mb-2"
                    >
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB3D01] text-gray-900 text-sm sm:text-base"
                        required
                        aria-label="Contraseña"
                    />
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-4 text-red-600 text-center text-sm" role="alert">
                        {error}
                    </div>
                )}
                {/* Botón de Iniciar Sesión*/}
                <Button isLoading={loading}>Iniciar Sesión</Button>
            </form>
        </div>
    );
}
