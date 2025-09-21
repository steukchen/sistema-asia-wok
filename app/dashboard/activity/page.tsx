'use client';

import { FaMoneyBillWave } from "react-icons/fa";
import { GiMeal } from "react-icons/gi";
import { GoPersonFill } from "react-icons/go";
import HeadSection from "@/app/components/ui/dashboard/headSection";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import Link from "next/link"; // Importa Link

export default function ActivityPage() {
    return (
        <div className="p-6 space-y-8">
            <HeadSection title="Metricas del Restaurante" loading={false} error={null} />

            {/* Opciones visuales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/dashboard/activity/dishesMost" className="Link">
                    <div className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition">
                        <GiMeal className="text-4xl text-orange-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Platos Mas Vendidos</h3>
                        <p className="text-sm text-gray-600">Visualiza los platos mas vendidos filtando por fechas!.</p>
                    </div>
                </Link>

                <Link href="/dashboard/activity/currenciesMost" className="Link">
                    <div className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition">
                        <FaMoneyBillWave className="text-4xl text-green-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Totales en Divisas</h3>
                        <p className="text-sm text-gray-600">Mira tus ingresos filtrando por fechas!.</p>
                    </div>
                </Link>

                <Link href="/dashboard/activity/frequentClients" className="Link">
                    <div className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition">
                        <GoPersonFill className="text-4xl text-blue-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Clientes Frecuentes</h3>
                        <p className="text-sm text-gray-600">Mira tus clientes mas frecuentes filtrando por fechas.</p>
                    </div>
                </Link>

                <Link href="/dashboard/activity/invoices" className="Link">
                    <div className="cursor-pointer bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center justify-center text-center transition">
                        <LiaFileInvoiceDollarSolid className="text-4xl text-red-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Recibos de Pago</h3>
                        <p className="text-sm text-gray-600">Busca tus recibos de pago.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}