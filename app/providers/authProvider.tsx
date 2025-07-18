"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    setUser: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const logout = useCallback(async () => {
        const response = await fetch(`/api/logout`, {
            method: "POST",
        });
        if (response.ok) {
            setUser(null);
            router.push("/");
        }
    }, [router]);

    const validateToken = useCallback(async () => {
        try {
            const userResponse = await fetch(`/api/validateToken`, {
                method: "GET",
            });

            if (!userResponse.ok) {
                throw new Error("Error al obtener la información del usuario");
            }

            const userData: User = await userResponse.json();

            setUser(userData);
        } catch (err) {
            console.log("Error de validacion: ", err);
        }
    }, []);

    useEffect(() => {
        try {
            validateToken();
        } catch (err) {
            console.log(err);
        }
    }, [validateToken]);

    const contextValue: AuthContextType = {
        user,
        setUser,
        logout,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};
