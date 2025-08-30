"use client";
import React, { useEffect, useMemo, useState } from "react";
import Button from "@/app/components/ui/button";
import { FiSearch, FiX } from "react-icons/fi";

export interface UserTableProps {
    items: Dish[];
    onEdit: (dish: Dish) => void;
    onDelete: (params: Record<string, string>) => void;
    itemsPerPage?: number;
}

const DishTable: React.FC<UserTableProps> = ({
    items: dishes,
    onEdit,
    onDelete,
    itemsPerPage = 5,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDishes = useMemo(() => {
        if (!searchTerm.trim()) return dishes;

        const term = searchTerm.toLowerCase();
        return dishes.filter((dish) => dish.name.toLowerCase().includes(term));
    }, [dishes, searchTerm]);

    const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleDishes = filteredDishes.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const clearSearch = () => setSearchTerm("");

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Barra de búsqueda */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar platos..."
                        className="block w-full pl-10 pr-10 py-2 text-black border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>
                <div className="ml-4 text-sm text-gray-500">
                    {filteredDishes.length} {filteredDishes.length === 1 ? "plato" : "platos"}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                ID
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                NOMBRE
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                DESCRIPCION
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                PRECIO
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                TIPO
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {visibleDishes.map((dish) => (
                            <tr key={dish.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {dish.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {dish.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {dish.description.split('\n').map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            <br />
                                        </span>))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                                    {dish.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                                    {dish.type.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            onClick={() => onEdit(dish)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs rounded-md"
                                            type="button"
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => onDelete({ url: "/dishes/delete_dish/" + dish.id })}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-md"
                                            type="button"
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {visibleDishes.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                >
                                    {searchTerm ? (
                                        <div>
                                            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 font-medium text-gray-900">
                                                No se encontraron platos
                                            </p>
                                            <p className="mt-1">
                                                No hay resultados para
                                                <span className="font-medium">{searchTerm}</span>
                                            </p>
                                            <button
                                                onClick={clearSearch}
                                                className="mt-4 text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                Limpiar búsqueda
                                            </button>
                                        </div>
                                    ) : (
                                        "No hay platos disponibles"
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles de paginación */}
            {filteredDishes.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{startIndex + 1}</span> -
                                <span className="font-medium">
                                    {Math.min(startIndex + itemsPerPage, filteredDishes.length)}
                                </span>{" "}
                                de <span className="font-medium">{filteredDishes.length}</span>{" "}
                                platos
                            </p>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <Button
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2  text-sm font-medium ${currentPage === 1 ? "bg-gray-200 hover:bg-gray-200 hover:cursor-not-allowed text-gray-500" : "bg-white hover:bg-gray-50 text-gray-700"
                                        }`}
                                    type="button"
                                >
                                    Anterior
                                </Button>

                                <div className="hidden md:flex">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                        ? "z-10 bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    } mx-0.5`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    )}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-4 py-2  text-sm font-medium ${currentPage === totalPages ? "text-gray-500 bg-gray-200 hover:bg-gray-200 hover:cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700"
                                        }`}
                                    type="button"
                                >
                                    Siguiente
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DishTable;
