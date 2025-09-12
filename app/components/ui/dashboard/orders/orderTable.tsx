'use client';
import React, { use } from 'react';
import Button from '../../button';
import { useAuth } from '@/app/providers/authProvider';

interface OrderTableProps {
    items: Order[]; 
    onViewDetails: (order: Order) => void; 
    onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void; 
    onDelete: (params: Record<string,string>) => void; 
    onEditOrder: (order: Order) => void; 
}

const OrderTable: React.FC<OrderTableProps> = ({ items: orders, onViewDetails, onUpdateStatus, onDelete, onEditOrder }) => {
    // Función auxiliar para obtener el color del estado
    orders.sort((a,b)=>(a.state == "pending" || a.state == "preparing" ? 0 : 1) - (b.state == "pending" || b.state == "preparing" ? 0 : 1))
    const getStatusClasses = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-red-100 text-red-800';
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800'
            case 'made':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const {user} = useAuth()
    const statusOptions: OrderStatus[] = user?.rol == "admin" ? ['pending','preparing','made','completed'] : ['pending','preparing','made'];

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
                        {/* <th scope="col" className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th> */}
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
                                    {order.table.name}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700">
                                    {new Date(order.order_date).toLocaleDateString()}
                                </td>
                                {/* <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700">
                                    ${order.total.toFixed(2)}
                                </td> */}
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.state)}`}>
                                        {order.state.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                {/* Acciones */}
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
                                    <div className="flex flex-col sm:flex-row justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                        {/* ESTADO DEL PEDIDO (SELECT) */}
                                        {user?.rol =="admin" && (
                                        <select
                                            value={order.state}
                                            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                            className="block w-full sm:w-auto px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition-all duration-200 ease-in-out"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>)}
                                        {user?.rol == "chef" && (
                                            <Button
                                                onClick={() => onUpdateStatus(order.id,order.state == "pending" ?"preparing" : "made")}
                                                className={`${ order.state == "pending" ?"bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700" } text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out`}
                                                type="button"
                                            >
                                                {order.state == "pending" ?"Preparando" : "Hecho"}
                                            </Button>
                                        )}
                                        {/* BOTÓN DE VER DETALLES */}
                                        <Button
                                            onClick={() => onViewDetails(order)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                        >
                                            Ver Detalles
                                        </Button>

                                        {/* BOTÓN DE MODIFICAR */}
                                        {user?.rol!="chef" && (order.state!="made" || user?.rol!="waiter") && (<Button
                                            onClick={() => onEditOrder(order)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                        >
                                            Modificar
                                        </Button>)}

                                        {/* BOTÓN DE ELIMINAR */}
                                        {user?.rol == "admin" && 
                                        (<Button
                                            onClick={() => onDelete({url:"/orders/delete_order/"+order.id})}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md w-full sm:w-auto shadow-sm transition-all duration-200 ease-in-out"
                                            type="button"
                                        >
                                            Eliminar
                                        </Button>)}
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
