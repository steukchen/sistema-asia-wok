import Button from '../../../components/ui/button'


export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4 cursor-default font-inter">
            <h1 className="text-6xl font-bold text-red-600 mb-4">Acceso Denegado</h1>

            <p className="text-gray-600 mb-6">No tienes permiso para acceder a esta página.</p>

            <a href='/'>
                <Button
                    className='text-center bg-red-600 hover:bg-red-400'>
                    Salir
                </Button>
            </a>
        </div>
    );
}