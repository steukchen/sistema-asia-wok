"use client";

import { useEffect, useState } from "react";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import Modal from "@/app/components/ui/dashboard/modal";
import { useApi } from "@/app/hooks/api";
import TableForm, { Table, TableState } from "@/app/components/ui/dashboard/tables/tableForm";
import TableTable from "@/app/components/ui/dashboard/tables/tableTable";
import CurrencyForm from "@/app/components/ui/dashboard/currencies/currencyForm";
import CurrencyTable from "@/app/components/ui/dashboard/currencies/currencyTable";
import { FaChair, FaMoneyBillWave } from "react-icons/fa";

export default function SettingsDashboard() {
    // 🪑 Gestión de Mesas
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

    const handleSaveTable = async (
        data: { name: string; state: TableState },
        params: Record<string, string>
    ) => {
        const action = editTable ? updateTable : createTable;
        const result = await action(data, params);
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

    // 💸 Gestión de Monedas
    const {
        state: currencyState,
        get: loadCurrencies,
        create: createCurrency,
        update: updateCurrency,
        delete: deleteCurrency,
    } = useApi<Currency, { name: string; exchange: number }>({
        resourceName: "Moneda",
    });

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showCurrencyForm, setShowCurrencyForm] = useState(false);
    const [editCurrency, setEditCurrency] = useState<Currency | null>(null);

    useEffect(() => {
        loadCurrencies("", { url: "/currencies/get_currencies" });
    }, []);

    useEffect(() => {
        if (Array.isArray(currencyState.data)) {
            setCurrencies(currencyState.data);
        }
    }, [currencyState.data]);

    const handleSaveCurrency = async (
        data: { name: string; exchange: number },
        params: Record<string, string>
    ) => {
        const action = editCurrency ? updateCurrency : createCurrency;
        const result = await action(data, params);
        if (result) {
            setShowCurrencyForm(false);
            setEditCurrency(null);
            loadCurrencies("", { url: "/currencies/get_currencies" });
        }
    };

    const handleDeleteCurrency = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta moneda?")) return;
        await deleteCurrency({ url: `/currencies/delete_currency/${id}` });
        loadCurrencies("", { url: "/currencies/get_currencies" });
    };

    return (
        <div className="p-6 space-y-8">
            <HeadSection title="Ajustes del Restaurante" loading={false} error={null} />

            {/* Opciones visuales */}
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
                    <p className="text-sm text-gray-600">Crea, edita o elimina monedas.</p>
                </div>
            </div>

            {/* Modal de Mesas */}
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
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                        >
                            Crear Mesa
                        </button>
                        {tableState.error && <p className="text-red-500">{tableState.error}</p>}
                    </div>

                    {!showTableForm && (
                        <TableTable
                            tables={tables}
                            onEdit={(table) => {
                                setEditTable(table);
                                setShowTableForm(true);
                            }}
                            onDelete={handleDeleteTable}
                        />
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

            {/* Modal de Monedas */}
            <Modal
                isOpen={showCurrencyModal}
                onClose={() => {
                    setShowCurrencyModal(false);
                    setShowCurrencyForm(false);
                    setEditCurrency(null);
                }}
                title="Gestión de Monedas"
            >
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => {
                                setEditCurrency(null);
                                setShowCurrencyForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer"
                        >
                            Crear Moneda
                        </button>
                        {currencyState.error && <p className="text-red-500">{currencyState.error}</p>}
                    </div>

                    {!showCurrencyForm && (
                        <CurrencyTable
                            currencies={currencies}
                            onEdit={(currency) => {
                                setEditCurrency(currency);
                                setShowCurrencyForm(true);
                            }}
                            onDelete={handleDeleteCurrency}
                        />
                    )}

                    {showCurrencyForm && (
                        <CurrencyForm
                            initialData={editCurrency}
                            onSave={handleSaveCurrency}
                            onCancel={() => {
                                setShowCurrencyForm(false);
                                setEditCurrency(null);
                            }}
                            isLoading={currencyState.loading}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
