'use client';
import React, { useState, useEffect } from 'react';
import Button from '../ui/button'; // Importa tu componente Button

interface DishFormData {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

interface DishFormProps {
    initialData?: DishFormData | null;
    onSave: (platoData: DishFormData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const DishForm: React.FC<DishFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
    // Estado del formulario
    const [formData, setFormData] = useState<DishFormData>({
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        is_active: true,
    });
    const [formError, setFormError] = useState<string | null>(null);

    // Efecto para precargar los datos si se está editando un plato
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre,
                descripcion: initialData.descripcion,
                precio: initialData.precio,
                categoria: initialData.categoria,
                is_active: initialData.is_active,
            });
        } else {
            // Reinicia el formulario para creación
            setFormData({
                nombre: '',
                descripcion: '',
                precio: 0,
                categoria: '',
                is_active: true,
            });
        }
        setFormError(null); // Limpia errores al cambiar de modo
    }, [initialData]);

    // Manejador de cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : (type === 'number' ? parseFloat(value) : value),
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validaciones básicas del lado del cliente
        if (!formData.nombre || !formData.descripcion || !formData.categoria || formData.precio <= 0) {
            setFormError('Todos los campos obligatorios deben ser llenados y el precio debe ser positivo.');
            return;
        }

        // Llama a la función onSave pasada por props
        onSave(formData);
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
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            {/* Campo Descripción */}
            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                ></textarea>
            </div>

            {/* Campo Precio */}
            <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    step="0.01" // Permite decimales para el precio
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0.01" // Asegura que el precio sea positivo
                />
            </div>

            {/* Campo Categoría */}
            <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            {/* Campo Activo */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
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
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Plato' : 'Crear Plato')}
                </Button>
            </div>
        </form>
    );
};

export default DishForm;
