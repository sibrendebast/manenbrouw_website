"use client";

import { useState } from "react";
import { X, Calendar, Users, MapPin, DollarSign, Plus } from "lucide-react";
import { createManualTasting } from "@/app/actions/tastingActions";
import { calculateEstimatedPrice, TastingStatusType, TastingPaymentStatusType } from "@/lib/tastingUtils";

interface NewTastingModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export default function NewTastingModal({ onClose, onCreated }: NewTastingModalProps) {
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduledTime, setScheduledTime] = useState("14:30");
    const [peopleCount, setPeopleCount] = useState(10);
    const [formula, setFormula] = useState("Basis (4 bieren)");
    const [keepGlass, setKeepGlass] = useState(false);
    const [locationType, setLocationType] = useState("Brouwerij");
    const [address, setAddress] = useState("");
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("PAYCONIQ");
    const [adminNotes, setAdminNotes] = useState("");
    const [status, setStatus] = useState<TastingStatusType>("CONFIRMED");

    // Automatically calculate suggested price
    const suggestedPrice = calculateEstimatedPrice(formula, peopleCount, keepGlass);
    const [customPrice, setCustomPrice] = useState<number | null>(null);
    const effectivePrice = customPrice !== null ? customPrice : suggestedPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createManualTasting({
            customerName,
            customerEmail,
            customerPhone: customerPhone || undefined,
            scheduledDate,
            scheduledTime: scheduledTime || undefined,
            peopleCount: Number(peopleCount),
            formula,
            keepGlass,
            locationType,
            address: address || undefined,
            totalPrice: effectivePrice,
            amountPaid: Number(amountPaid),
            paymentMethod,
            adminNotes: adminNotes || undefined,
            status,
        });

        setLoading(false);
        if (result.success) {
            onCreated();
            onClose();
        } else {
            alert("Fout bij aanmaken: " + result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border-4 border-black w-full max-w-3xl my-8 relative shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-brewery-dark text-white p-6 flex justify-between items-center border-b-2 border-black">
                    <div className="flex items-center gap-3">
                        <Plus className="w-6 h-6 text-brewery-green" />
                        <h2 className="text-2xl font-black">Nieuwe Proeverij Boeking</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
                    {/* Customer details */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase">Klantgegevens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Naam *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="bv. Peter Vandamme"
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">E-mailadres *</label>
                                <input
                                    type="email"
                                    required
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="bv. peter@gmail.com"
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Telefoonnummer</label>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="bv. 0495 12 34 56"
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date, Time & Status */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brewery-green" /> Datum, Uur & Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Datum *</label>
                                <input
                                    type="date"
                                    required
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Startuur (bv. 14:00)</label>
                                <input
                                    type="text"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    placeholder="bv. 14:30"
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Boekingsstatus</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TastingStatusType)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="CONFIRMED">Ingepland & Bevestigd</option>
                                    <option value="PENDING">Nieuwe aanvraag (In optie)</option>
                                    <option value="COMPLETED">Reeds voltooid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* People & Formula */}
                    <div className="border-2 border-black p-4 space-y-4">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <Users className="w-4 h-4 text-brewery-green" /> Formule & Personen
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Aantal personen *</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={peopleCount}
                                    onChange={(e) => setPeopleCount(parseInt(e.target.value, 10) || 1)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm"
                                />
                            </div>
                            <div>
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

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="newKeepGlass"
                                checked={keepGlass}
                                onChange={(e) => setKeepGlass(e.target.checked)}
                                className="w-5 h-5 accent-brewery-green"
                            />
                            <label htmlFor="newKeepGlass" className="text-sm font-bold cursor-pointer">
                                Inclusief proefglas als aandenken (+€5 p.p.)
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

                    {/* Pricing & Initial Payment */}
                    <div className="border-2 border-black p-4 space-y-4 bg-gray-50">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-brewery-green" /> Prijs & Betaling
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">
                                    Totaalprijs (&euro;) <span className="text-gray-500 font-normal">(berekend: €{suggestedPrice})</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={effectivePrice}
                                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
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
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Betaalmethode</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full border-2 border-black p-2.5 font-bold text-sm bg-white"
                                >
                                    <option value="PAYCONIQ">Payconiq / QR</option>
                                    <option value="CASH">Contant ter plaatse</option>
                                    <option value="BANK_TRANSFER">Overschrijving / Factuur</option>
                                    <option value="STRIPE">Stripe / Online</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider block">
                            Interne Notities
                        </label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={2}
                            placeholder="Notities over afspraken, bieren, hapjes..."
                            className="w-full border-2 border-black p-3 text-sm focus:bg-brewery-green/5 outline-none font-medium"
                        />
                    </div>

                    {/* Actions */}
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
                            {loading ? "Aanmaken..." : "Boeking Aanmaken"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
