"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import {useApi} from "@/app/hooks/api"
import DishForm from "@/app/components/ui/dashboard/dishes/dishForm";
import DishTable from "@/app/components/ui/dashboard/dishes/dishTable";

export default function DishSection() {
    const [showForm, setShowForm] = useState(false);
    const [dishes, setDishes] = useState<Dish[] | null>(null);
    const [editDish, setEditDish] = useState<DishFormData | null>(null);

    const { 
        state: { data, loading, error }, 
        get, 
        create, 
        update, 
        delete: deleteItem
    } = useApi<Dish, DishFormData>({
        resourceName: 'Plato',
        createTransform: (formData) => ({
            ...formData
        })
    });

    useEffect(() => {
        get("",{url:`/dishes/get_dishes`})
    }, []);

    useEffect(()=>{
        if (data!=null){
            if (data instanceof Array){
                setDishes(data)
            }
        }
    },[data])

    const saveDish = async (dishData: DishFormData,params: Record<string,string>)=>{
        const data = editDish ? await update(dishData,params) : await create(dishData,params)
        if (data){
            setShowForm(false)
        }else setShowForm(true)
        get("",{url:`/dishes/get_dishes`})
    }

    const deleteDish = async (params: Record<string,string>)=>{
        if(!confirm("¿Esta seguro de eliminar el plato?")) return
        await deleteItem(params);get("",{url:`/dishes/get_dishes`})
    }

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestion de Platos"
                textButton="Crear Plato"
                error={error}
                onClickButton={() => {
                    setShowForm(true);
                    setEditDish(null);
                }}
            />
            {/* Modal para el formulario de creación/edición */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editDish ? "Modificar Plato" : `Crear Nuevo Plato`}
            >
                <DishForm
                    onSave={saveDish}
                    onCancel={() => setShowForm(false)}
                    initialData={editDish ? editDish : null}
                />
            </Modal>

            {!showForm && !loading && dishes && (
                <DishTable
                    items={dishes}
                    onEdit={(dish) => {
                        const dishForm: DishFormData = {
                            id:dish.id,
                            name:dish.name,
                            description:dish.description,
                            price:dish.price,
                            type_id:dish.type.id
                        } 
                        setEditDish(dishForm);
                        setShowForm(true);
                    }}
                    onDelete={deleteDish}
                />
            )}
            {!showForm && !loading && !dishes && !error && (
                <p className="text-gray-600 text-center py-8">No hay usuarios registrados.</p>
            )}
        </div>
    );
}
