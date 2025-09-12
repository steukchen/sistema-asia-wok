'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/button';
import { useNotification } from '@/app/providers/notificationProvider';

interface DishTypeFormProps {
    initialData?: DishType | null;
    onSave: (dishTypeData: DishType, params: Record<string, string>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const DishTypeForm: React.FC<DishTypeFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isLoading,
}) => {
    const [name, setName] = useState('');
    const { showNotification, closeNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true);

        if (!name || name.trim().length < 4) {
            showNotification({
                message: 'El nombre del tipo de plato debe tener al menos 4 caracteres.',
                type: 'error',
            });
            setLoading(false);
            return;
        }

        const payload: DishType = {
            id: initialData?.id ?? 0,
            name: name.trim().toUpperCase(),
        };

        const url = initialData?.id
            ? `/dishes_types/update_dish_type/${initialData.id}`
            : '/dishes_types/create_dish_type';

        try {
            await onSave(payload, { url });
        } catch {
            showNotification({ message: 'No se pudo guardar el tipo de plato.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading || isLoading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando...</p>
            </div>
        );

    return (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-black">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Tipo de Plato
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: ENTRADA, POSTRE..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-orange-300 bg-white"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    {initialData ? 'Actualizar Tipo' : 'Crear Tipo'}
                </Button>
            </div>
        </form>
    );
};

export default DishTypeForm;