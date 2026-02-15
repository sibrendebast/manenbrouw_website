"use client";

import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, ArrowLeft, Check, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";

export default function ProductDetails({ product }: { product: any }) {
    const [mounted, setMounted] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        setMounted(true);
    }, []);

    const addItem = useCartStore((state) => state.addItem);
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [direction, setDirection] = useState(0);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1,
            zIndex: 1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: 0,
            opacity: 1,
            scale: 0.95
        })
    };

    useEffect(() => {
        if (product?.images && product.images.length > 0) {
            // Set the first image as selected, or fallback if empty
            const firstImage = (!product.images || product.images.length === 0 || product.images[0].includes("placehold.co")) ? "/logo.png" : product.images[0];
            setSelectedImage(firstImage);
        } else {
            setSelectedImage("/logo.png");
        }
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handlePrevImage = () => {
        if (!product?.images || product.images.length <= 1) return;
        setDirection(-1);
        const currentIndex = product.images.indexOf(selectedImage);
        const newIndex = currentIndex > 0 ? currentIndex - 1 : product.images.length - 1;
        setSelectedImage(product.images[newIndex]);
    };

    const handleNextImage = () => {
        if (!product?.images || product.images.length <= 1) return;
        setDirection(1);
        const currentIndex = product.images.indexOf(selectedImage);
        const newIndex = currentIndex < product.images.length - 1 ? currentIndex + 1 : 0;
        setSelectedImage(product.images[newIndex]);
    };

    const handleThumbnailClick = (img: string) => {
        if (!product?.images) return;
        const currentIndex = product.images.indexOf(selectedImage);
        const newIndex = product.images.indexOf(img);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setSelectedImage(img);
    };

    if (!mounted) return null;

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">{t("productDetails.notFoundTitle")}</h1>
                <Link
                    href="/shop"
                    className="text-brewery-green hover:underline font-bold"
                >
                    {t("productDetails.backToShop")}
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
                    <ArrowLeft className="h-4 w-4 mr-2" /> {t("productDetails.backToShop")}
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square overflow-hidden bg-gray-100 border-2 border-black group">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                {selectedImage && (
                                    <motion.div
                                        key={selectedImage}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "tween", ease: "easeInOut", duration: 0.3 },
                                            opacity: { duration: 0.2 },
                                            scale: { duration: 0.3 }
                                        }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <Image
                                            src={selectedImage}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.srcset = "/logo.png";
                                                target.src = "/logo.png";
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 border-2 border-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-black" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 border-2 border-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-6 w-6 text-black" />
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {product.images.map((img: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handleThumbnailClick(img)}
                                        className={`relative aspect-square border-2 ${selectedImage === img ? 'border-brewery-green' : 'border-transparent hover:border-gray-300'} transition-all`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl font-bold text-brewery-dark mb-2">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-6">
                            {product.style && (
                                <span className="bg-brewery-green text-white px-3 py-1 text-sm font-bold border-2 border-black">
                                    {product.style}
                                </span>
                            )}
                            {product.abv && (
                                <span className="text-gray-600 font-semibold">{product.abv}</span>
                            )}
                            {product.volume && (
                                <span className="text-gray-600 font-semibold">
                                    {product.volume}
                                </span>
                            )}
                        </div>

                        <div className="mb-8">
                            <p className="text-3xl font-bold text-brewery-green mb-2">
                                €{product.price.toFixed(2)}
                            </p>
                            {product.inStock && product.stockCount !== undefined && (
                                <p className="text-sm text-gray-600 font-medium">
                                    {product.stockCount} {t("shop.inStock")}
                                </p>
                            )}
                        </div>

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
                                    onClick={() => {
                                        const stockCount = product.stockCount || 0;
                                        if (quantity < stockCount) {
                                            setQuantity(quantity + 1);
                                        }
                                    }}
                                    className="p-4 hover:bg-gray-100 transition-colors border-l-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!product.inStock || (product.stockCount !== undefined && quantity >= product.stockCount)}
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
                                            <Check className="h-6 w-6 mr-2" /> {t("productDetails.addedToCart")}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-6 w-6 mr-2" /> {t("shop.addToCart")}
                                        </>
                                    )
                                ) : (
                                    t("shop.outOfStock")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
