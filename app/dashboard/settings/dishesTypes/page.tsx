'use client';
import HeadSection from '@/app/components/ui/dashboard/headSection';
import { useEffect, useState } from 'react';
import Modal from '@/app/components/ui/dashboard/modal';
import { useApi } from '@/app/hooks/api';
import DishTypeForm from '@/app/components/ui/dashboard/dishes/dishTypeForm';
import DishTypeTable from '@/app/components/ui/dashboard/dishes/dishTypeTable';

export default function DishTypeSection() {
    const [showForm, setShowForm] = useState(false);
    const [dishTypes, setDishTypes] = useState<DishType[] | null>(null);
    const [editDishType, setEditDishType] = useState<DishType | null>(null);

    const {
        state: { data, loading, error },
        get,
        create,
        update,
        delete: deleteItem,
    } = useApi<DishType, DishType>({
        resourceName: 'Tipo de Plato',
        createTransform: (formData) => ({
            ...formData,
        }),
    });

    useEffect(() => {
        get('', { url: '/dishes_types/get_dishes_types' });
    }, []);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setDishTypes(data);
        }
    }, [data]);

    const saveDishType = async (dishTypeData: DishType, params: Record<string, string>) => {
        const response = editDishType ? await update(dishTypeData, params) : await create(dishTypeData, params);
        if (response) {
            setShowForm(false);
        } else {
            setShowForm(true);
        }
        get('', { url: '/dishes_types/get_dishes_types' });
    };

    const deleteDishType = async (params: Record<string, string>) => {
        if (!confirm('¿Está seguro de eliminar el tipo de plato?')) return;
        await deleteItem(params);
        get('', { url: '/dishes_types/get_dishes_types' });
    };

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestión de Tipos de Platos"
                textButton="Crear Tipo"
                error={error}
                onClickButton={() => {
                    setShowForm(true);
                    setEditDishType(null);
                }}
            />

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editDishType ? 'Modificar Tipo de Plato' : 'Crear Nuevo Tipo'}
            >
                <DishTypeForm
                    onSave={saveDishType}
                    onCancel={() => setShowForm(false)}
                    initialData={editDishType}
                    isLoading={loading}
                />
            </Modal>

            {!showForm && !loading && dishTypes && (
                <DishTypeTable
                    items={dishTypes}
                    onEdit={(type) => {
                        setEditDishType(type);
                        setShowForm(true);
                    }}
                    onDelete={deleteDishType}
                />
            )}

            {!showForm && !loading && !dishTypes && !error && (
                <p className="text-gray-600 text-center py-8">No hay tipos de platos registrados.</p>
            )}
        </div>
    );
}