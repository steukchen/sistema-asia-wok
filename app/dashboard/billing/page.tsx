"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import {useApi} from "@/app/hooks/api"
import { useNotification } from "@/app/providers/notificationProvider";
import OrderDetailsModal from "@/app/components/ui/dashboard/orders/orderDetailsModal";
import { useWebSocket } from "@/app/hooks/ws";
import BillingTable from "@/app/components/ui/dashboard/billing/billingTable";
import BillingForm from "@/app/components/ui/dashboard/billing/billingForm";

export default function OrderSection() {
    const [showForm, setShowForm] = useState(false);
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [editOrder, setEditOrder] = useState<Order | null>(null);
    const [selectedOrder,setSelectedOrder] = useState<OrderWithDishes | null>(null);
    const [selectedOrderC,setSelectedOrderC] = useState<OrderWithCurrencies | null>(null);
    const [showDetailsModal,setShowDetailsModal] = useState(false);
    const {showNotification} = useNotification();
    const {sendMessage,messages,isConnected,closeSocket,connect} = useWebSocket()


    const { 
        state: { data, loading, error }, 
        get,
        update
    } = useApi<Order, OrderCurrenciesCreation | OrderUpdateFormData>({
        resourceName: 'Orden'
    });

    useEffect(() => {
        get("",{url:`/orders/get_orders_to_bill`})
        if (!isConnected){
            connect()
        }
        return ()=>{
            if (isConnected){
                closeSocket()
            }
        }
    }, [isConnected]);
    useEffect(()=>{
        if (messages.at(-1)?.message == "UpdateOrder"){
            get("",{url:`/orders/get_orders_to_bill`})
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

    const saveOrder = async (orderData: OrderCurrenciesCreation | OrderUpdateFormData,params: Record<string,string>)=>{
        const data = await update(orderData,params)
        if (data){
            await sendMessage({
                message: "UpdateOrder"
            })  
            setShowForm(false)
        }else setShowForm(true)
        
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

        const paramsC = new URLSearchParams({
            url: `/orders/get_order_currencies/`+order.id
        });
        const responseC = await fetch(`/api/get?`+paramsC, {
            method: 'GET'
        });
        if (!responseC.ok) {
            showNotification({message:"Error al cargar el pedido",type:"error"})
        }

        const dataC: OrderWithCurrencies = await responseC.json();
        if (dataC.currencies[0]){
            setSelectedOrderC(dataC)
        }
        setShowDetailsModal(true);
    }

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestion de Facturacion"
                textButton=""
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
                title={"Facturacion"}
            >
                <BillingForm
                    onSave={saveOrder}
                    onCancel={() => setShowForm(false)}
                    initialData={editOrder ? editOrder : null}
                />
            </Modal>

            {!showForm && !loading && orders && (
                <BillingTable
                    items={orders}
                    onViewDetails={handleViewOrderDetails}
                    onBilling={(order) => {
                    setShowForm(true);
                    setEditOrder(order);
                }}
                />
            )}

            <OrderDetailsModal 
                isOpen={showDetailsModal}
                onClose={()=>{
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                    setSelectedOrderC(null);
                }}
                order={selectedOrder}
                orderCurrencies={selectedOrderC || null}
                onUpdateStatus={()=>{}}
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
