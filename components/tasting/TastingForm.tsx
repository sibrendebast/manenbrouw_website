"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { sendTastingRequest } from "@/app/actions/bookingActions";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TastingMessages = {
    form: {
        title: string;
        name: string;
        email: string;
        date: string;
        people: string;
        formula: string;
        formula4: string;
        formula6: string;
        keepGlass: string;
        location: string;
        atBrewery: string;
        otherLocation: string;
        message: string;
        submit: string;
        success: string;
        successDetail: string;
        error: string;
        peoplePlaceholder: string;
        messagePlaceholder: string;
        namePlaceholder: string;
        emailPlaceholder: string;
    };
};

export default function TastingForm() {
    const { t, messages } = useI18n();
    const tasting = messages.tasting as TastingMessages | undefined;
    
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!tasting) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        if (!tasting) return;
        
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await sendTastingRequest(formData);

        if (result.success) {
            setIsSuccess(true);
            setIsPending(false);
        } else {
            setError(result.error || tasting.form.error);
            setIsPending(false);
        }
    }

    if (isSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="bg-brewery-green/10 p-6 inline-block rounded-full mb-6">
                    <CheckCircle2 className="h-16 w-16 text-brewery-green" />
                </div>
                <h3 className="text-3xl font-bold mb-4">{tasting.form.success}</h3>
                <p className="text-gray-600 text-lg">{tasting.form.successDetail}</p>
                <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 px-8 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                    {t("common.close")}
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-black tracking-wider">{tasting.form.name} *</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder={tasting.form.namePlaceholder}
                        className="w-full p-4 border-2 border-black focus:bg-brewery-green/5 outline-none transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-black tracking-wider">{tasting.form.email} *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder={tasting.form.emailPlaceholder}
                        className="w-full p-4 border-2 border-black focus:bg-brewery-green/5 outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-black tracking-wider">{tasting.form.date} *</label>
                    <input
                        type="date"
                        name="date"
                        required
                        className="w-full p-4 border-2 border-black focus:bg-brewery-green/5 outline-none transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-black tracking-wider">{tasting.form.people} *</label>
                    <input
                        type="number"
                        name="people"
                        min="1"
                        required
                        placeholder={tasting.form.peoplePlaceholder}
                        className="w-full p-4 border-2 border-black focus:bg-brewery-green/5 outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <label className="text-sm font-black tracking-wider block mb-2">{tasting.form.formula} *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="border-2 border-black p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-brewery-green has-[:checked]:text-white group">
                        <input type="radio" name="formula" value="Basis (4 bieren)" required className="accent-black h-5 w-5" />
                        <span className="font-bold">{tasting.form.formula4}</span>
                    </label>
                    <label className="border-2 border-black p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-brewery-green has-[:checked]:text-white group">
                        <input type="radio" name="formula" value="Uitgebreid (6 bieren)" required className="accent-black h-5 w-5" />
                        <span className="font-bold">{tasting.form.formula6}</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-black tracking-wider block mb-2">{tasting.form.location} *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="border-2 border-black p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-brewery-green has-[:checked]:text-white group">
                        <input type="radio" name="location" value="Brouwerij" required className="accent-black h-5 w-5" />
                        <span className="font-bold">{tasting.form.atBrewery}</span>
                    </label>
                    <label className="border-2 border-black p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-brewery-green has-[:checked]:text-white group">
                        <input type="radio" name="location" value="Op verplaatsing" required className="accent-black h-5 w-5" />
                        <span className="font-bold">{tasting.form.otherLocation}</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <input
                    type="checkbox"
                    id="keepGlass"
                    name="keepGlass"
                    value="true"
                    className="h-6 w-6 border-2 border-black accent-brewery-green cursor-pointer"
                />
                <label htmlFor="keepGlass" className="font-bold cursor-pointer">{tasting.form.keepGlass}</label>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black tracking-wider">{tasting.form.message}</label>
                <textarea
                    name="message"
                    rows={4}
                    className="w-full p-4 border-2 border-black focus:bg-brewery-green/5 outline-none transition-colors"
                    placeholder={tasting.form.messagePlaceholder}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 font-bold"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={isPending}
                className="w-full py-5 bg-black text-white font-black text-xl tracking-widest hover:bg-brewery-green transition-all disabled:bg-gray-400 flex items-center justify-center gap-3 relative top-0 hover:-top-1 hover:-left-1 active:top-0 active:left-0"
            >
                {isPending ? (
                    <>
                        <Loader2 className="animate-spin h-6 w-6" />
                        {t("common.loading")}
                    </>
                ) : (
                    tasting.form.submit
                )}
            </button>
        </form>
    );
}
