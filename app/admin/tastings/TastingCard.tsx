"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, DollarSign, Mail, Phone, Edit3, Trash2, Check, AlertCircle } from "lucide-react";
import { updateTasting, deleteTasting } from "@/app/actions/tastingActions";
import { TastingStatusType } from "@/lib/tastingUtils";

interface TastingCardProps {
    booking: any;
    onEdit: () => void;
    onRefresh: () => void;
}

export default function TastingCard({ booking, onEdit, onRefresh }: TastingCardProps) {
    const [actionLoading, setActionLoading] = useState(false);

    const scheduledDateObj = booking.scheduledDate ? new Date(booking.scheduledDate) : 
                            booking.requestedDate ? new Date(booking.requestedDate) : null;

    const formattedDate = scheduledDateObj 
        ? scheduledDateObj.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        : 'Datum onbekend';

    const totalPrice = booking.totalPrice || 0;
    const amountPaid = booking.amountPaid || 0;
    const balance = Math.max(0, totalPrice - amountPaid);

    const handleQuickStatus = async (newStatus: TastingStatusType) => {
        setActionLoading(true);
        await updateTasting(booking.id, { status: newStatus });
        setActionLoading(false);
        onRefresh();
    };

    const handleDelete = async () => {
        if (!confirm(`Weet je zeker dat je proeverij ${booking.bookingNumber || booking.customerName} wilt verwijderen?`)) {
            return;
        }
        setActionLoading(true);
        await deleteTasting(booking.id);
        setActionLoading(false);
        onRefresh();
    };

    return (
        <div className="bg-white border-2 border-black hover:border-brewery-green transition-all shadow-sm flex flex-col justify-between">
            <div>
                {/* Top bar with Booking ID and Status Badge */}
                <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5">
                            {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            {new Date(booking.createdAt).toLocaleDateString('nl-BE')}
                        </span>
                    </div>

                    <span className={`text-xs uppercase font-black px-2.5 py-0.5 rounded border ${
                        booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' :
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-900 border-amber-400' :
                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-900 border-blue-400' :
                        'bg-rose-100 text-rose-900 border-rose-400'
                    }`}>
                        {booking.status === 'PENDING' ? 'Nieuwe Aanvraag' :
                         booking.status === 'CONFIRMED' ? 'Ingepland' :
                         booking.status === 'COMPLETED' ? 'Voltooid' : 'Geannuleerd'}
                    </span>
                </div>

                {/* Primary Event Details */}
                <div className="p-5 space-y-4">
                    {/* Date, Time & People Highlights */}
                    <div className="grid grid-cols-2 gap-3 bg-brewery-green/5 border border-brewery-green/20 p-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brewery-green shrink-0" />
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Datum</span>
                                <span className="text-sm font-black capitalize text-brewery-dark">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brewery-green shrink-0" />
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Startuur</span>
                                <span className="text-sm font-black text-brewery-dark">
                                    {booking.scheduledTime || "Nog te bepalen"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-brewery-green shrink-0" />
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Groep</span>
                                <span className="text-sm font-black text-brewery-dark">{booking.peopleCount} personen</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brewery-green shrink-0" />
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold block uppercase">Locatie</span>
                                <span className="text-xs font-bold text-brewery-dark truncate block max-w-[130px]" title={booking.address || booking.locationType}>
                                    {booking.locationType === 'Op verplaatsing' ? (booking.address || 'Op locatie') : 'Brouwerij'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h3 className="font-black text-lg text-brewery-dark">{booking.customerName}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                            <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-1 hover:text-brewery-green font-medium">
                                <Mail className="w-3.5 h-3.5" /> {booking.customerEmail}
                            </a>
                            {booking.customerPhone && (
                                <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1 hover:text-brewery-green font-medium">
                                    <Phone className="w-3.5 h-3.5" /> {booking.customerPhone}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Formula & Extras tags */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-gray-100 border border-gray-300 font-bold px-2 py-0.5 rounded">
                            {booking.formula}
                        </span>
                        {booking.keepGlass && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
                                + Glas mee naar huis
                            </span>
                        )}
                    </div>

                    {/* Financial & Payment Row */}
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-gray-500 block text-[11px] font-bold uppercase">Betaling</span>
                            <span className="font-black text-sm">
                                &euro;{amountPaid.toFixed(2)} <span className="text-gray-500 font-normal">/ &euro;{totalPrice.toFixed(2)}</span>
                            </span>
                        </div>

                        <div>
                            <span className={`px-2.5 py-1 rounded font-black text-xs border ${
                                booking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                booking.paymentStatus === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-rose-100 text-rose-800 border-rose-300'
                            }`}>
                                {booking.paymentStatus === 'PAID' ? 'Betaald' :
                                 booking.paymentStatus === 'PARTIALLY_PAID' ? `Voorschot (open: €${balance.toFixed(0)})` :
                                 'Niet betaald'}
                            </span>
                        </div>
                    </div>

                    {/* Customer Message Excerpt */}
                    {booking.customerMessage && (
                        <div className="text-xs bg-gray-50 p-2.5 border-l-2 border-black italic text-gray-700">
                            "{booking.customerMessage}"
                        </div>
                    )}

                    {/* Admin Notes Excerpt */}
                    {booking.adminNotes && (
                        <div className="text-xs bg-blue-50 p-2.5 border-l-2 border-blue-600 font-medium text-blue-900">
                            <strong>Notitie:</strong> {booking.adminNotes}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t-2 border-black bg-gray-50 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                    {booking.status === 'PENDING' && (
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleQuickStatus('CONFIRMED')}
                            className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center gap-1"
                        >
                            <Check className="w-3.5 h-3.5" /> Bevestigen
                        </button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleQuickStatus('COMPLETED')}
                            className="px-3 py-1.5 bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 flex items-center gap-1"
                        >
                            <Check className="w-3.5 h-3.5" /> Afronden
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="px-3 py-1.5 border-2 border-black bg-white font-bold text-xs hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Edit3 className="w-3.5 h-3.5" /> Details & Beheer
                    </button>
                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleDelete}
                        title="Verwijderen"
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
