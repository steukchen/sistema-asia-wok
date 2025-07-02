'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/button';
import { lusitana } from '../font';
import UserTable from '../admin/UserTable';
import UserForm from '../admin/UserForm';
import { useAuth } from '../../app/providers/providers';

interface User {
    id: number;
    email: string;
    nombre: string;
    role: string;
    is_active: boolean;
}

// --- Componente para la Gestión de Usuarios ---
export const UserManagement: React.FC = () => {
    const { token } = useAuth();
    const API_BASE_URL = 'http://localhost:8000';

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Función para cargar los usuarios desde el backend
    const fetchUsers = useCallback(async () => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al cargar usuarios.');
            }

            const data: User[] = await response.json();
            setUsers(data);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || 'Error desconocido al cargar usuarios.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Carga los usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Función para manejar la creación/actualización de un usuario
    const handleSaveUser = async (userData: any) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const method = editingUser ? 'PUT' : 'POST';
            const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/users/`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al ${editingUser ? 'actualizar' : 'crear'} usuario.`);
            }

            // Después de guardar, recarga la lista de usuarios y cierra el formulario
            await fetchUsers();
            setShowForm(false);
            setEditingUser(null); // Limpia el usuario en edición
        } catch (err: any) {
            console.error(`Error saving user:`, err);
            setError(err.message || 'Error desconocido al guardar usuario.');
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la eliminación de un usuario
    const handleDeleteUser = async (userId: number) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al eliminar usuario.');
            }

            // Después de eliminar, recarga la lista de usuarios
            await fetchUsers();
        } catch (err: any) {
            console.error("Error deleting user:", err);
            setError(err.message || 'Error desconocido al eliminar usuario.');
        } finally {
            setLoading(false);
        }
    };

    // Función para iniciar la edición de un usuario
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 min-h-[500px]">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left`}>
                Gestión de Usuarios
            </h2>

            {/* Botón para abrir el formulario de creación de usuario */}
            <div className="mb-6 flex justify-end">
                <Button
                    onClick={() => { setShowForm(true); setEditingUser(null); }} // Abre el formulario en modo creación
                    className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                >
                    Crear Nuevo Usuario
                </Button>
            </div>

            {/* Mensaje de carga o error */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-600 text-lg">Cargando usuarios...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Formulario de creación/edición de usuario (visible si showForm es true) */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full relative">
                        <h3 className={`${lusitana.className} text-xl font-bold text-gray-800 mb-4`}>
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h3>
                        <UserForm
                            initialData={editingUser}
                            onSave={handleSaveUser}
                            onCancel={() => { setShowForm(false); setEditingUser(null); }}
                            isLoading={loading}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de usuarios (visible si no se está mostrando el formulario) */}
            {!showForm && !loading && users.length > 0 && (
                <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            )}
            {!showForm && !loading && users.length === 0 && !error && (
                <p className="text-gray-600 text-center py-8">No hay usuarios registrados.</p>
            )}
        </div>
    );
};

// --- Componente para la Gestión de Platos ---
export const DishManagement: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Gestión de Platos
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Gestiona el menú del restaurante: añade nuevos platos, actualiza precios y descripciones.
            </p>
            <Button
                onClick={() => alert('¡Ir a la lista de Platos!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Administrar Platos
            </Button>
        </div>
    );
};

// --- Componente para la Gestión de Pedidos (completa para Admin) ---
export const OrderManagement: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Gestión de Pedidos
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Visualiza, crea, modifica y elimina todos los pedidos del restaurante.
            </p>
            <Button
                onClick={() => alert('¡Ir a la gestión de Pedidos!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Administrar Pedidos
            </Button>
        </div>
    );
};

// --- Componente para la Configuración del Restaurante ---
export const RestaurantSettings: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-4`}>
                Configuración del Restaurante
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
                Ajusta parámetros generales, como la gestión de mesas y categorías.
            </p>
            <Button
                onClick={() => alert('¡Ir a la Configuración!')}
                className="w-auto px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
            >
                Configurar
            </Button>
        </div>
    );
};
