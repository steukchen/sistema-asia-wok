'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/button';
import { useNotification } from '@/app/providers/notificationProvider';

export interface CustomerFormProps {
    initialData?: CustomerFormData | null;
    onSave: (customerData: CustomerFormData, params: Record<string, string>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isLoading,
}) => {
    const [formData, setFormData] = useState({
        ci: '',
        name: '',
        lastname: '',
        phone_number: '',
        address: '',
    });

    // Nuevo: control separado para nacionalidad y número de cédula
    const [nationality, setNationality] = useState<'V' | 'E'>('V');
    const [ciNumber, setCiNumber] = useState<string>('');

    const { showNotification, closeNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Sincroniza campos base
            setFormData({
                ci: initialData.ci,
                name: initialData.name,
                lastname: initialData.lastname,
                phone_number: initialData.phone_number,
                address: initialData.address || '',
            });

            // Divide la CI en nacionalidad y número
            if (initialData.ci && initialData.ci.includes('-')) {
                const [nat, num] = initialData.ci.split('-');
                setNationality((nat?.toUpperCase() === 'E' ? 'E' : 'V') as 'V' | 'E');
                setCiNumber(num || '');
            } else {
                // Fallback si viene sin guion
                setNationality('V');
                setCiNumber(initialData.ci?.replace(/\D/g, '') || '');
            }
        } else {
            // Reset para crear
            setFormData({
                ci: '',
                name: '',
                lastname: '',
                phone_number: '',
                address: '',
            });
            setNationality('V');
            setCiNumber('');
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Nuevo: control de entrada para el número de cédula (solo dígitos y máximo 8)
    const handleCiNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        const trimmed = raw.slice(0, 8); // máx 8 dígitos
        setCiNumber(trimmed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true);

        // Construye la CI final y normaliza
        const ciFinal = `${nationality}-${ciNumber}`.toUpperCase();
        const payload = {
            ...formData,
            ci: ciFinal,
            name: formData.name.trim(),
            lastname: formData.lastname.trim(),
            phone_number: formData.phone_number.trim(),
            address: formData.address?.trim() || '',
        };

        // Validaciones
        if (!nationality) {
            showNotification({ message: 'Seleccione una nacionalidad.', type: 'error' });
            setLoading(false);
            return;
        }

        if (!/^\d{7,8}$/.test(ciNumber)) {
            showNotification({ message: 'Cédula inválida. Debe tener 7 u 8 dígitos.', type: 'error' });
            setLoading(false);
            return;
        }

        if (!payload.name || !payload.lastname || !payload.phone_number) {
            showNotification({ message: 'Todos los campos obligatorios deben ser llenados.', type: 'error' });
            setLoading(false);
            return;
        }

        if (payload.name.length < 4 || payload.lastname.length < 4) {
            showNotification({ message: 'Nombre y apellido deben tener al menos 4 caracteres.', type: 'error' });
            setLoading(false);
            return;
        }

        const url = initialData?.id
            ? `/customers/update_customer/${initialData.id}`
            : '/customers/create_customer';

        try {
            await onSave(payload, { url });
        } catch (err) {
            showNotification({ message: 'No se pudo guardar el cliente.', type: 'error' });
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
        <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Cédula: Nacionalidad + Número */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula de Identidad
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                        <select
                            id="nationality"
                            value={nationality}
                            onChange={(e) => setNationality((e.target.value.toUpperCase() === 'E' ? 'E' : 'V') as 'V' | 'E')}
                            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="V">V</option>
                            <option value="E">E</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <input
                            type="text"
                            id="ci_number"
                            inputMode="numeric"
                            pattern="\d{7,8}"
                            placeholder="Ej: 12345678"
                            value={ciNumber}
                            onChange={handleCiNumberChange}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Nombre */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Apellido */}
            <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                </label>
                <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Teléfono */}
            <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                </label>
                <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Dirección */}
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (Opcional)
                </label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            {/* Botones */}
            <div className="flex flex-col md:flex-row gap-3 justify-end space-x-3 mt-6 md:w-[60%] md:relative md:ml-auto">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {initialData ? 'Actualizar Cliente' : 'Registrar Cliente'}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;
