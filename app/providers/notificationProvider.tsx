"use client"; // Necesario para manejar estados y eventos en Next.js

import { createContext, useContext, useState } from "react";
import Notification from "@/app/components/notification";

type NotificationType = {
    message: string;
    type: "success" | "error" | "info";
};

type ContextProps = {
    showNotification: (notification: NotificationType) => void;
    closeNotification: () => void;
};

const NotificationContext = createContext<ContextProps>({} as ContextProps);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notification, setNotification] = useState<NotificationType | null>(null);

    const showNotification = (notification: NotificationType) => {
        setNotification(notification);
    };
    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification, closeNotification }}>
            {children}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
