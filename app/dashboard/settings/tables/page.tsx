// app/dashboard/settings/tables/page.tsx
"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import { useApi } from "@/app/hooks/api";
import TableForm from "@/app/components/ui/dashboard/tables/tableForm";
import TableTable from "@/app/components/ui/dashboard/tables/tableTable";
import { useNotification } from "@/app/providers/notificationProvider";

export default function TablesPage() {
    const { showNotification } = useNotification();
    const {
        state: { data, loading, error },
        get,
        create,
        update,
        delete: deleteTable,
    } = useApi<Table, { name: string; state: TableState }>({
        resourceName: "Mesa",
    });

    const [showForm, setShowForm] = useState(false);
    const [tables, setTables] = useState<Table[] | null>(null);
    const [editTable, setEditTable] = useState<Table | null>(null);

    // Carga inicial y refresco tras cada operación
    const loadTables = () => {
        get("", { url: "/tables/get_tables" });
    };

    useEffect(() => {
        loadTables();
    }, []);

    // Cuando el API devuelve un array, lo volcamos a state
    useEffect(() => {
        if (Array.isArray(data)) setTables(data);
        else setTables(null);
    }, [data]);

    // Guardar (create o update)
    const saveTable = async (
        tableData: { name: string; state: TableState },
        params: Record<string, string>
    ) => {
        const result = editTable
            ? await update(tableData, params)
            : await create(tableData, params);

        if (result) {
            setShowForm(false);
            loadTables();
        } else {
            setShowForm(true);
        }
    };

    // Eliminar
    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta mesa?")) return;
        await deleteTable({ url: `/tables/delete_table/${id}` });
        loadTables();
    };

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestión de Mesas"
                textButton="Crear Mesa"
                error={error}
                onClickButton={() => {
                    setEditTable(null);
                    setShowForm(true);
                }}
            />

            {/* Modal de Create/Edit */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editTable ? "Modificar Mesa" : "Crear Nueva Mesa"}
            >
                <TableForm
                    initialData={editTable}
                    existingTables={tables || []}
                    onSave={saveTable}
                    onCancel={() => setShowForm(false)}
                    isLoading={loading}
                />
            </Modal>

            {/* Tabla de Mesas */}
            {!showForm && !loading && tables && (
                <TableTable
                    tables={tables}
                    onEdit={(table) => {
                        setEditTable(table);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            {/* Mensaje si no hay datos */}
            {!showForm && !loading && !tables && !error && (
                <p className="text-gray-600 text-center py-8">
                    No hay mesas para mostrar.
                </p>
            )}
        </div>
    );
}