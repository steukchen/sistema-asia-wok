'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/button'; 
import { useNotification } from '@/app/providers/notificationProvider';

interface DishFormProps {
    initialData?: DishFormData | null;
    onSave: (dishData: DishFormData,params: Record<string, string>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const DishForm: React.FC<DishFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
    // Estado del formulario
    const [formData, setFormData] = useState<DishFormData>({
        name: '',
        description: '',
        price: 0,
        type_id: 1
    });
    const [dishTypes,setDishTypes] = useState<[DishType] | null>(null);
    const {showNotification, closeNotification} = useNotification()

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
        })
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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();

        // Validaciones básicas del lado del cliente
        if (!formData.name || !formData.description || formData.type_id <=0 || formData.price <= 0) {
            showNotification({message:'Todos los campos obligatorios deben ser llenados y el precio debe ser positivo.',type:"error"});
            return;
        }

        onSave(formData,{url:initialData ? "/dishes/update_dish/"+initialData.id:"/dishes/create_dish"});

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                />
            </div>

            {/* Campo Descripción */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
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
                    step="0.01" // Permite decimales para el precio
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0.01" // Asegura que el precio sea positivo
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
                    required
                >
                    {
                        dishTypes?.map(dishType=>(
                            <option value={dishType.id} key={dishType.id}>{dishType.name}</option>
                        ))
                    }
                </select>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-6">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="bg-[#FB3D01] hover:bg-[#E03A00] text-white px-4 py-2 rounded-md"
                >
                    {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Plato' : 'Crear Plato')}
                </Button>
            </div>
        </form>
    );
};

export default DishForm;

