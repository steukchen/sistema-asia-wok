'use client';
import Image from 'next/image';
import { useAuth } from '../../app/providers/providers';
import Footer from '../../components/ui/footer';
import LoginForm from '../../components/auth/LoginForm';
import { lusitana, montserrat } from '../../components/font'; 

export default function LoginPage() {
    const { login, isLoading } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-8 cursor-default font-inter">

            {/* Sección del Logo y Título */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-full overflow-hidden border-2 border-gray-300 shadow-lg">
                    <Image
                        src="/asia-wok-logo.jpg"
                        alt="Asia Wok Logo"
                        fill 
                        className="object-cover"
                        priority
                    />
                </div>
                <h1 className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-[#FB3D01] mt-4 sm:mt-6 text-center leading-tight`}>
                    SISTEMA DE GESTIÓN
                </h1>
                <p className={`${montserrat.className} text-gray-600 mt-2 text-sm sm:text-base text-center`}>
                    Ingrese sus credenciales
                </p>
            </div>
            {/* Componente del formulario de login */}
            <LoginForm login={login} isLoading={isLoading} />
            {/* Componente del pie de página */}
            <Footer />
        </div>
    );
}
