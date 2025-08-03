'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/button'; 
import { useNotification } from '@/app/providers/notificationProvider';

interface DishFormProps {
    initialData?: DishFormData | null;
    onSave: (dishData: DishFormData,params: Record<string, string>) => void;
    onCancel: () => void;
}

const DishForm: React.FC<DishFormProps> = ({ initialData, onSave, onCancel }) => {
    // Estado del formulario
    const [formData, setFormData] = useState<DishFormData>({
        name: '',
        description: '',
        price: 0,
        type_id: 1
    });
    const [dishTypes,setDishTypes] = useState<[DishType] | null>(null);
    const {showNotification, closeNotification} = useNotification()
    const [loading,setLoading] = useState(false)

    // Efecto para precargar los datos si se está editando un plato
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                type_id: initialData.type_id
            });
        } else {
            // Reinicia el formulario para creación
            setFormData({
                name: '',
                description: '',
                price: 0,
                type_id: 1
            });
        }
    }, [initialData]);

    useEffect(() =>{
        closeNotification()
        setLoading(true)
        const params = new URLSearchParams({
                url: `/dishes_types/get_dishes_types`
            });
        fetch("/api/get?"+params,{
            method:"GET"
        })
        .then(response=>response.json())
        .then(data=>{
            setDishTypes(data)
        }).catch(rej=>{
            showNotification({message:"Error al cargar los tipos de platos: "+rej,type:"error"})
        }).finally(()=>setLoading(false))
    },[])

    // Manejador de cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();
        setLoading(true)

        // Validaciones básicas del lado del cliente
        if (!formData.name  || formData.type_id <=0 || formData.price <= 0) {
            showNotification({message:'Todos los campos obligatorios deben ser llenados.',type:"error"});
            setLoading(false)
            return;
        }
        if (formData.name.length <= 3){
            showNotification({message:'El nombre de tener al menos 4 caracteres',type:"error"});
            setLoading(false)
            return;
        }

        await onSave(formData,{url:initialData ? "/dishes/update_dish/"+initialData.id:"/dishes/create_dish"});
        setLoading(false)
    };

    if (loading) return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                    Cargando...
                </p>
            </div>
    );


    return (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Campo Nombre */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Campo Descripción */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            {/* Campo Precio */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.1" // Permite decimales para el precio
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="0.00" // Asegura que el precio sea positivo
                />
            </div>

            {/* Campo Categoría */}
            <div>
                <label htmlFor="type_id" className="block text-sm font-medium text-gray-700 mb-1" >
                    Tipo de Plato
                </label>
                <select
                    id="type_id"
                    name="type_id"
                    value={formData.type_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                    {
                        dishTypes?.map(dishType=>(
                            <option value={dishType.id} key={dishType.id}>{dishType.name}</option>
                        ))
                    }
                </select>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col md:flex-row gap-3 justify-end space-x-3 mt-6 md:w-[60%] md:relative md:ml-auto">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {initialData ? 'Actualizar Plato' : 'Crear Plato'}
                </Button>
            </div>
        </form>
    );
};

export default DishForm;

