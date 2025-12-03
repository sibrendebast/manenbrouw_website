"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Package, Phone } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, Suspense } from "react";
import { useI18n } from "@/lib/i18n-context";

const CHECKOUT_FORM_STORAGE_KEY = "checkoutFormData";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const clearCart = useCartStore((state) => state.clearCart);
    const { t } = useI18n();
    const supportEmail = "info@manenbrouw.be";

    // Clear the cart when the success page loads
    useEffect(() => {
        clearCart();
        if (typeof window !== "undefined") {
            localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
        }
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center flex flex-col items-center">
                    <div className="bg-green-100 p-6 rounded-full mb-6">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                        {t("checkout.success.title")}
                    </h1>
                    <p className="text-gray-600 mb-2 max-w-2xl">
                        {t("checkout.success.message")}
                    </p>
                    <p className="text-gray-600 mb-6">
                        {t("checkout.success.emailConfirmation")}
                    </p>

                    <div className="w-full grid gap-4 text-left">
                        {orderId && (
                            <div className="bg-white border-2 border-black px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{t("checkout.success.orderId")}</p>
                                    <p className="font-mono text-brewery-dark">{orderId}</p>
                                </div>
                                <Package className="h-6 w-6 text-brewery-dark" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="bg-white border-2 border-black p-6">
                        <h2 className="text-xl font-semibold text-brewery-dark mb-4">
                            {t("checkout.success.nextStepsTitle")}
                        </h2>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <Package className="h-5 w-5 text-brewery-dark mt-0.5" />
                                <span>{t("checkout.success.nextStepsShipping")}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-brewery-dark mt-0.5" />
                                <span>{t("checkout.success.nextStepsUpdates")}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-brewery-dark mt-0.5" />
                                <span>{t("checkout.success.nextStepsQuestions")}</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white border-2 border-black p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-brewery-dark">
                            {t("checkout.success.supportTitle")}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {t("checkout.success.supportDescription")}
                        </p>
                        <a
                            href={`mailto:${supportEmail}`}
                            className="inline-flex items-center justify-center border-2 border-black px-4 py-2 text-brewery-dark font-semibold hover:bg-gray-50 transition"
                        >
                            {supportEmail}
                        </a>
                    </section>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black"
                    >
                        {t("cart.continueShopping")}
                    </Link>
                    <Link
                        href="/events"
                        className="bg-white text-brewery-dark font-bold py-3 px-8 hover:bg-gray-100 transition-colors border-2 border-black"
                    >
                        {t("checkout.success.exploreEvents")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white py-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
