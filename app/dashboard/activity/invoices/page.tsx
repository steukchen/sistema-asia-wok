"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/api";
import { useNotification } from "@/app/providers/notificationProvider";
import Button from "@/app/components/ui/button"
import OrderTable from "@/app/components/ui/dashboard/orders/orderTable";
import OrderDetailsModal from "@/app/components/ui/dashboard/orders/orderDetailsModal";

export default function InvoicesActivityPage() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [nationality, setNationality] = useState<string>("V");
    const [ci, setCi] = useState<string>("");
    const [orderState, setOrderState] = useState<OrderStatus>("completed");
    const { showNotification, closeNotification } = useNotification();
    const [selectedOrder,setSelectedOrder] = useState<OrderWithDishes | null>(null);
    const [showDetailsModal,setShowDetailsModal] = useState(false);
    const [selectedOrderC,setSelectedOrderC] = useState<OrderWithCurrencies | null>(null);

    const orderStates: { value: OrderStatus; label: string }[] = [
        { value: "pending", label: "Pendiente" },
        { value: "preparing", label: "Preparando" },
        { value: "made", label: "Hecho" },
        { value: "completed", label: "Completado" },
    ];

    const { 
        state: { data, loading, error }, 
        get
    } = useApi<Order, OrderCreationFormData | OrderUpdateFormData>({
        resourceName: 'Orden',
        createTransform: (formData) => ({
            ...formData
        })
    });

    // Limpiar orders cada vez que cambia la cédula o nacionalidad
    useEffect(() => {
        setOrders(null);
    }, [ci, nationality]);


    useEffect(() => {
        if (data instanceof Array) {
            setOrders(data)
        } else {
            setOrders(null)
        }
    }, [data])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setOrders(null);

        const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
        if (!isValidDate(from) || !isValidDate(to)) return;
        if (from > to) {
            showNotification({ message: "La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.", type: "error" });
            return;
        } else {
            closeNotification();
        }

        let url = `/orders/get_orders_by_date_customer_state?begin_date=${from}&end_date=${to}&state=${orderState}`;
        if (ci) {
            if (!/^\d{7,8}$/.test(ci)) {
                showNotification({ message: 'Cédula inválida. Debe tener 7 u 8 dígitos.', type: 'error' });
                return;
            }
            url += `&ci=${nationality}-${ci}`;
        }
        get("", { url });
    };

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
        <div className="p-6 space-y-8">
            <HeadSection title="Facturas por Fechas" loading={loading} error={error} />
            {!loading && (
                <form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleFilter}>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                        <div className="flex">
                            <select
                                value={nationality}
                                onChange={e => setNationality(e.target.value)}
                                className="px-2 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ease-in-out"
                            >
                                <option value="V">V</option>
                                <option value="E">E</option>
                            </select>
                            <input
                                type="text"
                                value={ci}
                                onChange={e => setCi(e.target.value.replace(/\D/, ""))}
                                placeholder="Cédula"
                                className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ease-in-out"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={orderState}
                            onChange={e => setOrderState(e.target.value as OrderStatus)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ease-in-out"
                        >
                            {orderStates.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full flex justify-end">
                        <Button 
                            type="submit"
                            className="w-full sm:w-auto"
                        >
                            Filtrar
                        </Button>
                    </div>
                </form>
            )}
            <div className="overflow-x-auto bg-white rounded-lg shadow border">
                {!loading && orders && (
                    <OrderTable
                        items={orders}
                        onViewDetails={handleViewOrderDetails}
                        onUpdateStatus={() => { }}
                    />
                )}
                {!loading && !orders && !error && (
                    <p className="text-gray-600 text-center py-8">No hay ordenes para mostrar.</p>
                )}
            </div>
            <OrderDetailsModal 
                isOpen={showDetailsModal}
                onClose={()=>{
                    setShowDetailsModal(false);
                    setSelectedOrderC(null);
                    setSelectedOrder(null);
                }}
                orderCurrencies={selectedOrderC || null}
                order={selectedOrder}
                onUpdateStatus={()=>{}}
                onEditOrder={() => {
                        setShowDetailsModal(false);
                }}
            />
        </div>
    );
}