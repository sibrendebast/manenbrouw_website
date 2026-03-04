"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { FlaskConical, Package, Archive, BookOpen, ArrowLeft, ClipboardList, Building2 } from "lucide-react";
import Link from "next/link";

const SECTIES = [
    {
        href: "/admin/brouwadministratie/receptuur",
        icon: FlaskConical,
        title: "Receptuur",
        beschrijving: "Beheer brouwreceptsjabloons, ingrediënten per stap en automatische brouwberekeningen.",
        actief: true,
    },
    {
        href: "/admin/brouwadministratie/brouwsels",
        icon: ClipboardList,
        title: "Brouwsels",
        beschrijving: "Registreer uitgevoerde brouwsels, inclusief gemeten waarden en geproduceerd volume.",
        actief: true,
    },
    {
        href: "/admin/brouwadministratie/voorraadbeheer-grondstoffen",
        icon: Package,
        title: "Voorraad Grondstoffen",
        beschrijving: "Beheer de voorraad van mout, hop, gist en overige grondstoffen.",
        actief: true,
    },
    {
        href: "/admin/brouwadministratie/leveranciers",
        icon: Building2,
        title: "Leveranciers",
        beschrijving: "Overzicht van leveranciers met KBO, FAVV en contactgegevens.",
        actief: true,
    },
    {
        href: "/admin/brouwadministratie/voorraadbeheer-producten",
        icon: Archive,
        title: "Voorraad Afgewerkte Producten",
        beschrijving: "Overzicht van gebotteld/gevat bier per batch en voorraaddashboard.",
        actief: false,
    },
    {
        href: "/admin/brouwadministratie/logboek",
        icon: BookOpen,
        title: "Logboek",
        beschrijving: "Brouwdagboek: metingen, observaties en brouwnotities per batch.",
        actief: true,
    },
];

export default function BrouwadministratiePage() {
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
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center text-gray-500 hover:text-brewery-dark transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Dashboard
                    </Link>
                </div>
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-brewery-dark">Brouwadministratie</h1>
                    <p className="text-gray-500 mt-2">
                        Beheer recepten, grondstoffen, productvoorraad en het brouwlogboek.
                    </p>
                </div>

                {/* Sectie-kaarten */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
                    {SECTIES.map(({ href, icon: Icon, title, beschrijving, actief }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`bg-white p-8 border-2 transition-all group ${actief
                                ? "border-black hover:border-brewery-green"
                                : "border-gray-300 hover:border-gray-400 opacity-70"
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`p-6 mb-6 transition-colors ${actief
                                        ? "bg-brewery-dark group-hover:bg-brewery-green"
                                        : "bg-gray-400"
                                        }`}
                                >
                                    <Icon className="h-16 w-16 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-brewery-dark mb-3 flex items-center gap-2">
                                    {title}
                                    {!actief && (
                                        <span className="text-xs font-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                                            Binnenkort
                                        </span>
                                    )}
                                </h2>
                                <p className="text-gray-600">{beschrijving}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
