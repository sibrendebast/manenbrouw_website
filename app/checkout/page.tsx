"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useCartStore } from "@/store/cartStore";
import { placeOrder, calculateBtwBreakdown } from "@/app/actions/checkout";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";

type CheckoutFormValues = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    street: string;
    zip: string;
    city: string;
    newsletter: boolean;
};

const DEFAULT_FORM_VALUES: CheckoutFormValues = {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    zip: "",
    city: "",
    newsletter: false,
};

const CHECKOUT_FORM_STORAGE_KEY = "checkoutFormData";

export default function CheckoutPage() {
    const { items, getTotalPrice } = useCartStore();
    const [shippingMethod, setShippingMethod] = useState("shipment");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [formValues, setFormValues] = useState<CheckoutFormValues>(DEFAULT_FORM_VALUES);
    const { t } = useI18n();

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
        if (typeof window === "undefined") {
            setMounted(true);
            return;
        }

        const stored = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.formValues) {
                    setFormValues((prev) => ({
                        ...prev,
                        ...parsed.formValues,
                    }));
                }
                if (parsed.shippingMethod && typeof parsed.shippingMethod === "string") {
                    setShippingMethod(parsed.shippingMethod);
                }
                if (parsed.paymentMethod && typeof parsed.paymentMethod === "string") {
                    setPaymentMethod(parsed.paymentMethod);
                }
            } catch (storageError) {
                console.error("Failed to parse saved checkout form", storageError);
            }
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === "undefined") return;
        const payload = JSON.stringify({
            formValues,
            shippingMethod,
            paymentMethod,
        });
        localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, payload);
    }, [formValues, shippingMethod, paymentMethod, mounted]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    if (!mounted) return null;

    const subtotal = getTotalPrice();
    const shippingCost = shippingMethod === "shipment" ? 10 : 0;
    
    // Calculate BTW breakdown for products only
    const productItems = items.filter((item: any) => item.itemType === "product");
    const btwBreakdown = calculateBtwBreakdown(productItems.map((item: any) => ({
        price: item.price,
        quantity: item.quantity,
        btwCategory: item.btwCategory || 21
    })));
    
    const total = subtotal + shippingCost;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">{t("checkout.title")}</h1>
                <p className="mb-8">{t("cart.emptyMessage")}</p>
                <Link
                    href="/shop"
                    className="bg-brewery-green text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
                >
                    {t("cart.startShopping")}
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
                <h1 className="text-3xl font-bold text-brewery-dark mb-8">{t("checkout.title")}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Checkout Form */}
                    <div>
                        <form id="checkout-form" action={handleSubmit} className="space-y-6">
                            <div className="bg-white p-6 border-2 border-black space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-brewery-dark">{t("checkout.shippingMethod")}</h2>
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                                        <input
                                            type="radio"
                                            id="shipment"
                                            name="shippingMethod"
                                            value="shipment"
                                            checked={shippingMethod === "shipment"}
                                            onChange={() => setShippingMethod("shipment")}
                                            className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green"
                                        />
                                            <div className="flex-1">
                                                <label htmlFor="shipment" className="text-brewery-dark font-medium block">
                                                    {t("checkout.shipment")}
                                                </label>
                                                <Link
                                                    href="/delivery/home"
                                                    className="text-sm underline text-brewery-green hover:text-brewery-dark"
                                                >
                                                    {t("checkout.learnAboutDelivery")}
                                                </Link>
                                            </div>
                                            <span className="font-semibold text-brewery-dark">€10.00</span>
                                    </div>
                                        <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                                        <input
                                            type="radio"
                                            id="pickup"
                                            name="shippingMethod"
                                            value="pickup"
                                            checked={shippingMethod === "pickup"}
                                            onChange={() => setShippingMethod("pickup")}
                                                className="mr-3 h-4 w-4 text-brewery-green focus:ring-brewery-green mt-1"
                                        />
                                            <div className="flex-1">
                                                <label htmlFor="pickup" className="text-brewery-dark font-medium block">
                                                    {t("checkout.pickup")}
                                                </label>
                                                <Link
                                                    href="/delivery/pickup"
                                                    className="text-sm underline text-brewery-green hover:text-brewery-dark"
                                                >
                                                    {t("checkout.learnAboutPickup")}
                                                </Link>
                                            </div>
                                            <span className="font-semibold text-brewery-dark">{t("checkout.free")}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-2 border-black">
                                <h2 className="text-xl font-semibold mb-4 text-brewery-dark">{t("checkout.customerDetails")}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("checkout.fullName")}
                                        </label>
                                        <input
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            required
                                            value={formValues.customerName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("checkout.email")}
                                        </label>
                                        <input
                                            type="email"
                                            id="customerEmail"
                                            name="customerEmail"
                                            required
                                            value={formValues.customerEmail}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("checkout.phone")}
                                        </label>
                                        <input
                                            type="tel"
                                            id="customerPhone"
                                            name="customerPhone"
                                            required
                                            value={formValues.customerPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {shippingMethod === "shipment" && (
                                <div className="bg-white p-6 border-2 border-black">
                                    <h2 className="text-xl font-semibold mb-4 text-brewery-dark">{t("checkout.shippingAddress")}</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("checkout.street")}
                                            </label>
                                            <input
                                                type="text"
                                                id="street"
                                                name="street"
                                                required
                                                value={formValues.street}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("checkout.zip")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="zip"
                                                    name="zip"
                                                    required
                                                    value={formValues.zip}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("checkout.city")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="city"
                                                    name="city"
                                                    required
                                                    value={formValues.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border-2 border-black focus:ring-brewery-green focus:border-brewery-green"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("checkout.country")}
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
                                    checked={formValues.newsletter}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="newsletter" className="ml-2 block text-sm text-brewery-dark">
                                    {t("checkout.newsletter")}
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
                            <h2 className="text-xl font-bold text-brewery-dark mb-6">{t("cart.orderSummary")}</h2>
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
                                                <p className="text-sm text-gray-500">{t("common.quantity")}: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-brewery-dark">€{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-brewery-dark">
                                    <span>{t("cart.subtotal")}</span>
                                    <span>€{subtotal.toFixed(2)}</span>
                                </div>
                                {btwBreakdown.length > 0 && (
                                    <div className="pl-4 space-y-1 text-sm">
                                        {btwBreakdown.map((btw, index) => (
                                            <div key={index} className="flex justify-between text-gray-600">
                                                <span>BTW {btw.category}%</span>
                                                <span>€{btw.btw.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between text-brewery-dark">
                                    <span>{t("cart.shipping")}</span>
                                    <span>{shippingCost === 0 ? t("checkout.free") : `€${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2 text-brewery-dark">
                                    <span>{t("cart.total")}</span>
                                    <span>€{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 border-2 border-black mt-6">
                                <h2 className="text-xl font-bold text-brewery-dark mb-4">{t("checkout.paymentMethod")}</h2>
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
                                            {t("checkout.creditCard")}
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
                                {isSubmitting ? t("checkout.processing") : `${t("checkout.placeOrder")} - €${total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
