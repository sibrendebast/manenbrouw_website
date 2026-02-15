"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import ProductCard from "./ProductCard";

export default function ShopContent({ products }: { products: any[] }) {
    const { t } = useI18n();
    const [activeCategory, setActiveCategory] = useState("ALL");

    const filteredProducts = products
        .filter((product) =>
            activeCategory === "ALL" ? true : product.category === activeCategory
        )
        .sort((a, b) => {
            if (activeCategory === "ALL") {
                if (a.category === "BEER" && b.category !== "BEER") return -1;
                if (a.category !== "BEER" && b.category === "BEER") return 1;
            }
            return 0;
        });

    const categories = [
        { id: "ALL", label: t("shop.categories.all") || "All" },
        { id: "BEER", label: t("shop.categories.beer") || "Beers" },
        { id: "GIFTBOX", label: t("shop.categories.giftbox") || "Giftboxes" },
        { id: "GLASS", label: t("shop.categories.glass") || "Glassware" },
        { id: "MERCH", label: t("shop.categories.merch") || "Merch" },
    ];

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">{t("shop.title")}</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {t("shop.subtitle")}
                    </p>
                </div>

                <div className="flex justify-center mb-12 flex-wrap gap-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-6 py-2 rounded-none font-bold border-2 border-black transition-all ${activeCategory === category.id
                                ? "bg-brewery-green text-white"
                                : "bg-white text-black hover:bg-gray-100"
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
