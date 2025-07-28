"use client";
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "@/app/components/ui/button";

export interface CurrencyTableProps {
    currencies: Currency[];
    onEdit: (currency: Currency) => void;
    onDelete: (id: number) => void;
}

const CurrencyTable: React.FC<CurrencyTableProps> = ({
    currencies,
    onEdit,
    onDelete,
}) => (
    <div className="overflow-x-auto text-black rounded-md shadow-md border border-gray-200">
        <table className="w-full text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700">
                <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Cambio</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {currencies.map((currency, idx) => (
                    <tr
                        key={currency.id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100 transition duration-150`}
                    >
                        <td className="px-4 py-2">{currency.name}</td>
                        <td className="px-4 py-2">{currency.exchange.toFixed(2)}</td>
                        <td className="px-4 py-2 flex justify-center gap-2 items-center">
                            <Button
                                onClick={() => onEdit(currency)}
                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
                            >
                                <FaEdit />
                                <span>Modificar</span>
                            </Button>
                            <Button
                                onClick={() => onDelete(currency.id)}
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

export default CurrencyTable;
