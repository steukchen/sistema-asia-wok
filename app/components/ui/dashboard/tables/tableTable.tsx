"use client";
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "@/app/components/ui/button";

export interface TableTableProps {
    tables: Table[];
    onEdit: (table: Table) => void;
    onDelete: (id: number) => void;
}

const TableTable: React.FC<TableTableProps> = ({
    tables,
    onEdit,
    onDelete,
}) => (
    <div className="overflow-x-auto rounded-md text-gray-800 shadow-md border border-gray-200">
        <table className="w-full text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700">
                <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {tables.map((table, idx) => (
                    <tr
                        key={table.id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100 transition duration-150`}
                    >
                        <td className="px-4 py-2">{table.name}</td>
                        <td className="px-4 py-2 capitalize">{table.state}</td>
                        <td className="px-4 py-2 flex gap-2 justify-center items-center">
                            <Button
                                onClick={() => onEdit(table)}
                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
                            >
                                <FaEdit />
                                <span>Modificar</span>
                            </Button>
                            <Button
                                onClick={() => onDelete(table.id)}
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                            >
                                <FaTrash />
                                <span>Eliminar</span>
                            </Button>

                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default TableTable;
