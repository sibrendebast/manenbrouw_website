'use client';

import { useState, useRef } from 'react';
import { UserPlus, Building2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { addSubscriberManual } from '@/app/actions/newsletterActions';

export default function AddSubscriberForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isCommercial, setIsCommercial] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        const formData = new FormData(e.currentTarget);
        // Ensure commercial status is captured
        if (isCommercial) {
            formData.set('isCommercial', 'true');
        }

        const res = await addSubscriberManual(formData);

        if (res.success) {
            const statusText = isCommercial ? 'als zakelijke klant' : 'als particulier';
            const actionText = res.isNew ? 'succesvol toegevoegd' : 'bijgewerkt';
            setFeedback({
                type: 'success',
                message: `Abonnee ${res.email} is ${actionText} (${statusText})!`
            });
            formRef.current?.reset();
            setIsCommercial(false);

            // Clear feedback after 4 seconds
            setTimeout(() => {
                setFeedback(null);
            }, 4000);
        } else {
            setFeedback({
                type: 'error',
                message: res.error || 'Er is een fout opgetreden bij het toevoegen.'
            });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="bg-white border-2 border-black p-5 sm:p-6 mb-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brewery-green/20 border border-black text-brewery-dark rounded-none">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-brewery-dark">Abonnee Handmatig Toevoegen</h2>
                        <p className="text-xs text-gray-600">
                            Voeg een nieuw e-mailadres toe aan de maillijst (optioneel met naam en zakelijke status).
                        </p>
                    </div>
                </div>
            </div>

            {feedback && (
                <div
                    className={`mb-4 p-3 border-2 text-sm font-semibold flex items-center gap-2 ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-700 text-emerald-900'
                            : 'bg-red-50 border-red-700 text-red-900'
                    }`}
                >
                    {feedback.type === 'success' ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                    {/* First Name */}
                    <div className="lg:col-span-3">
                        <label htmlFor="manual-firstName" className="block text-xs font-bold text-gray-700 mb-1">
                            Voornaam <span className="text-gray-400 font-normal">(optioneel)</span>
                        </label>
                        <input
                            type="text"
                            id="manual-firstName"
                            name="firstName"
                            placeholder="bijv. Jan"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border-2 border-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brewery-green disabled:bg-gray-100"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="lg:col-span-3">
                        <label htmlFor="manual-lastName" className="block text-xs font-bold text-gray-700 mb-1">
                            Achternaam <span className="text-gray-400 font-normal">(optioneel)</span>
                        </label>
                        <input
                            type="text"
                            id="manual-lastName"
                            name="lastName"
                            placeholder="bijv. Janssens"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border-2 border-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brewery-green disabled:bg-gray-100"
                        />
                    </div>

                    {/* Email */}
                    <div className="lg:col-span-4">
                        <label htmlFor="manual-email" className="block text-xs font-bold text-gray-700 mb-1">
                            E-mailadres <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="manual-email"
                            name="email"
                            required
                            placeholder="klant@voorbeeld.be"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border-2 border-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brewery-green disabled:bg-gray-100"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="lg:col-span-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brewery-dark text-white px-4 py-2 font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-brewery-green transition-all hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Toevoegen...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Toevoegen
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Commercial status toggle */}
                <div className="pt-1">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold select-none p-1.5 border border-gray-200 hover:border-black bg-gray-50 transition-all">
                        <input
                            type="checkbox"
                            name="isCommercial"
                            checked={isCommercial}
                            onChange={e => setIsCommercial(e.target.checked)}
                            disabled={isSubmitting}
                            className="h-4 w-4 rounded accent-emerald-700 cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5 text-gray-800">
                            <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                            Zakelijke klant (horeca, bar, restaurant, winkel)
                        </span>
                    </label>
                </div>
            </form>
        </div>
    );
}
