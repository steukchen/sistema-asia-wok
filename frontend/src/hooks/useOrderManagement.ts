// frontend/src/hooks/useOrderManagement.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/providers/providers';
// Importar desde el nuevo archivo de tipos
import { Order, OrderStatus, OrderCreationFormData, OrderUpdateFormData } from '../types'; 

export const useOrderManagement = () => {
    const { token } = useAuth();
    const API_BASE_URL = 'http://localhost:8000';

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Función para cargar los pedidos desde el backend
    const fetchOrders = useCallback(async () => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404 && errorData.detail === "No se encontraron pedidos.") {
                    setOrders([]);
                    setError(null);
                    return;
                }
                throw new Error(errorData.detail || 'Error al cargar pedidos.');
            }

            const data: Order[] = await response.json();
            setOrders(data);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.message || 'Error desconocido al cargar pedidos.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Carga los pedidos al montar el componente que usa este hook
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Función para crear un nuevo pedido
    const handleCreateOrder = useCallback(async (orderData: OrderCreationFormData) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear el pedido.');
            }

            const newOrder: Order = await response.json();
            setOrders((prevOrders) => [newOrder, ...prevOrders]); 
            return newOrder;
        } catch (err: any) {
            console.error("Error creating order:", err);
            setError(err.message || 'Error desconocido al crear pedido.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    // ¡NUEVA FUNCIÓN! Función para actualizar un pedido existente
    const updateOrder = useCallback(async (orderId: number, orderData: OrderUpdateFormData) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            throw new Error('No autenticado.');
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al actualizar el pedido.');
            }

            const updatedOrder: Order = await response.json();
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? updatedOrder : order
                )
            );
            // Si el pedido seleccionado es el que se actualizó, actualízalo también
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(updatedOrder); 
            }
            return updatedOrder;
        } catch (err: any) {
            console.error("Error updating order:", err);
            setError(err.message || 'Error desconocido al actualizar pedido.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, selectedOrder]); // Añadido selectedOrder a las dependencias

    // Función para manejar la actualización del estado de un pedido (simplificada, ya que updateOrder puede hacer esto)
    // Se mantiene para compatibilidad con OrderDetailsModal si no se quiere refactorizarlo inmediatamente
    const handleUpdateOrderStatus = useCallback(async (orderId: number, newStatus: OrderStatus) => {
        // Reutilizamos la nueva función updateOrder
        try {
            await updateOrder(orderId, { estado: newStatus });
        } catch (err) {
            console.error("Error updating order status via handleUpdateOrderStatus:", err);
            setError((err as Error).message || 'Error desconocido al actualizar estado.');
        }
    }, [updateOrder]); // Depende de la nueva función updateOrder


    // Función para manejar la eliminación de un pedido
    const handleDeleteOrder = useCallback(async (orderId: number) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción es irreversible.')) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al eliminar pedido.');
            }

            // Elimina el pedido del estado local sin recargar toda la lista
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
            // Cierra el modal de detalles si el pedido eliminado era el seleccionado
            if (selectedOrder && selectedOrder.id === orderId) {
                setShowDetailsModal(false);
                setSelectedOrder(null);
            }
        } catch (err: any) {
            console.error("Error deleting order:", err);
            setError(err.message || 'Error desconocido al eliminar pedido.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedOrder]);

    // Función para abrir el modal de detalles de un pedido
    const handleViewOrderDetails = useCallback((order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    }, []);

    // Función para cerrar el modal de detalles
    const handleCloseDetailsModal = useCallback(() => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
        setError(null);
    }, []);

    return {
        orders,
        loading,
        error,
        showDetailsModal,
        selectedOrder,
        fetchOrders,
        handleUpdateOrderStatus,
        handleDeleteOrder,
        handleViewOrderDetails,
        handleCloseDetailsModal,
        handleCreateOrder,
        updateOrder,
        setError
    };
};
