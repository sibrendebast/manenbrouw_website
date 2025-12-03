"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { CheckCircle2, Clock, Lock, Mail, MapPin, ShoppingBasket } from "lucide-react";

const highlightIcons = [CheckCircle2, Lock, Clock] as const;

export default function PickupPage() {
    const { messages } = useI18n();
    const content = messages.delivery?.pickup;

    if (!content) {
        return null;
    }

    return (
        <div className="bg-white py-16 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="text-center space-y-4">
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

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-black p-6 bg-white">
                        <div className="flex items-center gap-3 mb-2 text-brewery-green font-semibold">
                            <MapPin className="h-5 w-5" />
                            {content.addressLabel}
                        </div>
                        <p className="text-brewery-dark text-lg">{content.address}</p>
                    </div>
                    <div className="border-2 border-black p-6 bg-white">
                        <div className="flex items-center gap-3 mb-2 text-brewery-green font-semibold">
                            <Mail className="h-5 w-5" />
                            {content.tipTitle}
                        </div>
                        <p className="text-gray-600">{content.tipText}</p>
                    </div>
                </section>

                <div className="text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-white text-brewery-green px-8 py-4 font-bold border-2 border-black hover:bg-gray-50 transition"
                    >
                        <ShoppingBasket className="h-5 w-5" />
                        {content.cta}
                    </Link>
                </div>
            </div>
        </div>
    );
}
