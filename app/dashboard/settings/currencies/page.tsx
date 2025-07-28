// app/dashboard/settings/currencies/page.tsx
"use client";

import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import { useApi } from "@/app/hooks/api";
import CurrencyForm from "@/app/components/ui/dashboard/currencies/currencyForm";
import CurrencyTable from "@/app/components/ui/dashboard/currencies/currencyTable";
import { useNotification } from "@/app/providers/notificationProvider";

export default function CurrenciesPage() {
    const { showNotification } = useNotification();

    const {
        state: { data, loading, error },
        get,
        create,
        update,
        delete: deleteCurrency,
    } = useApi<Currency, {
        name: string;
        exchange: number;
    }>({
        resourceName: "Moneda",
    });


    const [showForm, setShowForm] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[] | null>(null);
    const [editCurrency, setEditCurrency] = useState<Currency | null>(null);

    const loadCurrencies = () => {
        get("", { url: "/currencies/get_currencies" });
    };

    useEffect(() => {
        loadCurrencies();
    }, []);

    useEffect(() => {
        if (Array.isArray(data)) setCurrencies(data);
        else setCurrencies(null);
    }, [data]);

    const saveCurrency = async (
        currencyData: {
            name: string;
            exchange: number;
        },
        params: Record<string, string>
    ) => {
        const result = editCurrency
            ? await update(currencyData, params)
            : await create(currencyData, params);

        if (result) {
            setShowForm(false);
            loadCurrencies();
        } else {
            setShowForm(true);
        }
    };


    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta moneda?")) return;
        await deleteCurrency({ url: `/currencies/delete_currency/${id}` });
        loadCurrencies();
    };

    return (
        <div className="bg-white text-gray-800 w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestión de Monedas"
                textButton="Crear Moneda"
                error={error}
                onClickButton={() => {
                    setEditCurrency(null);
                    setShowForm(true);
                }}
            />

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editCurrency ? "Modificar Moneda" : "Crear Nueva Moneda"}
            >
                <CurrencyForm
                    initialData={editCurrency}
                    onSave={saveCurrency}
                    onCancel={() => setShowForm(false)}
                    isLoading={loading}
                />
            </Modal>

            {!showForm && !loading && currencies && (
                <CurrencyTable
                    currencies={currencies}
                    onEdit={(currency) => {
                        setEditCurrency(currency);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            {!showForm && !loading && !currencies && !error && (
                <p className="text-gray-600 text-center py-8">
                    No hay monedas para mostrar.
                </p>
            )}
        </div>
    );
}