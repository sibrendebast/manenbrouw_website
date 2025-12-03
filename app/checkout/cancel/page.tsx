"use client";

import Link from "next/link";
import { Mail, RotateCcw, ShieldAlert, XCircle } from "lucide-react";
import { Suspense } from "react";
import { useI18n } from "@/lib/i18n-context";

function CancelContent() {
    const { t } = useI18n();
    const supportEmail = "info@manenbrouw.be";

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <div className="max-w-3xl mx-auto space-y-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 p-6 rounded-full mb-6">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                        {t("checkout.cancel.title")}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mb-6">
                        {t("checkout.cancel.message")}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 text-left">
                    <section className="bg-white border-2 border-black p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <RotateCcw className="h-6 w-6 text-brewery-dark" />
                            <h2 className="text-xl font-semibold text-brewery-dark">
                                {t("checkout.cancel.retryTitle")}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t("checkout.cancel.retryDescription")}
                        </p>
                        <Link
                            href="/checkout"
                            className="inline-flex items-center justify-center bg-brewery-green text-white font-semibold px-5 py-2 border-2 border-black hover:bg-opacity-90 transition"
                        >
                            {t("checkout.cancel.tryAgain")}
                        </Link>
                    </section>

                    <section className="bg-white border-2 border-black p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-6 w-6 text-brewery-dark" />
                            <h2 className="text-xl font-semibold text-brewery-dark">
                                {t("checkout.cancel.helpTitle")}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t("checkout.cancel.helpDescription")}
                        </p>
                        <a
                            href={`mailto:${supportEmail}`}
                            className="inline-flex items-center gap-2 text-brewery-dark font-semibold border-2 border-black px-4 py-2 hover:bg-gray-50 transition"
                        >
                            <Mail className="h-4 w-4" />
                            {supportEmail}
                        </a>
                    </section>
                </div>

                <div className="text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center bg-white text-brewery-dark font-bold py-3 px-8 hover:bg-gray-100 transition-colors border-2 border-black"
                    >
                        {t("cart.continueShopping")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CancelContent />
        </Suspense>
    );
}
