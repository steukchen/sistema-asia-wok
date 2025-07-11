// frontend/src/components/admin/AdminSidebar.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { lusitana } from '../../components/font';


export type UserRole = | 'cajero' | 'mesonero' | 'cocina' | 'superadmin';

export type AdminSection = 'users' | 'dishes' | 'orders' | 'settings';

interface AdminSidebarProps {
    activeSection: AdminSection; 
    onSectionChange: (section: AdminSection) => void;
    userRole: UserRole;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange, userRole }) => {
    const navItems: { name: string; href: AdminSection; icon: string; roles: UserRole[]; }[] = [
        { name: 'Gestión de Usuarios', href: 'users', icon: '👤', roles: ['superadmin'] },
        { name: 'Gestión de Platos', href: 'dishes', icon: '🍽️', roles: ['superadmin', 'cajero'] },
        { name: 'Gestión de Pedidos', href: 'orders', icon: '📋', roles: ['superadmin', 'cocina', 'mesonero', 'cajero'] },
        { name: 'Configuración Restaurante', href: 'settings', icon: '⚙️', roles: ['superadmin'] },
    ];

    return (
        <aside className="w-full md:w-64 bg-gray-800 text-white flex-shrink-1 py-8 px-5 rounded-lg shadow-xl md:mr-6 mb-6 md:mb-0">
            <h2 className={`${lusitana.className} text-2xl font-bold text-white mb-6 hidden md:block text-center`}>
                Menú
            </h2>
            <div className="flex items-center justify-center mb-6 md:hidden">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <span className={`${lusitana.className} text-3xl font-bold text-[#FB3D01]`}>
                        Admin
                    </span>
                </Link>
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
                                    type="button"
                                >
                                    <span className="mr-3 text-xl">{item.icon}</span>
                                    <span className="text-lg font-medium">{item.name}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
