'use client';
import React from 'react';
import Button from '../ui/button';

interface User {
    id: number;
    email: string;
    nombre: string;
    role: string;
    is_active: boolean;
}

interface UserTableProps {
    items: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ items: users, onEdit, onDelete }) => {
    return (
        // Contenedor responsivo para la tabla
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activo
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {user.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                                {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-6 font-semibold rounded-full ${user.is_active ? 'bg-green-300 text-green-800' : 'bg-red-300 text-red-800'}`}>
                                    {user.is_active ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        onClick={() => onEdit(user)}
                                        className="bg-gray-500 hover:bg-[[#E03A00]] yeltext-white px-3 py-1 text-xs rounded-md"
                                        type="button"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(user.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-md"
                                        type="button"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
