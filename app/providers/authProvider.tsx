"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    wsToken: string;
    setWsToken: (wsToken: string) =>void;
    setUser: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [wsToken, setWsToken] = useState("");
    const router = useRouter();

    const logout = useCallback(async () => {
        const response = await fetch(`/api/logout`, {
            method: "POST",
        });
        if (response.ok) {
            setUser(null);
            setWsToken("")
            router.push("/");
            router.refresh()
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

            const userData: DataResponse = await userResponse.json();

            setWsToken(userData.ws_token);
            setUser(userData.user_data);
        } catch (err) {
            console.log("Error de validacion: ", err);
            logout()
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
        wsToken,
        setWsToken,
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
