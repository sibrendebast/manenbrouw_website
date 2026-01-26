"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useI18n } from "@/lib/i18n-context";
import { Product } from "@/data/products";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const { t } = useI18n();

    const handleIncrement = () => {
        const stockCount = product.stockCount || 0;
        if (quantity < stockCount) {
            setQuantity((prev) => prev + 1);
        }
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



    // ... inside component ...
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1,
            zIndex: 1,
            scale: 1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1,
            scale: 0.95
        })
    };

    // ...

    const handlePrevImage = (e?: React.MouseEvent | any) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (product.images && product.images.length > 0) {
            setDirection(-1);
            setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
        }
    };

    const handleNextImage = (e?: React.MouseEvent | any) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (product.images && product.images.length > 0) {
            setDirection(1);
            setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
        }
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const imageSrc = (imageError || !product.images || product.images.length === 0 || product.images[0].includes("placehold.co"))
        ? "/logo.png"
        : product.images[currentImageIndex];

    return (
        <div className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full group">
            <div className="relative aspect-square w-full bg-gray-100 touch-pan-y">

                <Link href={`/shop/${product.slug}`} className="block w-full h-full relative z-0">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={currentImageIndex}
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
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold) {
                                    handleNextImage();
                                } else if (swipe > swipeConfidenceThreshold) {
                                    handlePrevImage();
                                }
                            }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <Image
                                src={imageSrc}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                                onError={() => setImageError(true)}
                            />
                        </motion.div>
                    </AnimatePresence>
                </Link>

                {product.images && product.images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full border-2 border-black transition-opacity z-20"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5 text-black" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full border-2 border-black transition-opacity z-20"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5 text-black" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                            {product.images.map((_: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`h-2 w-2 rounded-full border border-black ${idx === currentImageIndex ? 'bg-brewery-green' : 'bg-white'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-600 text-white px-4 py-2 font-bold transform -rotate-12 border-2 border-white">
                            {t("shop.outOfStock")}
                        </span>
                    </div>
                )}
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-brewery-dark">
                        {product.name}
                    </h3>
                    <span className="text-xl font-bold text-brewery-green">
                        €{product.price.toFixed(2)}
                    </span>
                </div>
                <p className="text-sm text-gray-500 font-semibold mb-2">
                    {[product.style, product.volume, product.abv].filter(Boolean).join(" • ")}
                </p>
                {product.inStock && product.stockCount !== undefined && (
                    <p className="text-xs text-gray-600 mb-4">
                        {product.stockCount} {t("shop.inStock")}
                    </p>
                )}

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
                                    className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity >= (product.stockCount || 0)}
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
                                    <>✓ {t("common.success")}!</>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-4 w-4" /> {t("shop.addToCart")}
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
                            {t("shop.outOfStock")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
