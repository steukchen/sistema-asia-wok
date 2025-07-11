'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/providers'; // Ruta ajustada

interface CrudItem {
    id: string | number;
    status: boolean;
}

export const useCrudManagement = <T extends CrudItem, CreateData, UpdateData>(
    endpointUrl: string
) => {

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const { user } = useAuth();


    // Función para cargar los ítems desde el backend
    const fetchItems = useCallback(async () => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                url: `${endpointUrl}/get_${endpointUrl.replace("/","")}`
            });
            const response = await fetch("/api/get?"+params, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404 && errorData.detail === "No se encontraron usuarios." || errorData.detail === "No se encontraron platos con los filtros aplicados.") {
                    setItems([]);
                    setError(null); 
                    return;
                }
                throw new Error(errorData.detail || `Error al cargar ${endpointUrl.slice(1)}.`);
            }

            const data: T[] = await response.json();
            setItems(data);
        } catch (err) {
            console.error(`Error fetching ${endpointUrl.slice(1)}:`, err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al cargar datos.');
            }
        } finally {
            setLoading(false);
        }
    }, [endpointUrl,user]);

    // Carga los ítems al montar el componente que usa este hook
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Función para manejar la creación/actualización de un ítem
    const handleSaveItem = useCallback(async (itemData: CreateData | UpdateData) => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const params = new URLSearchParams({
                url: `${endpointUrl}/${editingItem ? "update" : "create"}_${endpointUrl.replace("/","").slice(0,endpointUrl=="/dishes" ? -2: -1)}${editingItem ? "/"+editingItem.id : ""}`
            });
            // const url = editingItem ? `${API_BASE_URL}${endpointUrl}/${editingItem.id}` : `/api/post/${endpointUrl}/create_${endpointUrl.replace("/","")}`;

            const response = await fetch("/api/post?"+params, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.detail || `Error al ${editingItem ? 'actualizar' : 'crear'} ${endpointUrl.slice(1, -1)}.`);
            }

            await fetchItems(); // Recarga la lista de ítems
            setShowForm(false);
            setEditingItem(null); // Limpia el ítem en edición
        } catch (err) {
            console.error(`Error saving ${endpointUrl.slice(1, -1)}:`, err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al guardar.');
            }
        } finally {
            setLoading(false);
        }
    }, [user, editingItem, endpointUrl, fetchItems]);

    // Función para manejar la eliminación de un ítem
    const handleDeleteItem = useCallback(async (itemId: number |string) => {
        if (!user) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }
        
        // Confirmación antes de eliminar
        if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                    url: `${endpointUrl}/delete_${endpointUrl.replace("/","").slice(0,endpointUrl=="/dishes" ? -2: -1)}/${itemId}`
            });
            const response = await fetch(`/api/delete?`+params, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al eliminar ${endpointUrl.slice(1, -1)}.`);
            }

            await fetchItems();
        } catch (err) {
            console.error(`Error deleting ${endpointUrl.slice(1, -1)}:`, err);
            if (err instanceof Error){
                setError(err.message || 'Error desconocido al eliminar.');
            }
        } finally {
            setLoading(false);
        }
    }, [user, endpointUrl, fetchItems]);

    // Función para iniciar la creación de un ítem
    const handleCreateNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    // Función para iniciar la edición de un ítem
    const handleEditItem = useCallback((item: T) => {
        setEditingItem(item);
        setShowForm(true);
    }, []);

    // Función para cancelar el formulario
    const handleCancelForm = useCallback(() => {
        setShowForm(false);
        setEditingItem(null);
        setError(null);
    }, []);

    return {
        items,
        loading,
        error,
        showForm,
        editingItem,
        fetchItems,
        handleSaveItem,
        handleDeleteItem,
        handleCreateNew,
        handleEditItem,
        handleCancelForm,
        setError
    };
};
