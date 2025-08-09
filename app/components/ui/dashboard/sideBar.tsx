"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useState } from "react";
import { lusitana } from "@/app/components/fonts";
import { usePathname } from "next/navigation";

type Sections = "users" | "dishes" | "orders" | "settings" | "billing" | "customers";

interface SideBarProps {
    userRole: UserRole;
}

const SideBar: React.FC<SideBarProps> = ({ userRole }) => {
    const navItems: { name: string; href: Sections; icon: string; roles: UserRole[] }[] = [
        {
            name: "Gestión de Pedidos",
            href: "orders",
            icon: "📋",
            roles: ["admin", "chef", "waiter", "cashier"],
        },
        { name: "Gestion de Facturación", href: "billing", icon: "💸", roles: ["admin","cashier"] },
        { name: "Gestión de Platos", href: "dishes", icon: "🍽️", roles: ["admin", "cashier"] },
        { name: "Gestión de Clientes", href: "customers", icon: "👨‍👩‍👧‍👦", roles: ["admin", "cashier"] },
        { name: "Gestión de Usuarios", href: "users", icon: "👤", roles: ["admin"] },
        { name: "Configuración Restaurante", href: "settings", icon: "⚙️", roles: ["admin"] },
    ];
    const pathname = usePathname()
    const [activeSection, setActiveSection] = useState("");
    useEffect(()=>{
        setActiveSection(pathname.split("/")[2] || "")
    },[pathname])
    return (
        <aside className="w-full md:w-64 bg-gray-800 text-white flex-shrink-1 py-8 px-5 rounded-lg shadow-xl md:mr-6 mb-6 md:mb-0">
            <h2
                className={`${lusitana.className} text-2xl font-bold text-white mb-6 hidden md:block text-center`}
            >
                Menú
            </h2>
            <div className="flex items-center justify-center mb-6 md:hidden">
                <span className={`${lusitana.className} text-3xl font-bold text-[#FB3D01]`}>
                    Menú
                </span>
            </div>
            <nav>
                <ul className="space-y-3">
                    {navItems.map((item) => {
                        const isAllowed = item.roles.includes(userRole);

                        if (!isAllowed) {
                            return null;
                        }

                        return (
                            <li key={item.href}>
                                <Link
                                    href={"/dashboard/" + item.href}
                                    onClick={() => setActiveSection(item.href)}
                                    className={`
                                        w-full flex items-center p-3 rounded-md transition duration-200 ease-in-out
                                        ${
                                            activeSection === item.href
                                                ? "bg-[#FB3D01] text-white shadow-md"
                                                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                        }
                                        focus:outline-none focus:ring-2 focus:ring-[#FB3D01] focus:ring-offset-2 focus:ring-offset-gray-800
                                    `}
                                >
                                    <span className="mr-3 text-xl">{item.icon}</span>
                                    <span className="text-lg font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default SideBar;
