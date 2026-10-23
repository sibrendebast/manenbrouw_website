"use client";

import { Calendar, Clock, DollarSign, CheckCircle2, AlertTriangle, Users } from "lucide-react";

interface TastingStatsProps {
    stats: {
        pendingCount: number;
        confirmedCount: number;
        completedCount: number;
        cancelledCount: number;
        totalRevenue: number;
        openBalance: number;
        totalBookings: number;
    };
}

export default function TastingStats({ stats }: TastingStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Pending Requests */}
            <div className="bg-white border-2 border-black p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">Aanvragen</span>
                    <div className="p-2 bg-amber-100 text-amber-800 rounded">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-black text-amber-900">{stats.pendingCount}</div>
                <div className="text-xs text-gray-500 mt-1">Wachten op bevestiging</div>
                {stats.pendingCount > 0 && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                )}
            </div>

            {/* Confirmed / Upcoming */}
            <div className="bg-white border-2 border-black p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Ingepland</span>
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-black text-emerald-900">{stats.confirmedCount}</div>
                <div className="text-xs text-gray-500 mt-1">Bevestigde proeverijen</div>
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
            </div>

            {/* Revenue Received */}
            <div className="bg-white border-2 border-black p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-brewery-green">Ontvangen</span>
                    <div className="p-2 bg-brewery-green/10 text-brewery-green rounded">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-black text-brewery-dark">
                    &euro;{stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Totaal betaald</div>
            </div>

            {/* Outstanding Balance */}
            <div className="bg-white border-2 border-black p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">Openstaand</span>
                    <div className="p-2 bg-blue-100 text-blue-800 rounded">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-black text-blue-900">
                    &euro;{stats.openBalance.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Nog te ontvangen</div>
                {stats.openBalance > 0 && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                )}
            </div>
        </div>
    );
}
