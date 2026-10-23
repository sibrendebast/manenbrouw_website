"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { ArrowLeft, Plus, Search, Filter, Wine, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getTastings, getTastingStats } from "@/app/actions/tastingActions";
import TastingStats from "./TastingStats";
import TastingCard from "./TastingCard";
import TastingEditModal from "./TastingEditModal";
import NewTastingModal from "./NewTastingModal";

export default function AdminTastingsPage() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [tastings, setTastings] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        totalRevenue: 0,
        openBalance: 0,
        totalBookings: 0,
    });

    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modals
    const [editingBooking, setEditingBooking] = useState<any | null>(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [bookingsData, statsData] = await Promise.all([
            getTastings({ status: selectedStatus, search: searchQuery }),
            getTastingStats(),
        ]);
        setTastings(bookingsData);
        setStats(statsData);
        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadData();
        }
    }, [isAuthenticated, router, selectedStatus]);

    // Handle search submission or debounced search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    if (!mounted || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back to dashboard button */}
                <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" /> Terug naar Dashboard
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="bg-brewery-dark p-2 text-white">
                                <Wine className="h-7 w-7 text-brewery-green" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-brewery-dark">
                                Proeverijen & Boekingen
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                            Beheer aanvragen, planning (datum & uur), aantal personen en betalingen.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            title="Vernieuwen"
                            className="p-3 border-2 border-black bg-white hover:bg-gray-100 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-brewery-dark text-white font-black hover:bg-brewery-green transition-colors"
                        >
                            <Plus className="w-5 h-5" /> Nieuwe Boeking
                        </button>
                    </div>
                </div>

                {/* Top Statistics */}
                <TastingStats stats={stats} />

                {/* Filters & Search */}
                <div className="bg-white border-2 border-black p-4 mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "ALL", label: "Alle", count: stats.totalBookings },
                                { key: "PENDING", label: "Aanvragen", count: stats.pendingCount },
                                { key: "CONFIRMED", label: "Ingepland", count: stats.confirmedCount },
                                { key: "COMPLETED", label: "Voltooid", count: stats.completedCount },
                                { key: "CANCELLED", label: "Geannuleerd", count: stats.cancelledCount },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedStatus(tab.key)}
                                    className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${
                                        selectedStatus === tab.key
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                            selectedStatus === tab.key
                                                ? "bg-brewery-green text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Zoek klant, nr, e-mail..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-semibold focus:outline-none focus:bg-brewery-green/5"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white font-bold text-xs uppercase hover:bg-brewery-green transition-colors"
                            >
                                Zoeken
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tastings List */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green mx-auto mb-4"></div>
                        <p className="text-gray-500 font-bold">Proeverijen laden...</p>
                    </div>
                ) : tastings.length === 0 ? (
                    <div className="bg-white border-2 border-black p-12 text-center">
                        <Wine className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-black mb-2">Geen proeverijen gevonden</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                            {selectedStatus === "ALL"
                                ? "Er zijn momenteel nog geen proeverij aanvragen of boekingen."
                                : `Geen boekingen met status "${selectedStatus}".`}
                        </p>
                        <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-black hover:bg-brewery-green transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Voeg een boeking toe
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tastings.map((booking) => (
                            <TastingCard
                                key={booking.id}
                                booking={booking}
                                onEdit={() => setEditingBooking(booking)}
                                onRefresh={loadData}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingBooking && (
                <TastingEditModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onUpdated={loadData}
                />
            )}

            {isNewModalOpen && (
                <NewTastingModal
                    onClose={() => setIsNewModalOpen(false)}
                    onCreated={loadData}
                />
            )}
        </div>
    );
}
