'use client';
import React from 'react';
import Button from '../ui/button';
import Modal from '../ui/modal';
import { lusitana } from '../font';
import { User, UserFormData, Plato, DishFormData } from '../../types'; 

interface AdminSectionLayoutProps<T extends { id: number }, FormData> {
    title: string;
    createButtonText: string;
    loading: boolean;
    error: string | null;
    showForm: boolean;
    editingItem: T | null;
    items: T[];
    
    // Componentes para la tabla y el formulario
    TableComponent: React.ComponentType<{
        items: T[];
        onEdit: (item: T) => void;
        onDelete: (itemId: number) => void;
    }>;
    FormComponent: React.ComponentType<{
        initialData?: FormData | null;
        onSave: (data: FormData) => void;
        onCancel: () => void;
        isLoading: boolean;
    }>;

    // Funciones del hook useCrudManagement
    onSave: (data: FormData) => Promise<void>;
    onCancelForm: () => void;
    onEditItem: (item: T) => void;
    onDeleteItem: (itemId: number) => Promise<void>;
    onCreateNew: () => void;
}

const AdminSectionLayout = <T extends { id: number }, FormData>({ 
    title,
    createButtonText,
    loading,
    error,
    showForm,
    editingItem,
    items,
    TableComponent,
    FormComponent,
    onSave,
    onCancelForm,
    onEditItem,
    onDeleteItem,
    onCreateNew,
}: AdminSectionLayoutProps<T, FormData>) => {
    return (
        <div className="bg-white min-h-[500px] w-full overflow-hidden">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left`}>
                {title}
            </h2>

            {/* Botón para abrir el formulario de creación */}
            <div className="mb-6 flex justify-end">
                <Button
                    onClick={onCreateNew}
                    className="w-full px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                    type="button"
                >
                    {createButtonText}
                </Button>
            </div>

            {/* Mensaje de carga o error */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-600 text-lg">Cargando {title.toLowerCase()}...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Modal para el formulario de creación/edición */}
            <Modal
                isOpen={showForm}
                onClose={onCancelForm}
                title={editingItem ? `Editar ${title.replace('Gestión de ', '').replace(/s$/, '')}` : `Crear Nuevo ${title.replace('Gestión de ', '').replace(/s$/, '')}`}
            >
                <FormComponent
                    initialData={editingItem as FormData | null}
                    onSave={onSave}
                    onCancel={onCancelForm}
                    isLoading={loading}
                />
            </Modal>

            {/* Tabla de ítems */}
            {!showForm && !loading && items.length > 0 && (
                <TableComponent
                    items={items}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                />
            )}
            {!showForm && !loading && items.length === 0 && !error && (
                <p className="text-gray-600 text-center py-8">No hay {title.toLowerCase().replace('gestión de ', '').replace(/s$/, '')} registrados.</p>
            )}
        </div>
    );
};

export default AdminSectionLayout;
