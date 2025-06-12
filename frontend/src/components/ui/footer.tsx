
export default function Footer(){
    return(
        <p className="w-full flex flex-col text-center text-gray-500 text-md mt-8">
            © {new Date().getFullYear()} Asia Wok - Todos los derechos reservados
        </p>
    );
}