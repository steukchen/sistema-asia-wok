// frontend/src/components/admin/OrderTable.tsx
'use client';
import React from 'react';
import Button from '../ui/button';
import { Order, OrderStatus } from '../../types'; 

interface OrderTableProps {
    items: Order[]; // Recibe la lista de pedidos
    onViewDetails: (order: Order) => void; // Para ver detalles en un modal
    onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void; // Para actualizar estado
    onDelete: (orderId: number) => void; // Para eliminar pedido
    isLoading: boolean; // Para deshabilitar botones durante operaciones
    onEditOrder: (order: Order) => void; // Para editar un pedido
}

const OrderTable: React.FC<OrderTableProps> = ({ items: orders, onViewDetails, onUpdateStatus, onDelete, isLoading, onEditOrder }) => {

    // Función auxiliar para obtener el color del estado
    const getStatusClasses = (status: OrderStatus) => {
        switch (status) {
            case 'pendiente':
                return 'bg-blue-100 text-blue-800';
            case 'listo':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Opciones de estado para el select
    const statusOptions: OrderStatus[] = ['pendiente', 'listo'];

    return (
        <div className="overflow-x-auto w-full min-w-0 bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Encabezados de tabla */}
                        <th scope="col" className="px-5 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Mesa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        {/* Acciones */}
                        <th scope="col" className="px-10 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-4 text-center text-sm sm:text-base text-gray-500">
                                No hay pedidos registrados.
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id}>
                                {/* Celdas de tabla */}
                                <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-base font-medium text-gray-900">
                                    {order.id}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-base text-gray-700">
                                    {order.numero_mesa}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700">
                                    {new Date(order.fecha_creacion).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700">
                                    ${order.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.estado)}`}>
                                        {order.estado.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                {/* Acciones */}
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
                                    <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-2">

                                        {/* ESTADO DEL PEDIDO (SELECT) */}
                                        <select
                                            value={order.estado}
                                            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                            className="block w-full sm:w-auto px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition-all duration-200 ease-in-out"
                                            disabled={isLoading}
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>

                                        {/* BOTÓN DE VER DETALLES */}
                                        <Button
                                            onClick={() => onViewDetails(order)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                            disabled={isLoading}
                                        >
                                            Ver Detalles
                                        </Button>

                                        {/* BOTÓN DE MODIFICAR */}
                                        <Button
                                            onClick={() => onEditOrder(order)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                            disabled={isLoading}
                                        >
                                            Modificar
                                        </Button>

                                        {/* BOTÓN DE ELIMINAR */}
                                        <Button
                                            onClick={() => onDelete(order.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                            disabled={isLoading}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
