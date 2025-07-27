'use client';
import { useMemo, useState } from "react";
import Button from "../../button";

interface DishTableFormProps{
    dishes: Dish[] | null;
    handleAddItem: ()=>void;
    setCurrentDishIdToAdd: (dishId:number)=>void;
    currentDishIdToAdd: number;
}

const DishTableForm = ({
    dishes,
    handleAddItem,
    setCurrentDishIdToAdd,
    currentDishIdToAdd
}:DishTableFormProps)=>{
    const [searchTerm,setSearchTerm] = useState("")
    const [currentDishQuantityToAdd, setCurrentDishQuantityToAdd] = useState<number>(1);
    
    const filteredDishes = useMemo(() => {
        if (!searchTerm.trim()) return dishes?.slice(0, 5);

        const term = searchTerm.toLowerCase();
        return dishes
            ?.filter(dish => dish.name.toLowerCase().includes(term))
            ?.slice(0, 5); 
    }, [dishes, searchTerm]);

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full">
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Buscar plato..."
                            name="name"
                            value={searchTerm}
                            onChange={e=>setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                <div className="w-full flex-1 sm:w-auto">
                    <label htmlFor="dishQuantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                        type="number"
                        id="dishQuantity"
                        value={currentDishQuantityToAdd}
                        onChange={(e) => setCurrentDishQuantityToAdd(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 ease-in-out"
                    />
                </div>
                <Button
                    onClick={handleAddItem}
                    type="button"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-4 sm:mt-0 shadow-sm transition-all duration-200 ease-in-out"
                >
                    Añadir Plato
                </Button>
            </div>
            <div className="mt-6 border border-gray-200 rounded-md overflow-hidden shadow-sm overflow-x-auto"> 
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-2/5">Plato</th>
                            <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/5">Descripcion</th>
                            <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">Precio Unitario</th>
                        </tr>
                    </thead>
                    {filteredDishes && (
                    <tbody className="divide-y divide-gray-200">
                        {filteredDishes.map((item) => (
                            <tr 
                                key={item.id} 
                                onClick={()=>setCurrentDishIdToAdd(item.id)}
                                className={`transition-colors hover:bg-gray-100 ${currentDishIdToAdd === item.id? 'bg-blue-100' : 'bg-white'} cursor-pointer select-none`}
                            >
                                <td className="px-4 py-2 text-sm sm:text-base text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</td>
                                <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">
                                    {item.description.split('\n').map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        <br />
                                    </span>))}
                                </td>
                                <td className="px-4 py-2 text-sm sm:text-base text-gray-700 whitespace-nowrap">${item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    )}
                </table>
            </div>
            
        </>
    );
}

export default DishTableForm;