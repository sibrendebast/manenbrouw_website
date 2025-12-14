"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import NewsletterForm from "@/components/NewsletterForm";

import Script from "next/script";

interface HomeContentProps {
    featuredProducts: any[];
}

export default function HomeContent({ featuredProducts }: HomeContentProps) {
    const { t } = useI18n();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="flex flex-col">
                {/* Banner Image */}
                <div className="w-full bg-white">
                    <Image
                        src="/banner.svg"
                        alt="Man & Brouw Banner"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-auto"
                        priority
                    />
                </div>

                {/* Hero Content */}
                <section className="bg-brewery-green text-white py-12 lg:py-16 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            {t("home.hero.title")}
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
                            {t("home.hero.subtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/shop"
                                className="bg-white text-brewery-green font-bold py-3 px-8 hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg border-2 border-black"
                            >
                                {t("home.hero.cta")}
                            </Link>
                            <Link
                                href="/about"
                                className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 hover:bg-white/10 transition-all"
                            >
                                {t("nav.about")}
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* Featured Beers Section */}
            <section className="py-16 bg-white border-t-2 border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-brewery-dark">
                        {t("home.featured.title")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 hover:shadow-xl transition-shadow border-2 border-black">
                                <div className="relative w-full md:w-1/2 aspect-square overflow-hidden border-2 border-black">
                                    <Image
                                        src={product.images && product.images.length > 0 ? product.images[0] : "/logo.png"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <h3 className="text-2xl font-bold text-brewery-green mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-gray-500 mb-4">
                                        {product.style} • {product.abv}
                                    </p>
                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                        {product.description}
                                    </p>
                                    <Link
                                        href={`/shop/${product.slug}`}
                                        className="inline-flex items-center text-brewery-green font-bold hover:underline"
                                    >
                                        {t("home.featured.viewDetails")} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            href="/shop"
                            className="inline-block border-2 border-brewery-green text-brewery-green font-bold py-3 px-8 hover:bg-brewery-green hover:text-white transition-colors"
                        >
                            {t("home.featured.viewAll")}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 bg-brewery-green text-white border-t-2 border-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {t("home.newsletter.title")}
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        {t("home.newsletter.subtitle")}
                    </p>
                    <NewsletterForm />
                </div>
            </section>

            {/* Instagram Feed Section */}
            <section className="py-16 bg-white border-t-2 border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-brewery-dark">
                        {t("home.instagram.title")}
                    </h2>
                    <div className="sk-instagram-feed" data-embed-id="25625827"></div>
                    <Script
                        src="https://widgets.sociablekit.com/instagram-feed/widget.js"
                        strategy="afterInteractive"
                    />
                </div>
            </section>
        </div>
    );
}
