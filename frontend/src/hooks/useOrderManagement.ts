// frontend/src/hooks/useOrderManagement.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/providers/providers';
// Importar desde el nuevo archivo de tipos
import { Order, OrderStatus, OrderCreationFormData, OrderUpdateFormData, OrderWithDishes } from '../types'; 

export const useOrderManagement = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithDishes | null>(null);

    // Función para cargar los pedidos desde el backend
    const fetchOrders = useCallback(async () => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `/orders/get_orders`
            });
            const response = await fetch(`/api/get?`+params, {
                method: 'GET'
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
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al cargar datos.');
            }
            
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Carga los pedidos al montar el componente que usa este hook
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Función para crear un nuevo pedido
    const handleCreateOrder = useCallback(async (orderData: OrderCreationFormData) => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }
        const body = {
            "table_id": orderData.table_id,
            "dishes": orderData.dishes.map(dish=>([dish.dish_id,dish.quantity]))
        }
        console.log(body)
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `/orders/create_order`
            });
            const response = await fetch(`/api/post?`+params, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear el pedido.');
            }

            const newOrder: Order = await response.json();
            setOrders((prevOrders) => [newOrder, ...prevOrders]); 
            return newOrder;
        } catch (err) {
            console.error("Error creating order:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al crear pedido.');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ¡NUEVA FUNCIÓN! Función para actualizar un pedido existente
    const updateOrder = useCallback(async (orderId: number, orderData: OrderUpdateFormData) => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            throw new Error('No autenticado.');
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `/orders/update_dishes/${orderId}`
            });
            const body = {
                "table_id": orderData.table_id,
                "dishes": orderData.dishes?.map(dish=>([dish.dish_id,dish.quantity]))
            }
            const response = await fetch(`/api/post?`+params, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al actualizar el pedido.');
            }

            const updatedOrder: OrderWithDishes = await response.json();
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
        } catch (err) {
            console.error("Error updating order:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al actualizar pedido.');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ selectedOrder,user]); // Añadido selectedOrder a las dependencias

    // Función para manejar la actualización del estado de un pedido (simplificada, ya que updateOrder puede hacer esto)
    // Se mantiene para compatibilidad con OrderDetailsModal si no se quiere refactorizarlo inmediatamente
    const handleUpdateOrderStatus = useCallback(async (orderId: number, newStatus: OrderStatus) => {
        console.log(orderId,newStatus)
        try {
            const params = new URLSearchParams({
                url: `/orders/update_order/${orderId}`
            });
            const body = {
                "state": newStatus.toLowerCase()
            }
            const response = await fetch(`/api/post?`+params, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
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
            return updatedOrder;

        } catch (err) {
            console.error("Error updating order:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al actualizar pedido.');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []); // Depende de la nueva función updateOrder


    // Función para manejar la eliminación de un pedido
    const handleDeleteOrder = useCallback(async (orderId: number) => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción es irreversible.')) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `/orders/delete_order/${orderId}`
            });
            const response = await fetch(`/api/delete?`+params, {
                method: 'DELETE'
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
        } catch (err) {
            console.error("Error deleting order:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al eliminar pedido.');
            }
        } finally {
            setLoading(false);
        }
    }, [ selectedOrder,user]);

    // Función para abrir el modal de detalles de un pedido
    const handleViewOrderDetails = useCallback(async (order: Order) => {
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `/orders/get_order_dishes/`+order.id
            });
            const response = await fetch(`/api/get?`+params, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404 && errorData.detail === "No se encontro la orden.") {
                    setError(null);
                    return;
                }
                throw new Error(errorData.detail || 'Error al cargar platos.');
            }

            const data: OrderWithDishes = await response.json();
            setSelectedOrder(data);

        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al cargar datos.');
            }
            
        } finally {
            setLoading(false);
        }
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
