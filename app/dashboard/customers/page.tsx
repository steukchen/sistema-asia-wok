"use client";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/dashboard/modal";
import { useApi } from "@/app/hooks/api";
import CustomerForm from "@/app/components/ui/dashboard/customers/customerForm";
import CustomerTable from "@/app/components/ui/dashboard/customers/customerTable";

export default function CustomerSection() {
    const [showForm, setShowForm] = useState(false);
    const [customers, setCustomers] = useState<Customer[] | null>(null);
    const [editCustomer, setEditCustomer] = useState<CustomerFormData | null>(null);

    const {
        state: { data, loading, error },
        get,
        create,
        update,
        delete: deleteItem
    } = useApi<Customer, CustomerFormData>({
        resourceName: 'Cliente',
        createTransform: (formData) => ({
            ...formData
        })
    });

    useEffect(() => {
        get("", { url: `/customers/get_customers` });
    }, []);

    useEffect(() => {
        if (data != null && Array.isArray(data)) {
            setCustomers(data);
        }
    }, [data]);

    const saveCustomer = async (customerData: CustomerFormData, params: Record<string, string>) => {
        const response = editCustomer ? await update(customerData, params) : await create(customerData, params);
        if (response) {
            setShowForm(false);
        } else {
            setShowForm(true);
        }
        get("", { url: `/customers/get_customers` });
    };

    const deleteCustomer = async (params: Record<string, string>) => {
        if (!confirm("¿Está seguro de eliminar el cliente?")) return;
        await deleteItem(params);
        get("", { url: `/customers/get_customers` });
    };

    return (
        <div className="bg-white w-full overflow-hidden">
            <HeadSection
                loading={loading}
                title="Gestión de Clientes"
                textButton="Crear Cliente"
                error={error}
                onClickButton={() => {
                    setShowForm(true);
                    setEditCustomer(null);
                }}
            />

            {/* Modal para crear/modificar cliente */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editCustomer ? "Modificar Cliente" : "Crear Nuevo Cliente"}
            >
                <CustomerForm
                    onSave={saveCustomer}
                    onCancel={() => setShowForm(false)}
                    isLoading={loading}
                    initialData={editCustomer ?? null}
                />
            </Modal>

            {!showForm && !loading && customers && (
                <CustomerTable
                    items={customers}
                    onEdit={(customer) => {
                        const customerForm: CustomerFormData = {
                            id: customer.id,
                            ci: customer.ci,
                            name: customer.name,
                            lastname: customer.lastname,
                            phone_number: customer.phone_number,
                            address: customer.address
                        };
                        setEditCustomer(customerForm);
                        setShowForm(true);
                    }}
                    onDelete={deleteCustomer}
                />
            )}
            {!showForm && !loading && !customers && !error && (
                <p className="text-gray-600 text-center py-8">No hay clientes registrados.</p>
            )}
        </div>
    );
}
