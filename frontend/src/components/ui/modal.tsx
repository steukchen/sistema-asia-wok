'use client';
import React from 'react';

interface ModalProps {
    isOpen: boolean; // Controla si el modal está visible
    onClose: () => void; // Función para cerrar el modal
    title: string; // Título del modal
    children: React.ReactNode; // Contenido dentro del modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            {/* Contenedor del contenido del modal */}
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full relative">
                {/* Título del modal */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                
                {/* Botón para cerrar el modal */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                    aria-label="Cerrar modal"
                >
                    &times; {/* Símbolo de "x" */}
                </button>

                {/* Contenido pasado como children */}
                {children}
            </div>
        </div>
    );
};

export default Modal;
