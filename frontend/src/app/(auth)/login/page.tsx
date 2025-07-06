'use client';
import Image from 'next/image';
import { useAuth } from '../../providers/providers';
import Footer from '../../../components/ui/footer';
import LoginForm from '../../../components/auth/LoginForm';
import { lusitana, montserrat } from '../../../components/font';

export default function LoginPage() {
    const { login, isLoading } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 cursor-default font-inter">

            {/* Sección del Logo y Título */}
            <div className="flex flex-col items-center mb-3">
                <div className="w-40 h-40 relative rounded-full overflow-hidden border-2 border-gray/70 shadow-lg">
                    <Image
                        src="/asia-wok-logo.jpg"
                        alt="Asia Wok Logo"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <h1 className={` text-3xl font-bold text-[#FB3D01] mt-4`}> 
                    SISTEMA DE GESTIÓN
                </h1>
                <p className={`${montserrat.className} text-gray-600 mt-2`}>
                    Ingrese sus credenciales
                </p>
            </div>
            <LoginForm login={login} isLoading={isLoading} />
            <Footer />
        </div>
    );
}
