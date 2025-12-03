"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, Suspense } from "react";
import { useI18n } from "@/lib/i18n-context";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const sessionId = searchParams.get("session_id");
    const clearCart = useCartStore((state) => state.clearCart);
    const { t } = useI18n();

    // Clear the cart when the success page loads
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                {t("checkout.success.title")}
            </h1>
            <p className="text-gray-600 mb-4">
                {t("checkout.success.message")}
            </p>
            <p className="text-gray-600 mb-8">
                {t("checkout.success.emailConfirmation")}
            </p>
            {orderId && (
                <p className="text-sm text-gray-500 mb-8">
                    {t("checkout.success.orderId")}: <span className="font-mono">{orderId}</span>
                </p>
            )}
            <Link
                href="/shop"
                className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black"
            >
                {t("cart.continueShopping")}
            </Link>
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
