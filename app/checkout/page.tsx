"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { placeOrder } from "@/app/actions/checkout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [shippingMethod, setShippingMethod] = useState("shipment");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Helper function to safely get images array
    const getProductImages = (item: any): string[] => {
        if (!item.images) return [];
        if (typeof item.images === 'string') {
            try {
                return JSON.parse(item.images);
            } catch {
                return [item.images];
            }
        }
        if (Array.isArray(item.images)) return item.images;
        return [];
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const subtotal = getTotalPrice();
    const shippingCost = shippingMethod === "shipment" ? 10 : 0;
    const total = subtotal + shippingCost;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>
                <p className="mb-8">Your cart is empty.</p>
                <Link
                    href="/shop"
                    className="bg-brewery-green text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
                >
                    Return to Shop
                </Link>
            </div>
        );
    }

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError("");

        try {
            // Add shipping method to formData
            formData.append("shippingMethod", shippingMethod);

            // First create the order in pending_payment status
            const result = await placeOrder(formData, items);

            if (!result.success) {
                setError(result.error || "Failed to create order");
                setIsSubmitting(false);
                return;
            }

            // Create Stripe checkout session
            const response = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: result.orderId,
                    cartItems: items,
                    shippingMethod,
                    totalAmount: total,
                    customerEmail: formData.get("customerEmail"),
                    customerName: formData.get("customerName"),
                    paymentMethod,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create checkout session");
                setIsSubmitting(false);
                return;
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setError("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-brewery-dark mb-8">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Checkout Form */}
                    <div>
                        <form id="checkout-form" action={handleSubmit} className="space-y-6">
                            <div className="bg-white p-6 border-2 border-black">
                                <h2 className="text-xl font-semibold mb-4 text-brewery-dark">Shipping Method</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="shipment"
                                            name="shippingMethod"
                                            value="shipment"
                                            checked={shippingMethod === "shipment"}
                                            onChange={() => setShippingMethod("shipment")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                        <label htmlFor="shipment" className="flex-grow text-brewery-dark">
                                            Shipment (Belgium only)
                                        </label>
                                        <span className="font-semibold text-brewery-dark">€10.00</span>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="pickup"
                                            name="shippingMethod"
                                            value="pickup"
                                            checked={shippingMethod === "pickup"}
                                            onChange={() => setShippingMethod("pickup")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                        <label htmlFor="pickup" className="flex-grow text-brewery-dark">
                                            Pick up at brewery
                                        </label>
                                        <span className="font-semibold text-brewery-dark">Free</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-2 border-black">
                                <h2 className="text-xl font-semibold mb-4 text-brewery-dark">Customer Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            required
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="customerEmail"
                                            name="customerEmail"
                                            required
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="customerPhone"
                                            name="customerPhone"
                                            required
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {shippingMethod === "shipment" && (
                                <div className="bg-white p-6 border-2 border-black">
                                    <h2 className="text-xl font-semibold mb-4 text-brewery-dark">Shipping Address</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                id="street"
                                                name="street"
                                                required
                                                className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                                                    ZIP Code
                                                </label>
                                                <input
                                                    type="text"
                                                    id="zip"
                                                    name="zip"
                                                    required
                                                    className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    id="city"
                                                    name="city"
                                                    required
                                                    className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                value="Belgium"
                                                readOnly
                                                className="w-full px-4 py-2 border-2 border-black bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="newsletter"
                                    name="newsletter"
                                    className="h-4 w-4 text-brewery-green focus:ring-brewery-green border-gray-300 rounded"
                                />
                                <label htmlFor="newsletter" className="ml-2 block text-sm text-brewery-dark">
                                    Sign up for our newsletter
                                </label>
                            </div>

                            {error && (
                                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white p-8 sticky top-24 border-2 border-black">
                            <h2 className="text-xl font-bold text-brewery-dark mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center">
                                            <div className="relative w-16 h-16 mr-4 bg-gray-100 border border-black overflow-hidden flex-shrink-0">
                                                {item.itemType === "product" ? (
                                                    <Image
                                                        src={(() => {
                                                            const images = getProductImages(item);
                                                            return (!images || images.length === 0 || images[0].includes("placehold.co")) ? "/logo.png" : images[0];
                                                        })()}
                                                        alt={(item as any).name || (item as any).title}
                                                        fill
                                                        className="object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.srcset = "/logo.png";
                                                            target.src = "/logo.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-brewery-green/10 border-2 border-brewery-green flex items-center justify-center">
                                                        <span className="text-2xl">🎟️</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-brewery-dark">{item.itemType === "product" ? item.name : item.title}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-brewery-dark">€{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-brewery-dark">
                                    <span>Subtotal</span>
                                    <span>€{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-brewery-dark">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? "Free" : `€${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2 text-brewery-dark">
                                    <span>Total</span>
                                    <span>€{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-2 border-black mt-6">
                                <h2 className="text-xl font-bold text-brewery-dark mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="card"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                        <label htmlFor="card" className="flex-grow text-brewery-dark">
                                            Credit Card
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="bancontact"
                                            name="paymentMethod"
                                            value="bancontact"
                                            checked={paymentMethod === "bancontact"}
                                            onChange={() => setPaymentMethod("bancontact")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                        <label htmlFor="bancontact" className="flex-grow text-brewery-dark">
                                            Bancontact
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="payconiq"
                                            name="paymentMethod"
                                            value="payconiq"
                                            checked={paymentMethod === "payconiq"}
                                            onChange={() => setPaymentMethod("payconiq")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                        <label htmlFor="payconiq" className="flex-grow text-brewery-dark">
                                            Payconiq
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isSubmitting}
                                className="w-full bg-brewery-green text-white font-bold py-4 hover:bg-opacity-90 transition-colors disabled:opacity-50 border-2 border-black shadow-lg mt-6"
                            >
                                {isSubmitting ? "Processing..." : `Place Order - €${total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
