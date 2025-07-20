import { useState, useCallback } from "react";
import { useNotification } from "../providers/notificationProvider";

// Tipos base para operaciones CRUD
interface ApiResource {
    id: string | number;
}
interface ApiError {
    detail?: string;
    message?: string;
}

// Configuración del hook
interface ApiConfig<T extends ApiResource, C = Partial<T>> {
    resourceName: string;
    defaultTransform?: (data: T) => T;
    createTransform?: (data: C) => C;
}

// Estado del hook
interface ApiState<T> {
    data: T | T[] | null;
    loading: boolean;
    error: string | null;
}

// Retorno del hook
interface ApiActions<T extends ApiResource, C = Partial<T>> {
    get: (id?: string, params?: Record<string, string>) => Promise<void>;
    create: (data: C, params?: Record<string, string>) => Promise<T | null>;
    update: (data: Partial<T>, params?: Record<string, string>) => Promise<T | null>;
    delete: (params?: Record<string, string>) => Promise<boolean>;
    reset: () => void;
    state: ApiState<T>;
}

// Hook principal
export function useApi<T extends ApiResource, C = Partial<T>>(config: ApiConfig<T, C>): ApiActions<T, C> {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const {showNotification} = useNotification()

    const transformData = useCallback(
        (data: T) => {
            if (config.defaultTransform) {
                return config.defaultTransform(data);
            }
            return data as T;
        },
        [config.defaultTransform]
    );

    const handleError = useCallback(
        (error: unknown, defaultMessage: string) => {
            let errorMessage = defaultMessage;

            if (typeof error === "string") {
                errorMessage = error;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null) {
                const apiError = error as ApiError;
                errorMessage = apiError.detail || apiError.message || defaultMessage;
            }

            setState((prev) => ({ ...prev, error: errorMessage }));
            showNotification({message:errorMessage, type:"error"});
            return errorMessage;
        },
        [showNotification]
    );

    const get = useCallback(
        async (id?: string, params?: Record<string, string>) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const queryParams = new URLSearchParams(params).toString();
                const url = id
                    ? `/api/get/${id}${queryParams ? `?${queryParams}` : ""}`
                    : `/api/get/${queryParams ? `?${queryParams}` : ""}`;

                const response = await fetch(url);

                if (!response.ok) {
                    if (response.status ==404){
                        setState({
                            data: null,
                            loading: false,
                            error: null,
                        });
                        return
                    }
                    throw new Error(`Error ${response.status}: ${await response.text}`);
                }

                const result = await response.json();
                const transformedData = id
                    ? transformData(result)
                    : result.map((item: T) => transformData(item));

                setState({
                    data: transformedData,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                const message = handleError(error, `Error cargando ${config.resourceName}`);
                setState((prev) => ({ ...prev, loading: false, error: message }));
            }
        },
        [config.resourceName, transformData, handleError]
    );

    const create = useCallback(
        async (data: C,params?: Record<string, string>): Promise<T | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                // Transformación específica para creación si existe
                const bodyData = config.createTransform ? config.createTransform(data) : data;
                const queryParams = new URLSearchParams(params).toString();
                const response = await fetch("/api/save?"+queryParams, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyData),
                });

                if (response.status === 409) {
                    throw new Error(`${config.resourceName} ya existe`);
                }

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${await response.text()}`);
                }

                const result = await response.json();
                const newItem = transformData(result);

                showNotification({message:`${config.resourceName} creado correctamente`, type:"success"});
                return newItem;
            } catch (error) {
                handleError(error, `Error creando ${config.resourceName}`);
                return null;
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [config.resourceName, transformData, handleError, showNotification]
    );

    const update = useCallback(
        async (data: Partial<T>,params?: Record<string, string>): Promise<T | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const queryParams = new URLSearchParams(params).toString();
                const response = await fetch(`/api/save?`+queryParams, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (response.status === 409) {
                    throw new Error(`Conflicto al actualizar ${config.resourceName}`);
                }

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                const updatedItem = transformData(result);

                showNotification({message:`${config.resourceName} actualizado correctamente`, type:"success"});
                return updatedItem;
            } catch (error) {
                handleError(error, `Error actualizando ${config.resourceName}`);
                return null;
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [config.resourceName, transformData, handleError, showNotification]
    );

    const deleteResource = useCallback(
        async (params?: Record<string, string>): Promise<boolean> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const queryParams = new URLSearchParams(params).toString();
                const response = await fetch(`/api/delete?`+queryParams, {
                    method: "DELETE",
                });

                if (response.status === 409) {
                    throw new Error(
                        `No se puede eliminar ${config.resourceName} con datos vinculados`
                    );
                }

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                showNotification({message:`${config.resourceName} eliminado correctamente`, type:"success"});
                return true;
            } catch (error) {
                handleError(error, `Error eliminando ${config.resourceName}`);
                return false;
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [config.resourceName, handleError, showNotification]
    );

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        get,
        create,
        update,
        delete: deleteResource,
        reset,
        state,
    };
}
