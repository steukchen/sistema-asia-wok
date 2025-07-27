"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import {useApi} from "@/app/hooks/api"
import OrderTable from "@/app/components/ui/dashboard/orders/orderTable";
import OrderForm from "@/app/components/ui/dashboard/orders/orderForm";
import { useNotification } from "@/app/providers/notificationProvider";
import OrderDetailsModal from "@/app/components/ui/dashboard/orders/orderDetailsModal";
import { useWebSocket } from "@/app/hooks/ws";

export default function OrderSection() {
    const [showForm, setShowForm] = useState(false);
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [editOrder, setEditOrder] = useState<Order | null>(null);
    const [selectedOrder,setSelectedOrder] = useState<OrderWithDishes | null>(null);
    const [showDetailsModal,setShowDetailsModal] = useState(false);
    const {showNotification} = useNotification();
    const {sendMessage,messages,isConnected,closeSocket,connect} = useWebSocket()


    const { 
        state: { data, loading, error }, 
        get, 
        create, 
        update, 
        delete: deleteItem
    } = useApi<Order, OrderCreationFormData | OrderUpdateFormData>({
        resourceName: 'Orden',
        createTransform: (formData) => ({
            ...formData
        })
    });

    useEffect(() => {
        get("",{url:`/orders/get_orders`})
        if (!isConnected){
            connect()
        }
        return ()=>{
            console.log(isConnected)
            if (isConnected){
                closeSocket()
            }
        }
    }, [isConnected]);
    useEffect(()=>{
        if (messages.at(-1)?.message == "UpdateOrder"){
            get("",{url:`/orders/get_orders`})
            setShowDetailsModal(false)
        }
    },[messages])

    useEffect(()=>{
        if (data instanceof Array){
            setOrders(data)
        }else{
            setOrders(null)
        }
    },[data])

    const saveOrder = async (orderData: OrderCreationFormData | OrderUpdateFormData,params: Record<string,string>)=>{
        const data = editOrder ? await update(orderData,params) : await create(orderData,params)
        if (data){
            await sendMessage({
                message: "UpdateOrder"
            })  
            setShowForm(false)
        }else setShowForm(true)
        
    }

    const deleteOrder = async (params: Record<string,string>)=>{
        if(!confirm("¿Esta seguro de eliminar la orden?")) return
        await deleteItem(params);get("",{url:`/orders/get_orders`})
        await sendMessage({
            message: "UpdateOrder"
        })
    }

    const onUpdateStatus = async (orderId: number,state: OrderStatus) =>{
        await update({state:state},{url:"/orders/update_order/"+orderId})
        await sendMessage({
            message: "UpdateOrder"
        })
    }

    const handleViewOrderDetails = async (order: Order) => {
        const params = new URLSearchParams({
            url: `/orders/get_order_dishes/`+order.id
        });
        const response = await fetch(`/api/get?`+params, {
            method: 'GET'
        });
        if (!response.ok) {
            showNotification({message:"Error al cargar el pedido",type:"error"})
        }

        const data: OrderWithDishes = await response.json();
        setSelectedOrder(data);
        setShowDetailsModal(true);
    }

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestion de Ordenes"
                textButton="Crear Orden"
                error={error}
                onClickButton={() => {
                    setShowForm(true);
                    setEditOrder(null);
                }}
            />
            {/* Modal para el formulario de creación/edición */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editOrder ? "Modificar Orden" : `Crear Nueva Orden`}
            >
                <OrderForm
                    onSave={saveOrder}
                    onCancel={() => setShowForm(false)}
                    initialData={editOrder ? editOrder : null}
                />
            </Modal>

            {!showForm && !loading && orders && (
                <OrderTable
                    items={orders}
                    onViewDetails={handleViewOrderDetails}
                    onUpdateStatus={onUpdateStatus}
                    onEditOrder={(order: Order) => {
                        setEditOrder(order);
                        setShowForm(true);
                    }}
                    onDelete={deleteOrder}
                />
            )}

            <OrderDetailsModal 
                isOpen={showDetailsModal}
                onClose={()=>{
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onUpdateStatus={onUpdateStatus}
                onEditOrder={(order: Order) => {
                        setEditOrder(order);
                        setShowForm(true);
                        setShowDetailsModal(false);
                }}
            />

            {!showForm && !loading && !orders && !error && (
                <p className="text-gray-600 text-center py-8">No hay ordenes para mostrar.</p>
            )}
        </div>
    );
}
