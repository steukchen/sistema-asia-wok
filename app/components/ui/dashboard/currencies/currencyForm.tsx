"use client";
import React, { useState, useEffect } from "react";
import Button from "@/app/components/ui/button";
import { useNotification } from "@/app/providers/notificationProvider";

interface CurrencyFormProps {
    initialData?: Currency | null;
    onSave: (
        data: {
            name: string;
            exchange: number;
        },
        params: Record<string, string>
    ) => void;
    onCancel: () => void;
    isLoading: boolean;
}


export const CurrencyForm: React.FC<CurrencyFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isLoading,
}) => {
    const { showNotification, closeNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        exchange: 0,
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                exchange: initialData.exchange || 0,
            });
        } else {
            setForm({ name: "", exchange: 0 });
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "exchange" ? parseFloat(value) || "" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true);

        const { name, exchange } = form;

        if (!name || !exchange) {
            showNotification({
                message: "Todos los campos son obligatorios.",
                type: "error",
            });
            setLoading(false);
            return;
        }

        const url = initialData
            ? `/currencies/update_currency/${initialData.id}`
            : "/currencies/create_currency";

        await onSave(form, { url });
        setLoading(false);
    };

    if (loading || isLoading)
        return (
            <div className="flex items-center justify-center">
                <p className="animate-pulse">Cargando...</p>
            </div>
        );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-black" autoComplete="off">
            <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                />
            </div>


            <div>
                <label className="block text-sm text-black mb-1">Tipo de Cambio</label>
                <input
                    name="exchange"
                    type="number"
                    min="{0.01}"
                    step="0.01"
                    value={form.exchange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" onClick={onCancel} className="bg-red-500">
                    Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600">
                    {initialData ? "Actualizar Moneda" : "Crear Moneda"}
                </Button>
            </div>
        </form>
    );
};

export default CurrencyForm;