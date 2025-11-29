"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const sessionId = searchParams.get("session_id");

    return (
        <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">
                Thank you for your order. Your payment has been processed successfully.
            </p>
            <p className="text-gray-600 mb-8">
                We will send you a confirmation email shortly.
            </p>
            {orderId && (
                <p className="text-sm text-gray-500 mb-8">
                    Order ID: <span className="font-mono">{orderId}</span>
                </p>
            )}
            <Link
                href="/shop"
                className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black"
            >
                Continue Shopping
            </Link>
        </div>
    );
}
