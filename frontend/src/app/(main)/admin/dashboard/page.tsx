// frontend/src/app/(main)/admin/dashboard/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../app/providers/providers';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import { UserManagement, DishManagement, OrderManagement, RestaurantSettings } from '../../../../components/admin/sections';
import { useCrudManagement } from '../../../../hooks/useCrudManagement';
import { useOrderManagement } from '../../../../hooks/useOrderManagement';
import { User, UserFormData, Plato, DishFormData, Order, OrderCreationFormData, OrderStatus, OrderUpdateFormData } from '../../../../types'; 
import type { AdminSection, UserRole } from '../../../../components/admin/AdminSidebar';
import { lusitana } from '../../../../components/font';
import Button from '../../../../components/ui/button';
import Modal from '../../../../components/ui/modal';
import OrderTable from '../../../../components/admin/OrderTable'; 
import OrderForm from '../../../../components/admin/OrderForm';   
import OrderDetailsModal from '../../../../components/admin/OrderDetailsModal'; 


const AdminDashboardPage: React.FC = () => {
    const { user, isLoading } = useAuth(); 
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<AdminSection | null>(null);

    const roleConfig: { [key in UserRole]: { allowedSections: AdminSection[]; defaultSection: AdminSection } } = {
        'admin': { allowedSections: ['users', 'dishes', 'orders', 'settings'], defaultSection: 'users' },
        'cajero': { allowedSections: ['orders', 'dishes'], defaultSection: 'orders' },
        'mesonero': { allowedSections: ['orders'], defaultSection: 'orders' },
        'cocina': { allowedSections: ['orders'], defaultSection: 'orders' },
    };

    const {
        items: users,
        loading: usersLoading,
        error: usersError,
        showForm: showUserForm,
        editingItem: editingUser,
        handleSaveItem: handleSaveUser,
        handleDeleteItem: handleDeleteUser,
        handleCreateNew: handleCreateNewUser,
        handleEditItem: handleEditUser,
        handleCancelForm: handleCancelUserForm,
        setError: setUserError
    } = useCrudManagement<User, UserFormData, UserFormData>('/users');

    const {
        items: dishes,
        loading: dishesLoading,
        error: dishesError,
        showForm: showDishForm,
        editingItem: editingDish,
        handleSaveItem: handleSaveDish,
        handleDeleteItem: handleDeleteDish,
        handleCreateNew: handleCreateNewDish,
        handleEditItem: handleEditDish,
        handleCancelForm: handleCancelDishForm,
        setError: setDishError,
        fetchItems: fetchDishes // ¡NUEVO! Alias fetchItems como fetchDishes
    } = useCrudManagement<Plato, DishFormData, DishFormData>('/platos');

    const {
        orders,
        loading: ordersLoading,
        error: ordersError,
        showDetailsModal: showOrderDetailsModal,
        selectedOrder,
        fetchOrders,
        handleCreateOrder,
        handleUpdateOrderStatus,
        handleDeleteOrder,
        handleViewOrderDetails,
        handleCloseDetailsModal,
        updateOrder, 
        setError: setOrderError
    } = useOrderManagement();

    const [showOrderFormModal, setShowOrderFormModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [showOrderEditModal, setShowOrderEditModal] = useState(false); 

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setShowOrderEditModal(true);
    };

    const handleSaveEditedOrder = async (data: OrderCreationFormData | OrderUpdateFormData) => { 
        if (!editingOrder) return; 

        try {
            await updateOrder(editingOrder.id, data as OrderUpdateFormData); 
            setShowOrderEditModal(false); 
            setEditingOrder(null); 
            fetchOrders(); 
        } catch (err) {
            console.error("Error al actualizar pedido en UI:", err);
        }
    };

    const handleSaveNewOrder = async (data: OrderCreationFormData | OrderUpdateFormData) => {
        try {
            await handleCreateOrder(data as OrderCreationFormData); 
            setShowOrderFormModal(false);
            fetchOrders(); 
        } catch (err) {
            console.error("Error al guardar nuevo pedido en el componente:", err);
        }
    };

    const handleCancelEditOrder = () => {
        setShowOrderEditModal(false);
        setEditingOrder(null);
    };

    useEffect(() => {
        if (!isLoading) { 
            console.log("--- useEffect: Inicio ---");
            console.log("isLoading:", isLoading);
            console.log("user:", user);

            if (user) {
                const normalizedUserRole = user.role.trim().toLowerCase();
                const userRole: UserRole = normalizedUserRole as UserRole;
                
                console.log("Rol de usuario original (desde Auth):", user.role);
                console.log("Rol de usuario normalizado:", normalizedUserRole);
                console.log("Rol de usuario casteado (para TypeScript):", userRole);
                console.log("Claves de roleConfig:", Object.keys(roleConfig));
                console.log("¿normalizedUserRole está en roleConfig.keys?", Object.keys(roleConfig).includes(userRole));

                if (!Object.keys(roleConfig).includes(userRole)) {
                    console.error(`ERROR CRÍTICO: Rol de usuario no reconocido o no manejado: '${user.role}' (normalizado: '${normalizedUserRole}'). Redirigiendo a /unauthorized.`);
                    router.push('/unauthorized');
                    return;
                }

                const config = roleConfig[userRole];
                console.log("Configuración de rol obtenida:", config);
                console.log("config.allowedSections.length:", config?.allowedSections.length);

                if (!config || config.allowedSections.length === 0) {
                    console.error(`ERROR CRÍTICO: Configuración de rol faltante o secciones permitidas vacías para el rol: ${user.role}. Redirigiendo a /unauthorized.`);
                    router.push('/unauthorized');
                    return;
                }

                if (activeSection === null || !config.allowedSections.includes(activeSection)) {
                    if (activeSection !== null && !config.allowedSections.includes(activeSection)) {
                        console.warn(`ADVERTENCIA: Usuario ${user.email} con rol ${user.role} intentó acceder a la sección ${activeSection} sin permiso. Redirigiendo a ${config.defaultSection}.`);
                    }
                    console.log(`Estableciendo activeSection a la sección por defecto: ${config.defaultSection}`);
                    setActiveSection(config.defaultSection);
                } else {
                    console.log(`activeSection ya está establecido y es válido: ${activeSection}`);
                }
            } else {
                console.log("Usuario no autenticado. Redirigiendo a /login.");
                router.push('/login');
            }
        }
        console.log("--- useEffect: Fin ---");
    }, [isLoading, user, router, activeSection]); 

    if (isLoading || !user || activeSection === null) { 
        console.log("Renderizando estado de carga/redirección. isLoading:", isLoading, "user:", user, "activeSection:", activeSection);
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">Cargando dashboard...</p>
            </div>
        );
    }

    const renderActiveSection = () => {
        const normalizedUserRole = user!.role.trim().toLowerCase();
        const userRole: UserRole = normalizedUserRole as UserRole;
        
        const config = roleConfig[userRole];

        if (!config || !config.allowedSections.includes(activeSection as AdminSection)) {
            console.error(`ERROR DE RENDERIZADO: Usuario ${user!.email} con rol ${user!.role} intentó renderizar la sección ${activeSection} sin permiso. Esto debería haber sido manejado por useEffect.`);
            return (
                <div className="text-red-600 text-center py-8">
                    No tienes permiso para ver esta sección.
                </div>
            );
        }

        switch (activeSection) {
            case 'users':
                return <UserManagement />;
            case 'dishes':
                return <DishManagement />;
            case 'orders':
                return (
                    <div className="bg-white min-h-[500px] w-full overflow-hidden p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left`}>
                            Gestión de Pedidos
                        </h2>

                        <div className="mb-6 flex justify-end">
                            <Button
                                onClick={() => {
                                    setShowOrderFormModal(true);
                                    fetchDishes();
                                }}
                                className="w-full px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                                type="button"
                                disabled={dishesLoading} 
                            >
                                Crear Nuevo Pedido
                            </Button>
                        </div>

                        {ordersLoading && (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-gray-600 text-lg">Cargando pedidos...</p>
                            </div>
                        )}
                        {ordersError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline"> {ordersError}</span>
                            </div>
                        )}
                        {dishesError && ( 
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error al cargar platos:</strong>
                                <span className="block sm:inline"> {dishesError}</span>
                            </div>
                        )}

                        {/* Modal para el formulario de creación de pedidos */}
                        <Modal
                            isOpen={showOrderFormModal}
                            onClose={() => setShowOrderFormModal(false)}
                            title="Crear Nuevo Pedido"
                        >
                            {dishesLoading ? (
                                <p className="text-gray-600 text-center">Cargando platos disponibles...</p>
                            ) : dishesError ? (
                                <p className="text-red-600 text-center">No se pudieron cargar los platos. No se puede crear el pedido.</p>
                            ) : (
                                <OrderForm
                                    availableDishes={dishes}
                                    onSave={handleSaveNewOrder} 
                                    onCancel={() => setShowOrderFormModal(false)}
                                    isLoading={ordersLoading}
                                    isEditing={false} 
                                />
                            )}
                        </Modal>

                        {/* Modal para el formulario de EDICIÓN de pedidos */}
                        <Modal
                            isOpen={showOrderEditModal}
                            onClose={handleCancelEditOrder}
                            title="Modificar Pedido"
                        >
                            {dishesLoading ? (
                                <p className="text-gray-600 text-center">Cargando platos disponibles...</p>
                            ) : dishesError ? (
                                <p className="text-red-600 text-center">No se pudieron cargar los platos. No se puede modificar el pedido.</p>
                            ) : (
                                <OrderForm
                                    availableDishes={dishes}
                                    onSave={handleSaveEditedOrder} 
                                    onCancel={handleCancelEditOrder}
                                    isLoading={ordersLoading}
                                    initialData={editingOrder} 
                                    isEditing={true} 
                                />
                            )}
                        </Modal>


                        {/* Tabla de Pedidos */}
                        {!ordersLoading && orders.length > 0 && (
                            <OrderTable
                                items={orders}
                                onViewDetails={handleViewOrderDetails}
                                onUpdateStatus={handleUpdateOrderStatus}
                                onDelete={handleDeleteOrder}
                                onEditOrder={handleEditOrder} 
                                isLoading={ordersLoading}
                            />
                        )}
                        {!ordersLoading && orders.length === 0 && !ordersError && (
                            <p className="text-gray-600 text-center py-8">No hay pedidos registrados.</p>
                        )}

                        {/* Modal de Detalles del Pedido */}
                        <OrderDetailsModal
                            isOpen={showOrderDetailsModal}
                            onClose={handleCloseDetailsModal}
                            order={selectedOrder}
                            onUpdateStatus={handleUpdateOrderStatus}
                            isLoading={ordersLoading}
                        />
                    </div>
                );
            case 'settings':
                return <RestaurantSettings />;
            default:
                console.error("ERROR: activeSection con valor inesperado en renderActiveSection:", activeSection);
                return null; 
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white p-2 mx-auto overflow-hidden">
            {/* Barra lateral de navegación para el administrador */}
            <AdminSidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
                userRole={user!.role.trim().toLowerCase() as UserRole} 
            />

            {/* Área de contenido principal del dashboard */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 min-w-0">
                {/* Título de bienvenida */}
                <h1 className={`${lusitana.className} text-3xl sm:text-4xl font-bold text-[#FB3D01] mb-6 sm:mb-8 text-center md:text-left`}>
                    Bienvenido, {user!.nombre} ({user!.role})
                </h1>
                <p className="text-gray-700 text-lg sm:text-xl mb-8 text-center md:text-left">
                    Gestiona tu restaurante de forma eficiente.
                </p>

                {/* Renderiza el componente de la sección activa */}
                {renderActiveSection()}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
