'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '../../components/font';

interface AdminSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
    const navItems = [
        { name: 'Gestión de Usuarios', href: 'users', icon: '👤' }, // Icono de usuario
        { name: 'Gestión de Platos', href: 'dishes', icon: '🍽️' }, // Icono de plato
        { name: 'Gestión de Pedidos', href: 'orders', icon: '📋' }, // Icono de pedido
        { name: 'Configuración Restaurante', href: 'settings', icon: '⚙️' }, // Icono de configuración
    ];

    return (
        // Sidebar responsivo: oculto en móviles, se muestra en pantallas medianas y grandes
        <aside className="w-full md:w-64 bg-gray-800 text-white flex-shrink-0 p-4 rounded-lg shadow-xl md:mr-6 mb-6 md:mb-0">
            <h2 className={`${lusitana.className} text-2xl font-bold text-white mb-6 hidden md:block text-center`}>
                Admin Menú
            </h2>
            <nav>
                <ul className="space-y-3">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <button
                                onClick={() => onSectionChange(item.href)}
                                className={`
                                    w-full flex items-center p-3 rounded-md transition duration-200 ease-in-out
                                    ${activeSection === item.href
                                        ? 'bg-[#FB3D01] text-white shadow-md'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-[#FB3D01] focus:ring-offset-2 focus:ring-offset-gray-800
                                `}
                            >
                                <span className="mr-3 text-xl">{item.icon}</span>
                                <span className="text-lg font-medium">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
