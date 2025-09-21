"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/api";
import { useNotification } from "@/app/providers/notificationProvider";
import Button from "@/app/components/ui/button";
import { generateDishesPDF } from "@/app/pdf/pdfDishes";

function getMonthStartEnd() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    // Formato YYYY-MM-DD
    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    return { startStr, endStr };
}

type DishReport = {
    id: number;
    dish: {
        id: number;
        name: string;
        description: string;
        price: number;
        type: {
            id: number;
            name: string;
        };
    };
    quantity: number;
};

export default function DishesMostPage() {
    const { startStr, endStr } = getMonthStartEnd();
    const [from, setFrom] = useState<string>(startStr);
    const [to, setTo] = useState<string>(endStr);
    const [dishes, setDishes] = useState<DishReport[]>([]);
    const { showNotification, closeNotification } = useNotification();

    const { 
        state: { data, loading, error }, 
        get
    } = useApi<DishReport, unknown>({
        resourceName: 'ReportePlatos'
    });

    useEffect(() => {
        fetchDishes();
        // eslint-disable-next-line
    }, []);

    const fetchDishes = () => {
        setDishes([]);
        const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);
        if (!isValidDate(from) || !isValidDate(to)) return;
        if (from > to) {
            showNotification({ message: "La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.", type: "error" });
            return;
        } else {
            closeNotification();
        }
        const url = `/orders/get_total_dishes_by_date?begin_date=${from}&end_date=${to}`;
        get("", { url });
    };

    useEffect(() => {
        if (data instanceof Array) {
            setDishes(data);
        } else {
            setDishes([]);
        }
    }, [data]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDishes();
    };

    const handleGeneratePDF = async () => {
        await generateDishesPDF({
            from,
            to,
            dishes,
        });
    };

    return (
        <div className="p-6 space-y-8">
            <HeadSection title="Reporte de Platos Más Vendidos" loading={loading} error={error} />
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
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Platos más vendidos</h2>
                {dishes.length === 0 && !loading && (
                    <p className="text-gray-600 text-center py-8">No hay datos de platos para mostrar.</p>
                )}
                <div className="flex flex-wrap justify-center gap-6" style={{ alignItems: "flex-start" }}>
                    {dishes.map((item, idx) => (
                        <div
                            key={item.dish.id}
                            className="flex flex-col items-center bg-gray-50 rounded-lg p-4 shadow-sm border min-w-[220px] mb-0"
                            style={{
                                marginLeft:
                                    dishes.length % 2 === 1 &&
                                    idx === dishes.length - 1 &&
                                    dishes.length > 1
                                        ? "auto"
                                        : undefined,
                                marginRight:
                                    dishes.length % 2 === 1 &&
                                    idx === dishes.length - 1 &&
                                    dishes.length > 1
                                        ? "auto"
                                        : undefined,
                            }}
                        >
                            <span className="text-xl font-bold text-orange-600">{item.dish.name}</span>
                            <span className="text-base text-gray-700 mt-1">{item.dish.type.name}</span>
                            <span className="text-2xl font-semibold text-gray-800 mt-2">{item.quantity} vendidos</span>
                            <span className="text-lg text-gray-600 mt-1">Precio: ${item.dish.price}</span>
                        </div>
                    ))}
                </div>
                {dishes.length > 0 && (
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