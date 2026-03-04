"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Package, ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

export default function VoorraadbeheerGrondstoffen() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) router.push("/admin/login");
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/admin/brouwadministratie" className="flex items-center text-gray-500 hover:text-brewery-dark text-sm font-medium">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Brouwadministratie
                    </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="bg-white border-2 border-dashed border-gray-300 p-16 max-w-lg w-full">
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-100 p-6">
                                <Package className="h-16 w-16 text-gray-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-brewery-dark mb-3">Voorraad Grondstoffen</h1>
                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 mb-4">
                            <Construction className="h-4 w-4" />
                            <span className="text-sm font-medium">Nog te implementeren</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Deze sectie zal het beheer van grondstoffenvoorraden bevatten: mout,
                            hop, gist en overige ingrediënten.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
