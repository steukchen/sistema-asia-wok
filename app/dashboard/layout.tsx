"use client";
import SideBar from "../components/ui/dashboard/sideBar";
import { lusitana } from "../components/fonts";
import Navbar from "../components/ui/dashboard/navBar";
import { useAuth } from "../providers/authProvider";

export default function LayoutDashBoard({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (!user)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                    Cargando aplicación...
                </p>
            </div>
        );

    const rol = user.rol == "cashier" ? "cajer@" : user.rol=="waiter" ? "mesero" : user.rol

    return (
        <>
            <Navbar />
            <div className="flex flex-col md:flex-row min-h-screen bg-white p-2 mx-auto overflow-hidden">
                <SideBar userRole={user.rol} />
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
                    {/* Título de bienvenida */}
                    <h1
                        className={`${lusitana.className} text-3xl sm:text-4xl font-bold text-[#FB3D01] mb-6 sm:mb-8 text-center md:text-left`}
                    >
                        Bienvenido, {user!.username} ({rol.toUpperCase()})
                    </h1>
                    <p className="text-gray-700 text-lg sm:text-xl mb-8 text-center md:text-left">
                        Gestiona tu restaurante de forma eficiente.
                    </p>
                    {children}
                </div>
            </div>
        </>
    );
}
