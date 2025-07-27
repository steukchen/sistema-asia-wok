"use client";
import React, { useState, useEffect } from "react";
import Button from "@/app/components/ui/button";
import { useNotification } from "@/app/providers/notificationProvider";

interface CurrencyFormProps {
    initialData?: Currency | null;
    onSave: (
        data: {
            name: string;
            code: string;
            symbol: string;
            exchange_rate: number;
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
                name: initialData.name,
                exchange: initialData.exchange,
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
            [name]:
                name === "exchange_rate" ? parseFloat(value) || 1 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true);

        if (!form.name ) {
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
                    className="w-full input"
                />
            </div>


            <div>
                <label className="block text-sm mb-1">Tipo de Cambio</label>
                <input
                    name="exchange_rate"
                    type="number"
                    min="0"
                    step="0"
                    value={form.exchange}
                    onChange={handleChange}
                    className="w-full input"
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