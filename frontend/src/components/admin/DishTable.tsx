'use client';
import React, { useState } from 'react';
import Button from '../ui/button';

interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    is_active: boolean;
}

interface DishTableProps {
    items: Plato[];
    onEdit: (plato: Plato) => void;
    onDelete: (platoId: number) => void;
}

const DishTable: React.FC<DishTableProps> = ({ items: platos, onEdit, onDelete }) => {
    // Estado para controlar qué descripciones están expandidas
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());

    // Función para alternar el estado de expansión de una descripción
    const toggleDescription = (platoId: number) => {
        setExpandedDescriptions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(platoId)) {
                newSet.delete(platoId);
            } else {
                newSet.add(platoId);
            }
            return newSet;
        });
    };

    const MAX_DESCRIPTION_LENGTH = 50; // Longitud máxima antes de mostrar el botón "Mostrar más"

    return (
        <div className="overflow-x-auto w-full min-w-0 bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoría
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activo
                        </th>
                        <th scope="col" className="px-10 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {platos.map((plato) => {
                        const isExpanded = expandedDescriptions.has(plato.id);
                        const showToggle = plato.descripcion.length > MAX_DESCRIPTION_LENGTH;
                        const displayedDescription = isExpanded
                            ? plato.descripcion
                            : plato.descripcion.slice(0, MAX_DESCRIPTION_LENGTH) + (showToggle ? '...' : '');

                        return (
                            <tr key={plato.id}>
                                {/* Celdas de tabla*/}
                                <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-base font-medium text-gray-900">
                                    {plato.id}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-base text-gray-700">
                                    {plato.nombre}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-base text-gray-700 align-top">
                                    {displayedDescription}
                                    {showToggle && (
                                        <button
                                            onClick={() => toggleDescription(plato.id)}
                                            className="text-blue-600 hover:text-blue-800 text-xs ml-1 focus:outline-none"
                                            type="button"
                                        >
                                            {isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700">
                                    ${plato.precio.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm sm:text-base text-gray-700 capitalize">
                                    {plato.categoria}
                                </td>
                                <td className="px-8 py-2 sm:py-4 whitespace-nowrap text-sm sm:text-base">
                                    <span className={`px-2 inline-flex text-xs leading-6 font-semibold rounded-full ${plato.is_active ? 'bg-green-300 text-green-800' : 'bg-red-300 text-red-800'}`}>
                                        {plato.is_active ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
                                    <div className="flex justify-start space-x-2">
                                        <Button
                                            onClick={() => onEdit(plato)}
                                            className="bg-gray-500 hover:bg-[[#E03A00]] yeltext-white px-3 py-1 text-xs rounded-md"
                                            type="button"
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(plato.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-md"
                                            type="button"
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DishTable;
