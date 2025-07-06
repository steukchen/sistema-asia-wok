'use client';
import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // useEffect para controlar el scroll del body
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = ''; 
        }
        return () => {
            document.body.style.overflow = ''; 
        };
    }, [isOpen]); 

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera
        >
            <div 
                className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-95 opacity-0 sm:scale-100 sm:opacity-100"
                onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
                style={{
                    // Animación simple de entrada/salida para el modal
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
                }}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        aria-label="Cerrar modal"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
