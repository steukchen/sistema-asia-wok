"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/api";
import { useNotification } from "@/app/providers/notificationProvider";
import Button from "@/app/components/ui/button";
import { generateCustomersPDF } from "@/app/pdf/pdfCustomers";

function getMonthStartEnd() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    return { startStr, endStr };
}

type CustomerReport = {
    id: number;
    customer: {
        ci: string;
        name: string;
        lastname: string;
        phone_number: string;
        address: string;
    };
    total_orders: number;
};

export default function FrequentClientsPage() {
    const { startStr, endStr } = getMonthStartEnd();
    const [from, setFrom] = useState<string>(startStr);
    const [to, setTo] = useState<string>(endStr);
    const [clients, setClients] = useState<CustomerReport[]>([]);
    const [number, setNumber] = useState<number>(10);
    const { showNotification, closeNotification } = useNotification();

    const { 
        state: { data, loading, error }, 
        get
    } = useApi<CustomerReport, unknown>({
        resourceName: 'ReporteClientes'
    });

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line
    }, []);

    const fetchClients = () => {
        setClients([]);
        const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
        if (!isValidDate(from) || !isValidDate(to)) return;
        if (from > to) {
            showNotification({ message: "La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.", type: "error" });
            return;
        } else {
            closeNotification();
        }
        const url = `/orders/get_frequent_customers_by_date?begin_date=${from}&end_date=${to}&number=${number}`;
        get("", { url });
    };

    useEffect(() => {
        if (data instanceof Array) {
            setClients(data);
        } else {
            setClients([]);
        }
    }, [data]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchClients();
    };

    const handleGeneratePDF = async () => {
        await generateCustomersPDF({
            from,
            to,
            clients,
        });
    };

    return (
        <div className="p-6 space-y-8">
            <HeadSection title="Clientes Más Frecuentes" loading={loading} error={error} />
            {!loading &&(<form className="flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleFilter}>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                        type="number"
                        min={1}
                        value={number}
                        onChange={e => setNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 ease-in-out"
                    />
                </div>
                <div className="w-full flex justify-end">
                    <Button 
                        type="submit"
                        className="w-full sm:w-auto"
                    >
                        Filtrar
                    </Button>
                </div>
            </form>)}
            {!loading &&(<div className="bg-white rounded-lg shadow border p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Clientes más frecuentes</h2>
                {clients.length === 0 && !loading && (
                    <p className="text-gray-600 text-center py-8">No hay datos de clientes para mostrar.</p>
                )}
                <div className="flex flex-wrap justify-center gap-6" style={{ alignItems: "flex-start" }}>
                    {clients.map((item, idx) => (
                        <div
                            key={item.customer.ci}
                            className="flex flex-col items-center bg-gray-50 rounded-lg p-4 shadow-sm border min-w-[220px] mb-0"
                            style={{
                                marginLeft:
                                    clients.length % 2 === 1 &&
                                    idx === clients.length - 1 &&
                                    clients.length > 1
                                        ? "auto"
                                        : undefined,
                                marginRight:
                                    clients.length % 2 === 1 &&
                                    idx === clients.length - 1 &&
                                    clients.length > 1
                                        ? "auto"
                                        : undefined,
                            }}
                        >
                            <span className="text-xl font-bold text-orange-600">{item.customer.name} {item.customer.lastname}</span>
                            <span className="text-base text-gray-700 mt-1">C.I.: {item.customer.ci}</span>
                            <span className="text-base text-gray-700 mt-1">Teléfono: {item.customer.phone_number}</span>
                            <span className="text-base text-gray-700 mt-1">Dirección: {item.customer.address}</span>
                            <span className="text-2xl font-semibold text-gray-800 mt-2">{item.total_orders} compras</span>
                        </div>
                    ))}
                </div>
                {clients.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg"
                            onClick={handleGeneratePDF}
                        >
                            Generar Informe
                        </Button>
                    </div>
                )}
            </div>)}
        </div>
    );
}