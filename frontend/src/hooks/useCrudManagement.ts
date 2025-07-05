'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/providers/providers'; // Ruta ajustada

interface CrudItem {
    id: number;
    nombre: string;
    is_active: boolean;
}

/**
 * Hook personalizado para gestionar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * @template T El tipo de dato de la entidad (ej. User, Plato). Debe extender CrudItem.
 * @template CreateData El tipo de dato para la creación (ej. UserCreate, PlatoCreate).
 * @template UpdateData El tipo de dato para la actualización (ej. UserUpdate, PlatoUpdate).
 *
 * @param {string} endpointUrl La URL base del endpoint de la API (ej. '/users', '/platos').
 * @returns Un objeto con el estado y las funciones para las operaciones CRUD.
 */


export const useCrudManagement = <T extends CrudItem, CreateData, UpdateData>(
    endpointUrl: string
) => {
    const { token } = useAuth();
    const API_BASE_URL = 'http://localhost:8000';

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);

    // Función para cargar los ítems desde el backend
    const fetchItems = useCallback(async () => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}${endpointUrl}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
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
        } catch (err: any) {
            console.error(`Error fetching ${endpointUrl.slice(1)}:`, err);
            setError(err.message || 'Error desconocido al cargar datos.');
        } finally {
            setLoading(false);
        }
    }, [token, endpointUrl]);

    // Carga los ítems al montar el componente que usa este hook
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Función para manejar la creación/actualización de un ítem
    const handleSaveItem = useCallback(async (itemData: CreateData | UpdateData) => {
        if (!token) {
            setError('No autenticado. Por favor, inicia sesión.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `${API_BASE_URL}${endpointUrl}/${editingItem.id}` : `${API_BASE_URL}${endpointUrl}/`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al ${editingItem ? 'actualizar' : 'crear'} ${endpointUrl.slice(1, -1)}.`);
            }

            await fetchItems(); // Recarga la lista de ítems
            setShowForm(false);
            setEditingItem(null); // Limpia el ítem en edición
        } catch (err: any) {
            console.error(`Error saving ${endpointUrl.slice(1, -1)}:`, err);
            setError(err.message || 'Error desconocido al guardar.');
        } finally {
            setLoading(false);
        }
    }, [token, editingItem, endpointUrl, fetchItems]);

    // Función para manejar la eliminación de un ítem
    const handleDeleteItem = useCallback(async (itemId: number) => {
        if (!token) {
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
            const response = await fetch(`${API_BASE_URL}${endpointUrl}/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al eliminar ${endpointUrl.slice(1, -1)}.`);
            }

            await fetchItems();
        } catch (err: any) {
            console.error(`Error deleting ${endpointUrl.slice(1, -1)}:`, err);
            setError(err.message || 'Error desconocido al eliminar.');
        } finally {
            setLoading(false);
        }
    }, [token, endpointUrl, fetchItems]);

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
