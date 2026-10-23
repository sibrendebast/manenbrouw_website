"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";
import PageHeader from "@/components/ui/PageHeader";
import { validateCartStock, type CartStockIssue } from "@/app/actions/checkout";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
        useCartStore();
    const [mounted, setMounted] = useState(false);
    const [stockIssues, setStockIssues] = useState<CartStockIssue[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const { t, locale } = useI18n();

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

    useEffect(() => {
        if (!mounted || items.length === 0) {
            setStockIssues([]);
            return;
        }

        let cancelled = false;
        setIsValidating(true);
        validateCartStock(items, locale)
            .then((res) => {
                if (!cancelled) {
                    setStockIssues(res.issues);
                }
            })
            .catch((err) => {
                console.error("Cart stock validation error:", err);
            })
            .finally(() => {
                if (!cancelled) {
                    setIsValidating(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [items, locale, mounted]);

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white pb-16">
                <PageHeader 
                    title={t("cart.title")} 
                    subtitle={t("cart.empty")}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-6 border-2 border-black">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-8 max-w-md">
                        {t("cart.emptyMessage")}
                    </p>
                    <Link
                        href="/shop"
                        className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black hover:translate-x-1 hover:translate-y-1"
                    >
                        {t("cart.startShopping")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-16">
            <PageHeader 
                title={t("cart.title")}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item: any) => {
                            const issue = stockIssues.find((i) => i.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`flex flex-col sm:flex-row items-center gap-6 p-6 border-2 ${
                                        issue ? "border-red-500 bg-red-50/40" : "border-black"
                                    } shadow-sm`}
                                >
                                    {item.itemType === "product" && (
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-gray-100 border border-black">
                                            <Image
                                                src={(() => {
                                                    const images = getProductImages(item);
                                                    return (!images || images.length === 0 || images[0].includes("placehold.co")) ? "/logo.png" : images[0];
                                                })()}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.srcset = "/logo.png";
                                                    target.src = "/logo.png";
                                                }}
                                            />
                                        </div>
                                    )}
                                    {item.itemType === "ticket" && (
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-brewery-green/10 border-2 border-brewery-green flex items-center justify-center">
                                            <span className="text-4xl">🎟️</span>
                                        </div>
                                    )}
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-brewery-dark">
                                            {item.itemType === "product" ? item.name : item.title}
                                        </h3>
                                        {item.itemType === "product" && item.style && <p className="text-sm text-gray-500">{item.style}</p>}
                                        {item.itemType === "ticket" && (
                                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                                                <p>{new Date(item.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                })}</p>
                                                <p>{item.location}</p>
                                            </div>
                                        )}
                                        <p className="text-brewery-green font-bold mt-1">
                                            €{item.price.toFixed(2)}
                                        </p>
                                        {issue && (
                                            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 border border-red-300 w-fit">
                                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>{issue.message}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border-2 border-black">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors border-r-2 border-black"
                                            >
                                                <Minus className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-gray-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors border-l-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={
                                                    (item.itemType === "product" && item.stockCount !== undefined && item.quantity >= item.stockCount) ||
                                                    (item.itemType === "ticket" && item.capacity !== undefined && item.quantity >= (item.capacity - (item.ticketsSold || 0) + item.quantity))
                                                }
                                            >
                                                <Plus className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-8 sticky top-24 border-2 border-black">
                            <h2 className="text-xl font-bold text-brewery-dark mb-6">
                                {t("cart.orderSummary")}
                            </h2>

                            {stockIssues.length > 0 && (
                                <div className="p-4 bg-red-50 border-2 border-red-500 text-red-800 text-sm mb-6">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                                        {t("cart.stockIssuesTitle")}
                                    </p>
                                    <p className="mt-1 text-xs text-red-700">
                                        {t("cart.stockIssuesMessage")}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("cart.subtotal")}</span>
                                    <span>€{getTotalPrice().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("cart.shipping")}</span>
                                    <span>{t("cart.calculatedAtCheckout")}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-brewery-dark">
                                    <span>{t("cart.total")}</span>
                                    <span>€{getTotalPrice().toFixed(2)}</span>
                                </div>
                            </div>
                            {stockIssues.length > 0 ? (
                                <button
                                    disabled
                                    className="block w-full bg-gray-400 text-white font-bold py-4 text-center cursor-not-allowed border-2 border-gray-500 opacity-60"
                                >
                                    {t("cart.cannotProceed")}
                                </button>
                            ) : (
                                <Link
                                    href="/checkout"
                                    className="block w-full bg-brewery-dark text-white font-bold py-4 text-center hover:bg-opacity-90 transition-colors border-2 border-black"
                                >
                                    {t("cart.proceedToCheckout")}
                                </Link>
                            )}
                            <Link
                                href="/shop"
                                className="block text-center mt-4 text-gray-500 hover:text-brewery-green transition-colors text-sm"
                            >
                                {t("cart.continueShopping")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
