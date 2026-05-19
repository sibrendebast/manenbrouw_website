"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { unsubscribeByEmail } from "@/app/actions/newsletterActions";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setErrorMsg("");

        try {
            const res = await unsubscribeByEmail(email);
            if (res.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(res.error || "Er is een fout opgetreden bij het uitschrijven.");
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg("Er is een netwerkfout opgetreden. Probeer het later opnieuw.");
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Succesvol Uitgeschreven</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Je e-mailadres <strong>{email}</strong> is succesvol verwijderd uit onze mailinglijst. Je zult geen nieuwsbrieven meer ontvangen.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/shop"
                        className="inline-block w-full bg-brewery-dark text-white font-bold py-3 px-6 hover:bg-brewery-green transition-colors"
                    >
                        Naar de Webshop
                    </Link>
                    <br />
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brewery-dark mt-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Terug naar startpagina
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-4">
                    <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Nieuwsbrief Uitschrijven</h2>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                    Vul hieronder je e-mailadres in om je af te melden voor de Man & Brouw nieuwsbrief.
                </p>
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="text-sm">{errorMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mailadres
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="je@voorbeeld.be"
                        className="w-full border-2 border-black p-3 text-black focus:outline-none focus:border-brewery-green"
                        disabled={status === 'loading'}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="w-full bg-brewery-dark text-white font-bold py-3 px-6 hover:bg-brewery-green transition-colors disabled:opacity-50"
                >
                    {status === 'loading' ? "Bezig met uitschrijven..." : "Meld mij af"}
                </button>
            </form>

            <div className="text-center mt-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brewery-dark"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Terug naar startpagina
                </Link>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen bg-[#56c99b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img
                    src="https://www.manenbrouw.be/logo.png"
                    alt="Man & Brouw Logo"
                    className="mx-auto h-16 w-auto mb-6"
                />
            </div>

            <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 border-4 border-black sm:px-10 shadow-lg">
                    <Suspense fallback={<div className="text-center py-8">Laden...</div>}>
                        <UnsubscribeContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
