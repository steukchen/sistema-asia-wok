import { lusitana } from "@/app/components/fonts";
import Button from "@/app/components/ui/button";
import { useAuth } from "@/app/providers/authProvider";

interface HeadSectionProps {
    loading: boolean;
    error: string | null;
    title: string;
    textButton: string;
    onClickButton: () => void;
}

export default function HeadSection({
    loading,
    error,
    title,
    textButton,
    onClickButton,
}: HeadSectionProps) {
    const {user} = useAuth()
    return (
        <div className="bg-white w-full overflow-hidden">
            <h2
                className={`${lusitana.className} text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left`}
            >
                {title}
            </h2>

            {/* Botón para abrir el formulario de creación */}
            {user?.rol!="chef" && (<div className="mb-6 flex justify-end">
                <Button
                    className="w-full px-6 py-3 bg-[#FB3D01] hover:bg-[#E03A00] text-white font-bold rounded-md"
                    type="button"
                    onClick={onClickButton}
                >
                    {textButton}
                </Button>
            </div>)}

            {/* Mensaje de carga o error */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-600 text-lg">Cargando...</p>
                </div>
            )}
            {error && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                >
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}
        </div>
    );
}
