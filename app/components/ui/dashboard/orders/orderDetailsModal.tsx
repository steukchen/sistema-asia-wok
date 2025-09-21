// frontend/src/components/admin/OrderDetailsModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Modal from '../modal';
import Button from '../../button';
import { useAuth } from '@/app/providers/authProvider';
import { usePathname } from 'next/navigation';
import { useNotification } from '@/app/providers/notificationProvider';
import { generatePDF } from '@/app/pdf/pdf';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderWithDishes | null;
    orderCurrencies?: OrderWithCurrencies | null;
    onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
    onEditOrder: (order: Order) => void; 
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, orderCurrencies, onUpdateStatus,onEditOrder }) => {
    const {user} = useAuth()
    const pathname = usePathname()
    const [customer,setCustomer] = useState<Customer | null>(null);
    const [valueCurrency,setValueCurrency] = useState(1)
    const [currencies,setCurrencies] = useState<Currency[] | null>(null)
    const {showNotification,closeNotification} = useNotification()
    const [loading,setLoading] = useState(false)
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
    const statusOptions: OrderStatus[] = user?.rol == "admin" ? ['pending','preparing','made','completed'] : ['pending','preparing','made'];

    useEffect(()=>{
        const params = new URLSearchParams({url:"/currencies/get_currencies"})
        setLoading(true)
        closeNotification()
        fetch("/api/get?"+params,{
            method:"GET"
        })
        .then(response=>response.json())
        .then(data=>{
            setCurrencies(data)
            setLoading(false)
        }).catch(rej=>{
            showNotification({message:"Error al cargar las divisas: "+rej,type:"error"})
            setLoading(false)

        })
    },[])
    useEffect(()=>{
        if (order?.customer_id){
            setLoading(true)
            const paramsCustomer = new URLSearchParams({
                url: `/customers/get_customer_by_id/`+order.customer_id
            });
            fetch(`/api/get?`+paramsCustomer, {
                method: 'GET'
            }).then(response=>response.json())
            .then((data: Customer)=>{
                setCustomer(data)
                setLoading(false)
            }).finally(()=>setLoading(false))
        }else{
            setCustomer(null)
        }
    },[order])

    if (!order) {
        return null;
    }
    const total = order.dishes.map(d=>d.quantity*d.dish.price).reduce((t, v) => t + v, 0);

    if (loading) return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Pedido #${order.id}`}>
            <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                Cargando...
            </p>
        </Modal>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Pedido #${order.id}`}>
            <div className="space-y-4 text-sm text-gray-800 sm:text-base">
                {/* Información del Pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong className="font-semibold">Mesa:</strong> {order.table.name}</p>
                        <p><strong className="font-semibold">Fecha Pedido:</strong> {new Date(order.order_date).toLocaleString()}</p>
                    </div>
                    <div>
                        <p>
                            <strong className="font-semibold">Estado:</strong>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.state)}`}>
                                {order.state.replace(/_/g, ' ')}
                            </span>
                        </p>
                        {customer &&(
                            <>
                                <p><strong className="font-semibold">Cedula Cliente: </strong>{customer.ci}</p>
                                <p><strong className="font-semibold">Nombre Cliente: </strong>{customer.name+" "+customer.lastname}</p>
                            </>
                        )}
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
                {user?.rol == "admin" && !pathname.includes("/billing") && !pathname.includes("/invoices") && (<div className="mt-4">
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
                                        {user?.rol!="chef" && (<><td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{(item.dish.price*valueCurrency).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-sm sm:text-base text-gray-900 whitespace-nowrap">{(item.quantity * item.dish.price *valueCurrency).toFixed(2)}</td></>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {!orderCurrencies && (<div className='text-gray-800 pt-2 grid grid-cols-2 gap-8'>
                {currencies && (<select
                    id="current-currency"
                    value={valueCurrency}
                    onChange={e => {setValueCurrency(parseFloat(e.target.value))}}
                    className="block w-[60%] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 text-sm sm:text-base transition-all duration-200 ease-in-out"
                >
                    {currencies.map((currency) => (
                        <option key={currency.id} value={currency.exchange}>
                            {currency.name}
                        </option>
                    ))}
                </select>)}
                <p className='text-xl text-right'><strong className="font-semibold">Total: {(total*valueCurrency).toFixed(2)}</strong></p>
            </div>)}

            {orderCurrencies && (
                <>
                <h4 className="font-bold text-lg sm:text-xl mt-6 mb-2 text-gray-800">Divisas del Pedido:</h4>
                {(!orderCurrencies.currencies[0]) ? (
                    <p className="text-gray-500">No hay pago registrados.</p>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Divisa</th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Cantidad</th>
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Cambio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orderCurrencies.currencies.map((item: OrderCurrencyItem, index: number) => (
                                    <tr key={index} className='select-none'>
                                        <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.currency.name}</td>
                                        <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.quantity}</td>
                                        <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.currency.exchange}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </>
                
            )}

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
                {/* Botón de Modificar */}
                {user?.rol!="chef" && (order.state!="made" || user?.rol!="waiter") && !pathname.includes("/billing") && !pathname.includes("/invoices") && (
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

                {(pathname.includes("/billing") || pathname.includes("/invoices")) && customer && orderCurrencies && (
                    <Button
                        onClick={() => generatePDF({customer:customer,order:order,currencies:orderCurrencies.currencies,dishes:order.dishes})}
                        className={` bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out`}
                        type="button"
                    >
                        Comprobante
                    </Button>
                )}
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
