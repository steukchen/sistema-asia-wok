// frontend/src/components/admin/sections.tsx
'use client';
import { useState } from 'react';
import React from 'react';
import Button from '../ui/button';
import { lusitana } from '../font';
import UserTable from './UserTable';
import UserForm from './UserForm';
import DishTable from './DishTable';
import DishForm from './DishForm';
import OrderTable from './OrderTable';
import OrderForm from './OrderForm';
import OrderDetailsModal from './OrderDetailsModal';
import AdminSectionLayout from './AdminSectionLayout';
import { useCrudManagement } from '../../hooks/useCrudManagement';
import { useOrderManagement } from '../../hooks/useOrderManagement';
import { User, UserFormData, Plato, DishFormData, Order, OrderStatus, OrderCreationFormData } from '../../types';

export const UserManagement: React.FC = () => {
    const {
        items: users,
        loading,
        error,
        showForm,
        editingItem: editingUser,
        handleSaveItem: handleSaveUser,
        handleDeleteItem: handleDeleteUser,
        handleCreateNew,
        handleEditItem: handleEditUser,
        handleCancelForm,
        setError
    } = useCrudManagement<User, UserFormData, UserFormData>('/users');

    return (
        <AdminSectionLayout<User, UserFormData>
            title="Gestión de Usuarios"
            createButtonText="Crear Nuevo Usuario"
            loading={loading}
            error={error}
            showForm={showForm}
            editingItem={editingUser}
            items={users}
            TableComponent={UserTable}
            FormComponent={UserForm}
            onSave={handleSaveUser}
            onCancelForm={handleCancelForm}
            onEditItem={handleEditUser}
            onDeleteItem={handleDeleteUser}
            onCreateNew={handleCreateNew}
        />
    );
};

export const DishManagement: React.FC = () => {
    const {
        items: platos,
        loading,
        error,
        showForm,
        editingItem: editingPlato,
        handleSaveItem: handleSavePlato,
        handleDeleteItem: handleDeletePlato,
        handleCreateNew,
        handleEditItem: handleEditPlato,
        handleCancelForm,
        setError
    } = useCrudManagement<Plato, DishFormData, DishFormData>('/platos');

    return (
        <AdminSectionLayout<Plato, DishFormData>
            title="Gestión de Platos"
            createButtonText="Crear Nuevo Plato"
            loading={loading}
            error={error}
            showForm={showForm}
            editingItem={editingPlato}
            items={platos}
            TableComponent={DishTable}
            FormComponent={DishForm}
            onSave={handleSavePlato}
            onCancelForm={handleCancelForm}
            onEditItem={handleEditPlato}
            onDeleteItem={handleDeletePlato}
            onCreateNew={handleCreateNew}
        />
    );
};

export const OrderManagement: React.FC = () => {
    const {
        orders,
        loading,
        error,
        showDetailsModal,
        selectedOrder,
        handleUpdateOrderStatus,
        handleDeleteOrder,
        handleViewOrderDetails,
        handleCloseDetailsModal,
        setError
    } = useOrderManagement();

    return (
        <div className="bg-white min-h-[500px] w-full overflow-hidden p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left`}>
                Gestión de Pedidos
            </h2>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-600 text-lg">Cargando pedidos...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <OrderTable
                items={orders}
                onViewDetails={handleViewOrderDetails}
                onUpdateStatus={handleUpdateOrderStatus}
                onDelete={handleDeleteOrder}
                onEditOrder={() => { /* No-op, ya que el botón de editar se pasa desde el padre */ }} 
                isLoading={loading}
            />

            <OrderDetailsModal
                isOpen={showDetailsModal}
                onClose={handleCloseDetailsModal}
                order={selectedOrder}
                onUpdateStatus={handleUpdateOrderStatus}
                isLoading={loading}
            />
        </div>
    );
};

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
                type="button"
            >
                Configurar
            </Button>
        </div>
    );
};
