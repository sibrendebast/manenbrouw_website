"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

function CancelContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    return (
        <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-100 p-6 rounded-full mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-8">
                Your payment was cancelled. Your order has not been placed.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/checkout"
                    className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black"
                >
                    Try Again
                </Link>
                <Link
                    href="/shop"
                    className="bg-white text-brewery-dark font-bold py-3 px-8 hover:bg-gray-100 transition-colors border-2 border-black"
                >
                    Continue Shopping
                </Link>
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
