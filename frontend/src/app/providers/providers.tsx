'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/services/auth';

type User = {
    role: 'admin' | 'mesonero' | 'cajero' | 'cocina';
    name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('asiawok-token');
            if (token) {
                try {
                    // Decodificar el token JWT manualmente
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        role: payload.role,
                        name: payload.name || payload.email.split('@')[0],
                        email: payload.email
                    });
                } catch (error) {
                    console.error('Error decoding token:', error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { access_token } = await apiLogin({
                username: email,
                password
            });

            localStorage.setItem('asiawok-token', access_token);

            // Decodificar el payload del JWT
            const payload = JSON.parse(atob(access_token.split('.')[1]));

            setUser({
                role: payload.role,
                name: payload.name || email.split('@')[0],
                email: email
            });

            router.push(`/${payload.role}`);
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Permite manejar el error en el componente
        }
    };

    const logout = () => {
        localStorage.removeItem('asiawok-token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext) as AuthContextType;
}