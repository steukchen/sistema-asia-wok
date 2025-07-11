// frontend/src/app/providers/providers.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    username: string;
    rol: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    const login = useCallback(async (username: string, password: string) => {
        setIsLoading(true);
        try {

            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                    "username": username,
                    "password":password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error de autenticación');
            }

            const userResponse = await fetch(`/api/validateToken`, {
                method: 'GET'
            });

            if (!userResponse.ok) {
                throw new Error('Error al obtener la información del usuario');
            }

            const userData: User = await userResponse.json();

            setUser(userData)
            setIsAuthenticated(true)
            
            router.push('/admin/dashboard'); 

        } catch (err) {
            console.error('Error de login en AuthProvider: ', err);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        const response = await fetch(`/api/logout`, {
                method: 'POST'
            });
        if (response.ok){
            setUser(null);
            setIsAuthenticated(false);
            router.push('/');
        }
    }, [router]);

    const validateToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const userResponse = await fetch(`/api/validateToken`, {
                method: 'GET'
            });

            if (!userResponse.ok) {
                throw new Error('Error al obtener la información del usuario');
            }

            const userData: User = await userResponse.json();

            setUser(userData)
            setIsAuthenticated(true)
            
            router.push('/admin/dashboard'); 

        } catch (err) {
            console.error('Error de validacion: ', err);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Efecto para verificar el token en el almacenamiento local al cargar la aplicación.
    useEffect(() => {
        try {
            validateToken()
        } catch (error) {
            console.error("Error al parsear datos de usuario del almacenamiento local:", error);
            logout();
        }
    }, [validateToken,logout]);

    const contextValue: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
};
