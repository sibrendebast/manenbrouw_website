"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { Layers, PackageCheck, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

const highlightIcons = [Truck, Layers, ShieldCheck] as const;

export default function HomeDeliveryPage() {
    const { messages } = useI18n();
    const content = messages.delivery?.home;

    if (!content) {
        return null;
    }

    return (
        <div className="bg-white py-16 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="text-center space-y-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-brewery-green">{content.priceTag}</p>
                    <h1 className="text-4xl font-bold text-brewery-dark">{content.title}</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">{content.subtitle}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {content.highlights?.map((item, index) => {
                        const Icon = highlightIcons[index % highlightIcons.length];
                        return (
                            <div key={item.title} className="border-2 border-black p-6 bg-white shadow-sm transition-transform hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-full border-2 border-black bg-white text-brewery-green flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-brewery-dark mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        );
                    })}
                </div>

                <section className="border-2 border-black p-6 flex flex-col md:flex-row gap-6 items-center bg-white">
                    <div className="flex-1 space-y-2">
                        <h2 className="text-2xl font-semibold text-brewery-dark">{content.guaranteeTitle}</h2>
                        <p className="text-gray-700">{content.guaranteeText}</p>
                    </div>
                    <div className="w-full md:w-60 border-2 border-black bg-brewery-green text-white px-4 py-3 text-center font-bold uppercase tracking-[0.3em]">
                        100%
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold text-brewery-dark">{content.stepsTitle}</h2>
                    <div className="space-y-4">
                        {content.steps?.map((step, index) => (
                            <div key={step.title} className="flex gap-4 border-2 border-black p-4 bg-white">
                                <div className="w-10 h-10 rounded-full bg-brewery-green text-white flex items-center justify-center font-bold border-2 border-black">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-brewery-dark">{step.title}</p>
                                    <p className="text-gray-600 text-sm">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-2 border-black p-6 space-y-2 bg-white">
                    <h2 className="text-xl font-semibold text-brewery-dark">{content.videoTitle}</h2>
                    <p className="text-gray-600">{content.videoText}</p>
                </section>

                <div className="text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-brewery-green text-white px-8 py-4 font-bold border-2 border-black hover:bg-opacity-90 transition"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {content.cta}
                    </Link>
                </div>
            </div>
        </div>
    );
}
