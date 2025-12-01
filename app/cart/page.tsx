"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
        useCartStore();
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

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-brewery-dark mb-4">
                    Your cart is empty
                </h1>
                <p className="text-gray-600 mb-8">
                    Looks like you haven't added any beers yet.
                </p>
                <Link
                    href="/shop"
                    className="bg-brewery-green text-white font-bold py-3 px-8 hover:bg-opacity-90 transition-colors border-2 border-black"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-brewery-dark mb-8">Your Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-black shadow-sm"
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
                                            className="p-2 hover:bg-gray-100 transition-colors border-l-2 border-black"
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
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-8 sticky top-24 border-2 border-black">
                            <h2 className="text-xl font-bold text-brewery-dark mb-6">
                                Order Summary
                            </h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>€{getTotalPrice().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-brewery-dark">
                                    <span>Total</span>
                                    <span>€{getTotalPrice().toFixed(2)}</span>
                                </div>
                            </div>
                            <Link
                                href="/checkout"
                                className="block w-full bg-brewery-dark text-white font-bold py-4 text-center hover:bg-opacity-90 transition-colors shadow-lg border-2 border-black"
                            >
                                Proceed to Checkout
                            </Link>
                            <Link
                                href="/shop"
                                className="block text-center mt-4 text-gray-500 hover:text-brewery-green transition-colors text-sm"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
