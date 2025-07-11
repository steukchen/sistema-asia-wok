'use client';
import React, { useState, useEffect } from 'react';
import Button from '../ui/button';


interface UserFormData {
    email: string;
    username: string;
    rol: string;
    password?: string;
    status: boolean;
}

interface UserFormProps {
    initialData?: UserFormData | null;
    onSave: (userData: UserFormData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
    // Estado del formulario
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        username: '',
        rol: 'mesonero', // Rol por defecto
        password: '',
        status: true,
    });
    const [formError, setFormError] = useState<string | null>(null);

    // Efecto para precargar los datos si se está editando un usuario
    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email,
                username: initialData.username,
                rol: initialData.rol,
                password: '', // La contraseña no se precarga por seguridad
                status: initialData.status,
            });
        } else {
            // Reinicia el formulario para creación
            setFormData({
                email: '',
                username: '',
                rol: 'waiter',
                password: '',
                status: true,
            });
        }
        setFormError(null); // Limpia errores al cambiar de modo
    }, [initialData]);

    // Manejador de cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validaciones básicas del lado del cliente
        if (!formData.email || !formData.username || !formData.rol) {
            setFormError('Todos los campos obligatorios deben ser llenados.');
            return;
        }
        if (!initialData && !formData.password) { // Contraseña requerida solo al crear
            setFormError('La contraseña es requerida para nuevos usuarios.');
            return;
        }
        if (formData.password && formData.password.length < 6) {
            setFormError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        
        // Prepara el payload para enviar al backend
        const payload: UserFormData = {
            email: formData.email,
            username: formData.username,
            rol: formData.rol,
            status: formData.status,
        };

        // Maneja el campo de contraseña específicamente para actualizaciones y creaciones
        if (initialData) { // Si se está editando un usuario existente
            if (formData.password) { // Si el campo de contraseña NO está vacío, envíalo
                if (formData.password.length < 6) {
                    setFormError('La contraseña debe tener al menos 6 caracteres.');
                    return;
                }
                payload.password = formData.password;
            } else {
                // Si el campo de contraseña está vacío, NO lo incluyas en el payload.
                delete payload.password;
            }
        } else { // Si se está creando un nuevo usuario
            if (!formData.password) { // La contraseña es obligatoria para nuevos usuarios
                setFormError('La contraseña es requerida para nuevos usuarios.');
                return;
            }
            if (formData.password.length < 6) {
                setFormError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            payload.password = formData.password;
        }

        // Llama a la función onSave pasada por props
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de error del formulario */}
            {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {formError}</span>
                </div>
            )}

            {/* Campo Nombre */}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    placeholder={'Ingrese Nombre de Usuario'}
                />
            </div>

            {/* Campo Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-indigo-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    placeholder={'Ingrese Email'}
                />
            </div>

            {/* Campo Contraseña (solo si se está creando o si se quiere cambiar) */}
            {(!initialData || (initialData && formData.password !== undefined)) && (
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña {initialData ? '(dejar vacío para no cambiar)' : ''}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={initialData ? '••••••••' : 'Ingrese contraseña'}
                        required={!initialData} // Requerido solo si es un nuevo usuario
                    />
                </div>
            )}

            {/* Campo Rol */}
            <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1" >
                    Rol
                </label>
                <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                >
                    <option value="superadmin">SuperAdmin</option>
                    <option value="admin">Admin</option>
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                </select>
            </div>

            {/* Campo Activo */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#FB3D01] border-gray-300 rounded focus:ring-[#FB3D01]"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Activo
                </label>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-6">
                <Button
                    type="button" // Importante: para que no envíe el formulario
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Usuario' : 'Crear Usuario')}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
