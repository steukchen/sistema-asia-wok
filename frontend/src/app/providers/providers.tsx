'use client'
import { createContext, useContext, useState, useEffect } from 'react';

type User = {
    role: 'admin' | 'mesonero' | 'cajero' | 'cocina';
    name: string,
};

type AuthContextType = {
    user: User | null;
    login: (role: User['role'], name: string) => void;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {// Recuperar sesión al cargar (ej: desde localStorage)
        const savedUser = localStorage.getItem('asiawok-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (role: User['role'], name: string) => {
    const userData = { role, name };
    setUser(userData);
    localStorage.setItem('asiawok-user', JSON.stringify(userData)); // Persistir
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('asiawok-user');
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
