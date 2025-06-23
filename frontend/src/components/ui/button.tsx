import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    isLoading = false,
    children,
    className = '',
    ...props
}) => {
    return (
        <button
            type="submit"
            disabled={isLoading || props.disabled}
            className={`
        w-full py-3 px-4 rounded-lg transition-all shadow-xl
        bg-black/80 text-white hover:bg-[#FB3D01]
        focus:outline-none focus:ring-2 focus:ring-[#FB3D01] focus:ring-offset-2
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
            `}
            {...props}
        >
            {isLoading ? (
                // Muestra un spinner y texto de carga si isLoading es true
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
