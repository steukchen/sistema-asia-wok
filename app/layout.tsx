import type { Metadata } from "next";
import { montserrat } from "@/app/components/fonts";
import "./globals.css";
import { AuthProvider } from "./providers/authProvider";
import { NotificationProvider } from "./providers/notificationProvider";

export const metadata: Metadata = {
    title: "Asia Wok APP",
    description: "App para la gestion de Asia Wok",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${montserrat.className} antialiased`}>
                <NotificationProvider>
                    <AuthProvider>{children}</AuthProvider>
                </NotificationProvider>
            </body>
        </html>
    );
}
