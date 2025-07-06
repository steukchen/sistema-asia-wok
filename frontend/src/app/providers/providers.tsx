// frontend/src/app/providers/providers.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    nombre: string;
    role: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    const saveAuthData = (newToken: string, newUser: User) => {
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
    };

    const clearAuthData = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error de autenticación');
            }

            const data = await response.json();

            const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error('Error al obtener la información del usuario');
            }

            const userData: User = await userResponse.json();

            saveAuthData(data.access_token, userData);
            
            router.push('/admin/dashboard'); 

        } catch (err: any) {
            console.error('Error de login en AuthProvider:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        clearAuthData();
        router.push('/');
    }, [router]);

    // Efecto para verificar el token en el almacenamiento local al cargar la aplicación.
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('currentUser');

        if (storedToken && storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setIsAuthenticated(true);
                // Opcional: Validar el token con el backend si es necesario para asegurar que sigue siendo válido.
            } catch (error) {
                console.error("Error al parsear datos de usuario del almacenamiento local:", error);
                clearAuthData();
            }
        }
    }, []);

    const contextValue: AuthContextType = {
        user,
        token,
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
