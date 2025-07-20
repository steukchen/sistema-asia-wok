'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashBoard() {
    const router = useRouter()
    useEffect(()=>{
        router.push("dashboard/orders")
    },[])
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-700 text-lg sm:text-xl animate-pulse">
                Redireccionando...
            </p>
        </div>
    );
}
