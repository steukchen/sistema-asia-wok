// frontend/src/components/admin/OrderDetailsModal.tsx
'use client';
import React from 'react';
import Modal from '../modal';
import Button from '../../button';
import { useAuth } from '@/app/providers/authProvider';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderWithDishes | null;
    onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
    onEditOrder: (order: Order) => void; 
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onUpdateStatus,onEditOrder }) => {
    const {user} = useAuth()
    if (!order) {
        return null;
    }

    // Función auxiliar para obtener el color del estado
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

    // Opciones de estado para el select
    const statusOptions: OrderStatus[] = user?.rol != "chef" ? ['pending','preparing','made','completed'] : ['pending','preparing'];


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Pedido #${order.id}`}>
            <div className="space-y-4 text-sm text-gray-800 sm:text-base">
                {/* Información del Pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong className="font-semibold">Mesa:</strong> {order.table_id}</p>
                        <p><strong className="font-semibold">Fecha Pedido:</strong> {new Date(order.order_date).toLocaleString()}</p>
                        {/* <p><strong className="font-semibold">Última Actualización:</strong> {new Date(order.fecha_actualizacion).toLocaleString()}</p> */}
                        {/* <p><strong className="font-semibold">Total:</strong> ${order.total.toFixed(2)}</p> */}
                    </div>
                    <div>
                        <p>
                            <strong className="font-semibold">Estado:</strong>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.state)}`}>
                                {order.state.replace(/_/g, ' ')}
                            </span>
                        </p>
                    </div>
                    <div className='col-span-2'>
                        <p><strong className="font-semibold wrap-break-word">Notas:</strong><br />{order.notes?.split('\n').map((line, index) => (
                            <span key={index}>
                                {line}
                                <br />
                            </span>
                        ))}</p>
                        
                    </div>
                </div>

                {/* Actualizar Estado del Pedido */}
                {user?.rol != "waiter" && user?.rol !="chef" && (<div className="mt-4">
                    <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">Actualizar Estado:</label>
                    <div className="flex items-center space-x-2">
                        <select
                            id="order-status"
                            value={order.state}
                            onChange={(e) => {onUpdateStatus(order.id, e.target.value as OrderStatus); order.state= e.target.value as OrderStatus}}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 text-sm sm:text-base transition-all duration-200 ease-in-out"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>)}

                {/* Detalles de los Ítems del Pedido */}
                <h4 className="font-bold text-lg sm:text-xl mt-6 mb-2">Ítems del Pedido:</h4>
                {(!order.dishes || order.dishes.length === 0) ? (
                    <p className="text-gray-500">No hay ítems en este pedido.</p>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Plato</th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Cantidad</th>
                                    {user?.rol!="chef" && (<><th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Precio Unitario</th>
                                    <th className="px-4 py-2 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Subtotal</th></>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.dishes.map((item: OrderItem, index: number) => (
                                    <tr key={index} className='select-none'>
                                        <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.dish.name}</td>
                                        <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.quantity}</td>
                                        {user?.rol!="chef" && (<><td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">${item.dish.price.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-sm sm:text-base text-gray-900 whitespace-nowrap">${(item.quantity * item.dish.price).toFixed(2)}</td></>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
                {/* Botón de Modificar */}
                {user?.rol!="chef" && (order.state!="made" || user?.rol!="waiter") && (
                    <Button
                        onClick={()=>onEditOrder(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                        type="button"
                    >
                        Modificar Pedido
                    </Button>
                )}
                {user?.rol=="chef" && (
                    <Button
                        onClick={() => {onUpdateStatus(order.id,order.state == "pending" ?"preparing" : "made"); onClose()}}
                        className={`${ order.state == "pending" ?"bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700" } text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out`}
                        type="button"
                    >
                        {order.state == "pending" ?"Preparando" : "Hecho"}
                    </Button>
                )}

                {/* Botón de cerrar el modal */}
                <Button
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                    type="button"
                >
                    Cerrar
                </Button>
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;
