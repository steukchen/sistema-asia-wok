// frontend/src/components/admin/OrderForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Button from '../ui/button';
import { Plato, Order, OrderItem, OrderItemCreation, OrderCreationFormData, OrderUpdateFormData } from '../../types'; 

interface OrderFormProps {
    availableDishes: Plato[]; 
    onSave: (orderData: OrderCreationFormData | OrderUpdateFormData) => Promise<void>; 
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Order | null; 
    isEditing: boolean; 
}

const OrderForm: React.FC<OrderFormProps> = ({ availableDishes, onSave, onCancel, isLoading, initialData, isEditing }) => {
    const [numeroMesa, setNumeroMesa] = useState<number | ''>('');
    const [notas, setNotas] = useState('');
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]); 
    const [formError, setFormError] = useState<string | null>(null);

    const [currentDishIdToAdd, setCurrentDishIdToAdd] = useState<number | ''>('');
    const [currentDishQuantityToAdd, setCurrentDishQuantityToAdd] = useState<number>(1);

    // Efecto para inicializar el formulario cuando se proporciona initialData (modo edición)
    useEffect(() => {
        if (isEditing && initialData) {
            setNumeroMesa(initialData.numero_mesa);
            setNotas(initialData.notas || '');
            setSelectedItems(initialData.items.map(item => ({
                plato_id: item.plato_id,
                nombre_plato: item.plato.nombre, 
                cantidad: item.cantidad,
                precio_unitario: item.plato.precio, 
                plato: item.plato 
            })));
        } else {
            setNumeroMesa('');
            setNotas('');
            setSelectedItems([]);
            setFormError(null);
        }
    }, [isEditing, initialData]); 

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    };

    const handleAddItem = () => {
        setFormError(null);
        if (!currentDishIdToAdd) {
            setFormError('Por favor, selecciona un plato para añadir.');
            return;
        }
        if (currentDishQuantityToAdd <= 0) {
            setFormError('La cantidad debe ser mayor que cero.');
            return;
        }

        const dishToAdd = availableDishes.find(dish => dish.id === currentDishIdToAdd);

        if (dishToAdd) {
            const existingItemIndex = selectedItems.findIndex(item => item.plato_id === dishToAdd.id);

            if (existingItemIndex > -1) {
                setSelectedItems(prevItems =>
                    prevItems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, cantidad: item.cantidad + currentDishQuantityToAdd }
                            : item
                    )
                );
            } else {
                setSelectedItems(prevItems => [
                    ...prevItems,
                    {
                        plato_id: dishToAdd.id,
                        nombre_plato: dishToAdd.nombre,
                        cantidad: currentDishQuantityToAdd,
                        precio_unitario: dishToAdd.precio,
                        plato: dishToAdd
                    }
                ]);
            }

            setCurrentDishIdToAdd('');
            setCurrentDishQuantityToAdd(1);
        } else {
            setFormError('Plato no encontrado.');
        }
    };

    const handleRemoveItem = (platoId: number) => {
        setSelectedItems(prevItems => prevItems.filter(item => item.plato_id !== platoId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (numeroMesa === '' || numeroMesa <= 0) {
            setFormError('El número de mesa es obligatorio y debe ser mayor que cero.');
            return;
        }
        if (selectedItems.length === 0) {
            setFormError('El pedido debe contener al menos un plato.');
            return;
        }

        // Mapear selectedItems a OrderItemCreation para enviarlos al backend
        const itemsForBackend: OrderItemCreation[] = selectedItems.map(item => ({
            plato_id: item.plato_id,
            cantidad: item.cantidad,
        }));

        if (isEditing) {
            // Si estamos editando, creamos OrderUpdateFormData
            const orderData: OrderUpdateFormData = {
                numero_mesa: Number(numeroMesa),
                items: itemsForBackend,
                notas: notas || undefined,
            };
            await onSave(orderData);
        } else {
            // Si estamos creando, creamos OrderCreationFormData
            const orderData: OrderCreationFormData = {
                numero_mesa: Number(numeroMesa),
                items: itemsForBackend,
                notas: notas || undefined,
            };
            await onSave(orderData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm sm:text-base" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {formError}</span>
                </div>
            )}

            {/* Sección de Datos del Pedido (Número de Mesa) */}
            <h3 className="text-lg text-center sm:text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Datos del Pedido</h3>
            <div>
                <label htmlFor="numeroMesa" className="block text-sm font-medium text-gray-700 mb-1">Número de Mesa</label>
                <input
                    type="number"
                    id="numeroMesa"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(Number(e.target.value))}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    required
                    min="1"
                    disabled={isLoading}
                />
            </div>
            <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                <textarea
                    id="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    disabled={isLoading} 
                ></textarea>
            </div>

            {/* Sección de Platos del Pedido */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 border-b pb-2 mb-4">Platos del Pedido</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label htmlFor="selectDish" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Plato</label>
                    <select
                        id="selectDish"
                        value={currentDishIdToAdd}
                        onChange={(e) => setCurrentDishIdToAdd(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 text-sm sm:text-base transition-all duration-200 ease-in-out"
                        disabled={isLoading}
                    >
                        <option value="">-- Selecciona un plato --</option>
                        {availableDishes.map(dish => (
                            <option key={dish.id} value={dish.id}>
                                {dish.nombre} (${dish.precio.toFixed(2)})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="dishQuantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                        type="number"
                        id="dishQuantity"
                        value={currentDishQuantityToAdd}
                        onChange={(e) => setCurrentDishQuantityToAdd(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    onClick={handleAddItem}
                    type="button"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-4 sm:mt-0 shadow-sm transition-all duration-200 ease-in-out"
                    disabled={isLoading}
                >
                    Añadir Plato
                </Button>
            </div>

            {/* Lista de Platos Seleccionados */}
            {selectedItems.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden shadow-sm overflow-x-auto"> 
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Plato</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Cantidad</th>
                                <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">Precio Unitario</th>
                                <th className="px-4 py-2 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase">Subtotal</th>
                                <th className="px-4 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase min-w-[80px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {selectedItems.map((item, index) => (
                                <tr key={item.plato_id}>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.nombre_plato}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.cantidad}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">${item.precio_unitario.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right text-sm sm:text-base text-gray-900 whitespace-nowrap">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                        <Button
                                            onClick={() => handleRemoveItem(item.plato_id)}
                                            type="button"
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded-md shadow-sm transition-all duration-200 ease-in-out"
                                            disabled={isLoading}
                                        >
                                            Quitar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="text-right text-lg sm:text-xl font-bold text-gray-900 mt-4 pt-2 border-t border-gray-200">
                Total del Pedido: ${calculateTotal().toFixed(2)}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full sm:w-auto bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out"
                >
                    {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Pedido')}
                </Button>
            </div>
        </form>
    );
};

export default OrderForm;
