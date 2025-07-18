import Image from "next/image";
import { montserrat } from "@/app/components/fonts";

export default function HeaderLogin() {
    return (
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
            <h1 className={` text-3xl font-bold text-[#FB3D01] mt-4`}>SISTEMA DE GESTIÓN</h1>
            <p className={`${montserrat.className} text-gray-600 mt-2`}>Ingrese sus credenciales</p>
        </div>
    );
}
