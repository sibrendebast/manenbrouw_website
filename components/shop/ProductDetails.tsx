"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, ArrowLeft, Check, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProductDetails({ product }: { product: any }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addItem = useCartStore((state) => state.addItem);
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addItem(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    if (!mounted) return null;

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                <Link
                    href="/shop"
                    className="text-brewery-green hover:underline font-bold"
                >
                    Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/shop"
                    className="inline-flex items-center text-gray-500 hover:text-brewery-green mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 border-2 border-black">
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl font-bold text-brewery-dark mb-2">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-brewery-green text-white px-3 py-1 text-sm font-bold border-2 border-black">
                                {product.style}
                            </span>
                            <span className="text-gray-600 font-semibold">{product.abv}</span>
                            <span className="text-gray-600 font-semibold">
                                {product.volume}
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-brewery-green mb-8">
                            €{product.price.toFixed(2)}
                        </p>

                        <div className="prose prose-lg text-gray-600 mb-10">
                            <p>{product.description}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center border-2 border-black w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-4 hover:bg-gray-100 transition-colors border-r-2 border-black"
                                    disabled={!product.inStock}
                                >
                                    <Minus className="h-5 w-5 text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-bold text-xl text-gray-800">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-4 hover:bg-gray-100 transition-colors border-l-2 border-black"
                                    disabled={!product.inStock}
                                >
                                    <Plus className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                                className={`flex-grow md:flex-grow-0 flex items-center justify-center px-8 py-4 font-bold text-lg transition-all transform active:scale-95 border-2 border-black ${product.inStock
                                    ? isAdded
                                        ? "bg-green-600 text-white"
                                        : "bg-brewery-dark text-white hover:bg-opacity-90"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {product.inStock ? (
                                    isAdded ? (
                                        <>
                                            <Check className="h-6 w-6 mr-2" /> Added to Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-6 w-6 mr-2" /> Add to Cart
                                        </>
                                    )
                                ) : (
                                    "Out of Stock"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
