"use client";
import React, { useState, useEffect } from "react";
import Button from "@/app/components/ui/button";
import { useNotification } from "@/app/providers/notificationProvider";
import { useAuth } from "@/app/providers/authProvider";
import { useRouter } from "next/navigation";

interface UserFormProps {
    initialData?: UserFormData | null;
    onSave: (userData: UserFormData,params: Record<string, string>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel}) => {
    const {user,setUser} = useAuth()
    const router = useRouter()
    const [loading,setLoading] = useState(false)
    const [formData, setFormData] = useState<UserFormData>({
        email: "",
        username: "",
        rol: "waiter",
        password: "",
    });
    const { showNotification, closeNotification } = useNotification();
    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email,
                username: initialData.username,
                rol: initialData.rol,
                password: "",
            });
        } else {
            setFormData({
                email: "",
                username: "",
                rol: "waiter",
                password: "",
            });
        }
    }, [initialData]);

    // Manejador de cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true)
        e.preventDefault();
        closeNotification();
        // Validaciones básicas del lado del cliente
        if (!formData.email || !formData.username || !formData.rol) {
            showNotification({
                message: "Todos los campos obligatorios deben ser llenados.",
                type: "error",
            });
            setLoading(false)
            return;
        }
        if (formData.username.length <=3 || formData.username.includes(" ")){
            showNotification({
                message: "El nombre de usuario debe tener minimo 4 caracteres y no puede contener espacios",
                type: "error",
            });
            setLoading(false)
            return;
        }
        const EMAIL_REGEX = /^(?!.*\+\d@)(?:[^@]+@[^@]+\.[^@]+)$/;
        if (!EMAIL_REGEX.test(formData.email)){
            // Contraseña requerida solo al crear
            showNotification({
                message: "Email Invalido",
                type: "error",
            });
            setLoading(false)
            return;
        }

        // Prepara el payload para enviar al backend
        const payload: UserFormData = {
            email: formData.email,
            username: formData.username,
            rol: formData.rol,
        };

        // Maneja el campo de contraseña específicamente para actualizaciones y creaciones
        if (initialData) {
            // Si se está editando un usuario existente
            if (formData.password) {
                // Si el campo de contraseña NO está vacío, envíalo
                const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
                if (!PASSWORD_REGEX.test(formData.password || "")) {
                    showNotification({
                        message: "La contraseña debe tener al menos 8 caracteres, contener una mayuscula, una minuscula, un numero y un caracter especial",
                        type: "error",
                    });
                    setLoading(false)
                    return;
                }
                payload.password = formData.password;
            } else {
                delete payload.password;
            }
        } else {
            const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
            if (!PASSWORD_REGEX.test(formData.password || "")) {
                showNotification({
                    message: "La contraseña debe tener al menos 8 caracteres, contener una mayuscula, una minuscula, un numero y un caracter especial",
                    type: "error",
                });
                setLoading(false)
                return;
            }
            payload.password = formData.password;
        }

        // Llama a la función onSave pasada por props
        await onSave(payload,{url:initialData ? "/users/update_user/"+initialData.id:"/users/create_user"});

        if (initialData && payload){
            if (initialData.id == user?.id){
                const dataUser: User = {
                    id:initialData.id ? initialData.id : "",
                    email:payload.email,
                    username:payload.username,
                    rol:payload.rol
                } 
                setUser(dataUser)
                if (payload.rol != "admin"){
                    router.push("/dashboard")
                }
            }
        }
        setLoading(false)
    };

    if (loading) return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                    Cargando...
                </p>
            </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Campo Nombre */}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Usuario
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={"Ingrese Nombre de Usuario"}
                    autoComplete="new-username"
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
                    placeholder={"Ingrese Email"}
                    autoComplete="new-email"
                />
            </div>

            {/* Campo Contraseña (solo si se está creando o si se quiere cambiar) */}
            {(!initialData || (initialData && formData.password !== undefined)) && (
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Contraseña {initialData ? "(dejar vacío para no cambiar)" : ""}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={initialData ? "••••••••" : "Ingrese contraseña"}
                        autoComplete="new-password"
                    />
                </div>
            )}

            {/* Campo Rol */}
            <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
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
                    <option value="admin">Admin</option>
                    <option value="cashier">Cajero</option>
                    <option value="waiter">Mesero</option>
                    <option value="chef">Chef</option>
                </select>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-6">
                <Button
                    type="button" // Importante: para que no envíe el formulario
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {initialData ? "Actualizar Usuario" : "Crear Usuario"}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
