"use client";

import { useState } from "react";
import { X, Calendar, Clock, Users, MapPin, DollarSign, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { updateTasting } from "@/app/actions/tastingActions";
import { TastingStatusType, TastingPaymentStatusType } from "@/lib/tastingUtils";

interface TastingEditModalProps {
    booking: any;
    onClose: () => void;
    onUpdated: () => void;
}

export default function TastingEditModal({ booking, onClose, onUpdated }: TastingEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<TastingStatusType>(booking.status);
    const [paymentStatus, setPaymentStatus] = useState<TastingPaymentStatusType>(booking.paymentStatus);
    const [paymentMethod, setPaymentMethod] = useState<string>(booking.paymentMethod || "PAYCONIQ");

    // Form inputs
    const [scheduledDate, setScheduledDate] = useState<string>(
        booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().split('T')[0] : 
        booking.requestedDate ? new Date(booking.requestedDate).toISOString().split('T')[0] : ""
    );
    const [scheduledTime, setScheduledTime] = useState<string>(booking.scheduledTime || "");
    const [peopleCount, setPeopleCount] = useState<number>(booking.peopleCount || 10);
    const [formula, setFormula] = useState<string>(booking.formula || "Basis (4 bieren)");
    const [keepGlass, setKeepGlass] = useState<boolean>(!!booking.keepGlass);
    const [locationType, setLocationType] = useState<string>(booking.locationType || "Brouwerij");
    const [address, setAddress] = useState<string>(booking.address || "");
    const [totalPrice, setTotalPrice] = useState<number>(booking.totalPrice ?? 0);
    const [amountPaid, setAmountPaid] = useState<number>(booking.amountPaid ?? 0);
    const [adminNotes, setAdminNotes] = useState<string>(booking.adminNotes || "");
    const [customerPhone, setCustomerPhone] = useState<string>(booking.customerPhone || "");

    const balanceRemaining = Math.max(0, totalPrice - amountPaid);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateTasting(booking.id, {
            scheduledDate: scheduledDate || null,
            scheduledTime: scheduledTime || null,
            peopleCount: Number(peopleCount),
            formula,
            keepGlass,
            locationType,
            address: address || null,
            totalPrice: Number(totalPrice),
            amountPaid: Number(amountPaid),
            paymentStatus,
            paymentMethod,
            adminNotes: adminNotes || null,
            status,
            customerPhone: customerPhone || null,
        });

        setLoading(false);
        if (result.success) {
            onUpdated();
            onClose();
        } else {
            alert("Fout bij opslaan: " + result.error);
        }
    };

    const handleQuickFullPayment = () => {
        setAmountPaid(totalPrice);
        setPaymentStatus("PAID");
    };

    const handleQuickConfirm = () => {
        setStatus("CONFIRMED");
    };

    const handleQuickComplete = () => {
        setStatus("COMPLETED");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border-4 border-black w-full max-w-3xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-brewery-dark text-white p-6 flex justify-between items-start border-b-2 border-black">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black">
                                Proeverij {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}
                            </h2>
                            <span className={`text-xs uppercase font-black px-2.5 py-1 rounded border ${
                                status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                status === 'PENDING' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                status === 'COMPLETED' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                                'bg-rose-100 text-rose-900 border-rose-300'
                            }`}>
                                {status === 'PENDING' ? 'Aanvraag' :
                                 status === 'CONFIRMED' ? 'Ingepland' :
                                 status === 'COMPLETED' ? 'Voltooid' : 'Geannuleerd'}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                            Aangevraagd door <strong className="text-white">{booking.customerName}</strong> op {new Date(booking.createdAt).toLocaleDateString('nl-BE')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
                    {/* Customer Info Box */}
                    <div className="bg-gray-50 border-2 border-black p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 font-bold block uppercase">Klant</span>
                            <span className="font-bold text-base">{booking.customerName}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-bold block uppercase">E-mail</span>
                            <a href={`mailto:${booking.customerEmail}`} className="text-brewery-green font-bold hover:underline">
                                {booking.customerEmail}
                            </a>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-bold block uppercase">Telefoon</span>
                            <input
                                type="text"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="bv. 0491 23 45 67"
                                className="w-full bg-white border border-gray-300 px-2 py-1 text-sm font-semibold mt-1"
                            />
                        </div>
                    </div>

                    {booking.customerMessage && (
                        <div className="bg-amber-50 border-2 border-amber-300 p-4">
                            <span className="text-xs font-black uppercase text-amber-800 block mb-1">Bericht van klant:</span>
                            <p className="text-sm italic text-gray-800">"{booking.customerMessage}"</p>
                        </div>
                    )}

                    {/* Status & Quick Actions */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider block">Status & Snelle Acties</label>
                        <div className="flex flex-wrap gap-2 items-center">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TastingStatusType)}
                                className="border-2 border-black p-2 font-bold text-sm bg-white"
                            >
                                <option value="PENDING">Nieuwe aanvraag (In behandeling)</option>
                                <option value="CONFIRMED">Ingepland & Bevestigd</option>
                                <option value="COMPLETED">Voltooid</option>
                                <option value="CANCELLED">Geannuleerd</option>
                            </select>

                            {status === "PENDING" && (
                                <button
                                    type="button"
                                    onClick={handleQuickConfirm}
                                    className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-700"
                                >
                                    ✓ Bevestig Boeking
                                </button>
                            )}

                            {status === "CONFIRMED" && (
                                <button
                                    type="button"
                                    onClick={handleQuickComplete}
                                    className="px-3 py-2 bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700"
                                >
                                    ✓ Markeer als Voltooid
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date & Time Scheduling */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brewery-green" /> Datum & Tijdstip
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Ingeplande Datum</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                    required
                                />
                                {booking.requestedDate && (
                                    <span className="text-[11px] text-gray-500 mt-1 block">
                                        Oorspronkelijk aangevraagd: {new Date(booking.requestedDate).toLocaleDateString('nl-BE')}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Startuur (bv. 14:00 of 19:30)</label>
                                <input
                                    type="text"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    placeholder="bv. 14:30"
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attendees & Formula */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <Users className="w-4 h-4 text-brewery-green" /> Formule & Personen
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Aantal personen</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={peopleCount}
                                    onChange={(e) => setPeopleCount(parseInt(e.target.value, 10) || 1)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold block mb-1">Formule</label>
                                <select
                                    value={formula}
                                    onChange={(e) => setFormula(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="Basis (4 bieren)">Basis (4 bieren - €20 p.p.)</option>
                                    <option value="Uitgebreid (6 bieren)">Uitgebreid (6 bieren - €25 p.p.)</option>
                                    <option value="Op maat / Custom">Op maat / Custom</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="modalKeepGlass"
                                checked={keepGlass}
                                onChange={(e) => setKeepGlass(e.target.checked)}
                                className="w-5 h-5 accent-brewery-green"
                            />
                            <label htmlFor="modalKeepGlass" className="text-sm font-bold cursor-pointer">
                                Klanten nemen het proefglas mee (+€5 p.p.)
                            </label>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brewery-green" /> Locatie
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Type Locatie</label>
                                <select
                                    value={locationType}
                                    onChange={(e) => setLocationType(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="Brouwerij">In de brouwerij (Wilsele)</option>
                                    <option value="Op verplaatsing">Op verplaatsing</option>
                                </select>
                            </div>
                            {locationType === "Op verplaatsing" && (
                                <div>
                                    <label className="text-xs font-bold block mb-1">Adres van locatie</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Straat, nr, gemeente"
                                        className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financials & Payment Tracking */}
                    <div className="border-2 border-black p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-sm uppercase flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-brewery-green" /> Betaling & Financiën
                            </h3>
                            {balanceRemaining > 0 && (
                                <button
                                    type="button"
                                    onClick={handleQuickFullPayment}
                                    className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded"
                                >
                                    Markeer als Volledig Betaald
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Totaalprijs (&euro;)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={totalPrice}
                                    onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full border-2 border-black p-2.5 font-black text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Reeds Betaald (&euro;)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                                    className="w-full border-2 border-black p-2.5 font-black text-base text-brewery-green"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Openstaand Saldo</label>
                                <div className={`p-2.5 font-black text-base border-2 ${
                                    balanceRemaining === 0 ? 'bg-emerald-100 border-emerald-500 text-emerald-800' :
                                    'bg-rose-100 border-rose-500 text-rose-800'
                                }`}>
                                    &euro;{balanceRemaining.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-xs font-bold block mb-1">Betaalstatus</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value as TastingPaymentStatusType)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="UNPAID">Niet betaald</option>
                                    <option value="PARTIALLY_PAID">Voorschot ontvangen</option>
                                    <option value="PAID">Volledig betaald</option>
                                    <option value="REFUNDED">Terugbetaald</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Betaalmethode</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="PAYCONIQ">Payconiq / QR</option>
                                    <option value="CASH">Contant bij proeverij</option>
                                    <option value="BANK_TRANSFER">Overschrijving / Factuur</option>
                                    <option value="STRIPE">Stripe / Online</option>
                                    <option value="OTHER">Overig</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider block">
                            Interne Notities (brouwerij / personeel)
                        </label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            placeholder="bv. Voorkeur voor zwaardere bieren, vegetarische borrelplank, rondleiding in het Engels..."
                            className="w-full border-2 border-black p-3 text-sm focus:bg-brewery-green/5 outline-none font-medium"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t-2 border-black flex justify-between items-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-black font-bold hover:bg-gray-100 transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-brewery-dark text-white font-black hover:bg-brewery-green transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "Opslaan..." : "Wijzigingen Opslaan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
