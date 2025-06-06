'use client';
import { useAuth } from '../../providers/providers';;
import { useRouter } from 'next/navigation';


export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = (role: string) => {
        console.log(role);
        login(role as any, 'Usuario Demo'); // Simulación
        router.push(`/${role}`);
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">
                    Asia Wok - Login
                </h1>
                <div className="space-y-3">
                {['admin', 'mesonero', 'cajero', 'cocina'].map((role) => (
                    <button
                    key={role}
                    onClick={() => handleLogin(role)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded capitalize text-sm md:text-base"
                    >
                    Entrar como {role}
                </button>
                ))}
                </div>
            </div>
        </div>
    );
}
