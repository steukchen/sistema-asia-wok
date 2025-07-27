"use client";

import React, { useState, useEffect } from "react";
import Button from "@/app/components/ui/button";
import { useNotification } from "@/app/providers/notificationProvider";

export type TableState = "enabled" | "occupied" |'disabled'|'reserved';
export interface Table {
    id: number;
    name: string;
    state: TableState;
}

interface TableFormProps {
    initialData?: Table | null;
    existingTables: Table[];
    onSave: (
        data: { name: string; state: TableState },
        params: Record<string, string>
    ) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export default function TableForm({
    initialData,
    existingTables,
    onSave,
    onCancel,
    isLoading,
}: TableFormProps) {
    const { showNotification, closeNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<{ name: string; state: TableState }>({
        name: "1",
        state: "enabled",
    });

    // Carga inicial del form
    useEffect(() => {
        if (initialData) {
            setForm({ name: initialData.name, state: initialData.state });
        } else {
            setForm({ name: "1", state: "enabled" });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value!= "" ? parseInt(value): value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true);

        if (!form.name) {
            showNotification({
                message: "Debes seleccionar un número de mesa.",
                type: "error",
            });
            setLoading(false);
            return;
        }

        const url = initialData
            ? `/tables/update_table/${initialData.id}`
            : "/tables/create_table";

        const body = {
            name: "MESA "+form.name,
            state: "enabled" as TableState
        }
        await onSave(body, { url });
        setLoading(false);
    };

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[100px]">
                <p className="animate-pulse text-gray-700">Cargando...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 text-black sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Mesa
                    </label>
                    <input
                        name="name"
                        type="number"
                        step={1}
                        min={1}
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 bg-white max-h-[200px] overflow-y-auto"
                    />
                </div>

                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                    </label>
                    <select
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 bg-white"
                    >
                        <option value="enabled">Disponible</option>
                        <option value="occupied">Ocupada</option>
                        <option value="disabled">Inactiva</option>
                        <option value="reserved">Reservada</option>
                    </select>
                </div> */}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    {initialData ? "Actualizar Mesa" : "Crear Mesa"}
                </Button>
            </div>
        </form>
    );
}

