"use client";

import { useEffect, useState } from "react";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import Modal from "@/app/components/ui/dashboard/modal";
import { useApi } from "@/app/hooks/api";
import TableForm, { Table, TableState } from "@/app/components/ui/dashboard/tables/tableForm";
import TableTable from "@/app/components/ui/dashboard/tables/tableTable";
import CurrencyForm from "@/app/components/ui/dashboard/currencies/currencyForm";
import { FaChair, FaMoneyBillWave } from "react-icons/fa";

export default function SettingsDashboard() {
    const {
        state: tableState,
        get: loadTables,
        create: createTable,
        update: updateTable,
        delete: deleteTable,
    } = useApi<Table, { name: string; state: TableState }>({
        resourceName: "Mesa",
    });

    const [tables, setTables] = useState<Table[]>([]);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showTableForm, setShowTableForm] = useState(false);
    const [editTable, setEditTable] = useState<Table | null>(null);

    useEffect(() => {
        loadTables("", { url: "/tables/get_tables" });
    }, []);

    useEffect(() => {
        if (Array.isArray(tableState.data)) {
            const uiTables = tableState.data.map((t) => ({
                ...t,
                name: t.name.replace(/^Mesa\s*/, ""),
                state: (t.state as string).toLowerCase() as TableState,
            }));
            setTables(uiTables);
        }
    }, [tableState.data]);

    const {
        state: currencyState,
        create: createCurrency,
        update: updateCurrency,
    } = useApi<Currency, {
        name: string;
        code: string;
        symbol: string;
        exchange_rate: number;
    }>({
        resourceName: "Moneda",
    });

    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [editCurrency, setEditCurrency] = useState<Currency | null>(null);

    const handleSaveTable = async (
        data: { name: string; state: TableState },
        params: Record<string, string>
    ) => {
        const payload = {
            name: `Mesa ${data.name}`, 
            state: data.state,
        };

        

        const action = editTable ? updateTable : createTable;
        const result = await action(payload, params);
        if (result) {
            setShowTableForm(false);
            setEditTable(null);
            loadTables("", { url: "/tables/get_tables" });
        }
    };

    const handleDeleteTable = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta mesa?")) return;
        await deleteTable({ url: `/tables/delete_table/${id}` });
        loadTables("", { url: "/tables/get_tables" });
    };

    // — Guardar Moneda (igual que antes) —
    const handleSaveCurrency = async (
        data: {
            name: string;
            code: string;
            symbol: string;
            exchange_rate: number;
        },
        params: Record<string, string>
    ) => {
        const action = editCurrency ? updateCurrency : createCurrency;
        const result = await action(data, params);
        if (result) {
            setShowCurrencyModal(false);
            setEditCurrency(null);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <HeadSection title="Ajustes del Restaurante" loading={false} error={null} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                    onClick={() => setShowTableModal(true)}
                    className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition"
                >
                    <FaChair className="text-4xl text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Gestionar Mesas</h3>
                    <p className="text-sm text-gray-600">Crea, edita o elimina mesas.</p>
                </div>

                <div
                    onClick={() => setShowCurrencyModal(true)}
                    className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition"
                >
                    <FaMoneyBillWave className="text-4xl text-green-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Gestionar Monedas</h3>
                    <p className="text-sm text-gray-600">Configura símbolo, tipo de cambio y más.</p>
                </div>
            </div>

            {/* Modal Mesas */}
            <Modal
                isOpen={showTableModal}
                onClose={() => {
                    setShowTableModal(false);
                    setShowTableForm(false);
                    setEditTable(null);
                }}
                title="Gestión de Mesas"
            >
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => {
                                setEditTable(null);
                                setShowTableForm(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                            Crear Mesa
                        </button>
                        {tableState.error && <p className="text-red-500">{tableState.error}</p>}
                    </div>

                    {!showTableForm && (
                        <TableTable tables={tables} onEdit={(table) => {
                            setEditTable(table);
                            setShowTableForm(true);
                        }} onDelete={handleDeleteTable} />
                    )}

                    {showTableForm && (
                        <TableForm
                            initialData={editTable}
                            existingTables={tables}
                            onSave={handleSaveTable}
                            onCancel={() => {
                                setShowTableForm(false);
                                setEditTable(null);
                            }}
                            isLoading={tableState.loading}
                        />
                    )}
                </div>
            </Modal>

            {/* Modal Monedas */}
            <Modal
                isOpen={showCurrencyModal}
                onClose={() => {
                    setShowCurrencyModal(false);
                    setEditCurrency(null);
                }}
                title={editCurrency ? "Editar Moneda" : "Crear Moneda"}
            >
                <CurrencyForm
                    initialData={editCurrency}
                    onSave={handleSaveCurrency}
                    onCancel={() => {
                        setShowCurrencyModal(false);
                        setEditCurrency(null);
                    }}
                    isLoading={currencyState.loading}
                />
            </Modal>
        </div>
    );
}
