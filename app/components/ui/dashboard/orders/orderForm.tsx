'use client';
import React, { useState, useEffect } from 'react';
import Button from '../../button';
import { useNotification } from '@/app/providers/notificationProvider';
import DishTableForm from './dishTableForm';

interface OrderFormProps {
    onSave: (orderData: OrderCreationFormData | OrderUpdateFormData, params: Record<string,string>) => Promise<void>; 
    onCancel: () => void;
    initialData?: Order | null; 
}

const OrderForm: React.FC<OrderFormProps> = ({ onSave, onCancel, initialData }) => {
    const [tableId, seTableId] = useState<number | 1>(1);
    const [notes, setNotes] = useState('');
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]); 
    const [items,setItems] = useState<OrderItem[]>([]); 
    const [availableDishes,setAvailableDishes] = useState<Dish[] | null>(null)


    const [currentDishIdToAdd, setCurrentDishIdToAdd] = useState<number | 0>(0);
    const [currentDishQuantityToAdd, setCurrentDishQuantityToAdd] = useState<number>(1);
    const [tables,setTables] = useState<Table[] | null>(null);
    
    const {closeNotification,showNotification} = useNotification()


    useEffect(() => {
        if (initialData) {
            const params = new URLSearchParams({
                url: `/orders/get_order_dishes/`+initialData.id
            });
            fetch(`/api/get?`+params, {
                method: 'GET'
            }).then(response=>response.json())
            .then((data: OrderWithDishes)=>{
                seTableId(data.table_id);
                setSelectedItems(data.dishes.map(item => ({
                    dish: item.dish,
                    quantity: item.quantity
                })));
                setItems(data.dishes.map(item => ({
                    dish: item.dish,
                    quantity: item.quantity
                })));
                
            })
            // setNotas(initialData.notas || '');
        } else {
            seTableId(1);
            setNotes('');
            setSelectedItems([]);
        }
    }, [initialData]); 

    useEffect(() =>{
        closeNotification()
        const params = new URLSearchParams({
                url: `/tables/get_tables`
            });
        fetch("/api/get?"+params,{
            method:"GET"
        })
        .then(response=>response.json())
        .then(data=>{
            setTables(data)
        }).catch(rej=>{
            showNotification({message:"Error al cargar las mesas: "+rej,type:"error"})
        })

        const paramsDish = new URLSearchParams({
            url: `/dishes/get_dishes`
        });
        fetch("/api/get?"+paramsDish,{
            method:"GET"
        })
        .then(response=>response.json())
        .then(data=>{
            setAvailableDishes(data)
        }).catch(rej=>{
            showNotification({message:"Error al cargar los platos: "+rej,type:"error"})
        })
    },[])


    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.quantity * item.dish.price), 0);
    };

    const handleAddItem = () => {
        closeNotification()
        if (!currentDishIdToAdd) {
            showNotification({message:'Por favor, selecciona un plato para añadir.',type:"error"});
            return;
        }
        if (currentDishQuantityToAdd <= 0) {
            showNotification({message:'La cantidad debe ser mayor que cero.',type:"error"});
            return;
        }

        const dishToAdd = availableDishes?.find(dish => dish.id === currentDishIdToAdd);

        if (dishToAdd) {
            const existingItemIndex = selectedItems.findIndex(item => item.dish.id === dishToAdd.id);
            if (existingItemIndex > -1) {
                setSelectedItems(prevItems =>
                    prevItems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + currentDishQuantityToAdd }
                            : item
                    )
                );
            } else {
                setSelectedItems(prevItems => [
                    ...prevItems,
                    {
                        dish: dishToAdd,
                        quantity: currentDishQuantityToAdd,
                    }
                ]);
            }

            setCurrentDishQuantityToAdd(1);
        } else {
            showNotification({message:'Plato no encontrado.',type:"error"});
        }
    };

    const handleRemoveItem = (dishId: number) => {
        if (initialData){
            const itemDeleted = selectedItems.filter(item => item.dish.id == dishId)[0]
            const isItemUpdate = items.find(i=>i.dish.id==itemDeleted.dish.id)
            if (isItemUpdate){
                isItemUpdate.quantity=0
            }
        }
        setSelectedItems(prevItems => prevItems.filter(item => item.dish.id !== dishId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();

        if (tableId <= 0) {
            showNotification({message:'El número de mesa es obligatorio y debe ser mayor que cero.',type:"error"});
            return;
        }
        if (selectedItems.length === 0) {
            showNotification({message:'El pedido debe contener al menos un plato.',type:"error"});
            return;
        }

        // Mapear selectedItems a OrderItemCreation para enviarlos al backend
        const itemsForBackend: OrderItemCreation[] = selectedItems.map(item => ({
            dish_id: item.dish.id,
            quantity: item.quantity,
        }));

        if (initialData) {
            const itemsToDeleted = items.filter(item=>item.quantity==0)
            const itemsData = itemsToDeleted.map(item => ({
                dish_id: item.dish.id,
                quantity: item.quantity,
            }));
            itemsForBackend.push(...itemsData)
            // Si estamos editando, creamos OrderUpdateFormData
            const orderData: OrderUpdateFormData = {
                table_id: Number(tableId),
                dishes: itemsForBackend,
                // notas: notas || undefined,
            };
            console.log(orderData)
            await onSave(orderData,{url:"/orders/update_order/"+initialData?.id});
            await onSave(orderData,{url:"/orders/update_dishes/"+initialData?.id});
        } else {
            // Si estamos creando, creamos OrderCreationFormData
            const orderData: OrderCreationFormData = {
                table_id: Number(tableId),
                dishes: itemsForBackend,
                // notas: notas || undefined,
            };
            await onSave(orderData,{url:"/orders/create_order"});
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            {/* Sección de Datos del Pedido (Número de Mesa) */}
            <h3 className="text-lg text-center sm:text-xl font-semibold text-gray-800 pb-2 mb-4">Datos del Pedido</h3>
            <div>
                <label htmlFor="table_id" className="block text-sm font-medium text-gray-700 mb-1" >
                    Seleccione una mesa
                </label>
                <select
                    id="table_id"
                    name="table_id"
                    value={tableId}
                    onChange={e => seTableId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                >
                    {
                        tables?.map(table=>(
                            <option value={table.id} key={table.id}>{table.name}</option>
                        ))
                    }
                </select>
            </div>
            <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                <textarea
                    id="notas"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                ></textarea>
            </div>
            

            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-2 mb-4">Buscar Platos</h3>
            {/* Sección de Platos del Pedido */}
            <DishTableForm 
                dishes={availableDishes}
                handleAddItem={handleAddItem}
                setCurrentDishIdToAdd={setCurrentDishIdToAdd}
                currentDishIdToAdd={currentDishIdToAdd}
            />

            
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 pb-2 mb-4">Platos del Pedido</h3>
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
                            {selectedItems.map((item) => (
                                <tr key={item.dish.id}>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.dish.name}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">${item.dish.price.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right text-sm sm:text-base text-gray-900 whitespace-nowrap">${(item.quantity * item.dish.price).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                        <Button
                                            onClick={() => handleRemoveItem(item.dish.id)}
                                            type="button"
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded-md shadow-sm transition-all duration-200 ease-in-out"
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
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out"
                >
                    {initialData ? 'Guardar Cambios' : 'Crear Pedido'}
                </Button>
            </div>
        </form>
    );
};

export default OrderForm;
