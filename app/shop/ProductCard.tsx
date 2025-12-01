"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/data/products"; // Assuming this type exists, or I can define it locally if needed

// We might need to adjust the import path for Product depending on where it's defined.
// Based on cartStore.ts, it imports from "@/data/products". Let's assume that's correct for now.
// If not, I'll define a local interface matching the product structure.

interface ProductCardProps {
    product: any; // Using any for now to avoid type issues if Product isn't exactly what I think, but ideally should be Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const handleIncrement = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleDecrement = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const handleAddToCart = () => {
        addItem(product, quantity);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    const imageSrc = (imageError || !product.images || product.images.length === 0 || product.images[0].includes("placehold.co"))
        ? "/logo.png"
        : product.images[0];

    return (
        <div className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
            <Link href={`/shop/${product.slug}`} className="relative aspect-square w-full bg-gray-100">
                <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                />
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 font-bold transform -rotate-12 border-2 border-white">
                            SOLD OUT
                        </span>
                    </div>
                )}
            </Link>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-brewery-dark">
                        {product.name}
                    </h3>
                    <span className="text-xl font-bold text-brewery-green">
                        €{product.price.toFixed(2)}
                    </span>
                </div>
                <p className="text-sm text-gray-500 font-semibold mb-4">
                    {product.style} • {product.volume} • {product.abv}
                </p>

                {/* Description removed as per request */}

                <div className="mt-auto space-y-4">

                    {product.inStock ? (
                        <div className="flex flex-row gap-2 items-center">
                            <div className="flex items-center justify-between border-2 border-black h-11 flex-shrink-0">
                                <button
                                    onClick={handleDecrement}
                                    className="p-1 hover:bg-gray-100 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4 text-brewery-green" />
                                </button>
                                <span className="font-bold text-lg w-8 text-center text-black">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="p-1 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="h-4 w-4 text-brewery-green" />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`flex-1 flex items-center justify-center border-2 border-black font-bold h-11 px-4 transition-all flex-shrink-0 ${isAdded
                                    ? 'bg-green-500 text-white'
                                    : 'bg-brewery-green text-white hover:bg-opacity-90'
                                    }`}
                            >
                                {isAdded ? (
                                    <>✓ Added!</>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                                    </>
                                )}
                            </button>
                            <Link
                                href={`/shop/${product.slug}`}
                                className="flex items-center justify-center bg-white text-brewery-dark font-bold h-11 px-4 border-2 border-black hover:bg-gray-100 transition-colors"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 border-2 border-gray-400 cursor-not-allowed"
                        >
                            Out of Stock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
