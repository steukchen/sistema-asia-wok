'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/app/components/ui/button';
import { FaEdit, FaTrash } from 'react-icons/fa';


interface DishTypeTableProps {
    items: DishType[];
    onEdit: (dishType: DishType) => void;
    onDelete: (params: Record<string, string>) => void;
    itemsPerPage?: number;
}

const DishTypeTable: React.FC<DishTypeTableProps> = ({
    items,
    onEdit,
    onDelete,
    itemsPerPage = 5,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(term));
    }, [items, searchTerm]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const clearSearch = () => setSearchTerm('');

    return (
        <div className="overflow-x-auto rounded-md text-gray-800 shadow-md border border-gray-200">
            <table className="w-full text-sm sm:text-base">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Nombre</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                                No hay tipos de platos registrados.
                            </td>
                        </tr>
                    ) : (
                        items.map((type, idx) => (
                            <tr
                                key={type.id}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-gray-100 transition duration-150`}
                            >
                                <td className="px-4 py-2">{type.id}</td>
                                <td className="px-4 py-2">{type.name}</td>
                                <td className="px-4 py-2 flex gap-2 justify-center items-center">
                                    <Button
                                        onClick={() => onEdit(type)}
                                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
                                    >
                                        <FaEdit />
                                        <span>Modificar</span>
                                    </Button>
                                    <Button
                                        onClick={() => onDelete({ url: `/dishes_types/delete_dish_type/${type.id}` })}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                                    >
                                        <FaTrash />
                                        <span>Eliminar</span>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>


    );
};

export default DishTypeTable;
