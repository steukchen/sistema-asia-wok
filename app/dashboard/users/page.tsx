"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import UserForm from "@/app/components/ui/dashboard/users/userForm";
import UserTable from "@/app/components/ui/dashboard/users/userTable";
import {useApi} from "@/app/hooks/api"

export default function UserSection() {
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState<User[] | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);

    const { 
        state: { data, loading, error }, 
        get, 
        create, 
        update, 
        delete: deleteItem
    } = useApi<User, UserFormData>({
        resourceName: 'Usuario',
        createTransform: (formData) => ({
            ...formData
        })
    });

    useEffect(() => {
        get("",{url:`/users/get_users`})
    }, []);

    useEffect(()=>{
        if (data!=null){
            if (data instanceof Array){
                setUsers(data)
            }
        }
    },[data])

    const saveUser = async (userData: UserFormData,params: Record<string,string>)=>{
        const data = editUser ? await update(userData,params) : await create(userData,params)
        if (data){
            setShowForm(false)
        }else setShowForm(true)
        get("",{url:`/users/get_users`})
    }

    const deleteUser = async (params: Record<string,string>)=>{
        if(!confirm("¿Esta seguro de eliminar el usuario?")) return
        await deleteItem(params);get("",{url:`/users/get_users`})
    }

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestion de Usuarios"
                textButton="Crear Usuario"
                error={error}
                onClickButton={() => {
                    setShowForm(true);
                    setEditUser(null);
                }}
            />
            {/* Modal para el formulario de creación/edición */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editUser ? "Modificar Usuario" : `Crear Nuevo Usuario`}
            >
                <UserForm
                    onSave={saveUser}
                    onCancel={() => setShowForm(false)}
                    isLoading={loading}
                    initialData={editUser ? editUser : null}
                />
            </Modal>

            {!showForm && !loading && users && (
                <UserTable
                    items={users}
                    onEdit={(user) => {
                        setEditUser(user);
                        setShowForm(true);
                    }}
                    onDelete={deleteUser}
                />
            )}
            {!showForm && !loading && !users && !error && (
                <p className="text-gray-600 text-center py-8">No hay usuarios registrados.</p>
            )}
        </div>
    );
}
