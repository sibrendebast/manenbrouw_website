"use client";

import { useI18n } from "@/lib/i18n-context";
import PageHeader from "@/components/ui/PageHeader";
import { Mail, PackageCheck, RefreshCw, Scale, ShoppingBag, TicketCheck } from "lucide-react";

const sectionIconMap = {
    orders: ShoppingBag,
    shipping: PackageCheck,
    events: TicketCheck,
    returns: RefreshCw,
    liability: Scale,
} as const;

const sectionOrder = ["orders", "shipping", "events", "returns", "liability"] as const;

type SectionKey = keyof typeof sectionIconMap;

type TermsSection = {
    title: string;
    items: string[];
};

type TermsMessages = {
    badge?: string;
    title: string;
    lastUpdated: string;
    intro: string;
    sections: Record<string, TermsSection>;
    contact: {
        title: string;
        text: string;
        email: string;
    };
};

export default function TermsPage() {
    const { messages } = useI18n();
    const terms = messages.terms as TermsMessages | undefined;

    if (!terms) {
        return null;
    }

    return (
        <div className="bg-white pb-16">
            <PageHeader 
                title={terms.title} 
                subtitle={terms.intro} 
            />
            <div className="max-w-4xl mx-auto space-y-12 mt-16 px-4">
                <div className="text-center">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">{terms.lastUpdated}</p>
                </div>

                <div className="space-y-8">
                    {sectionOrder.map((key) => {
                        const section = terms.sections[key as SectionKey];
                        if (!section) return null;
                        const Icon = sectionIconMap[key as SectionKey];

                        return (
                            <section key={key} className="border-2 border-black p-6 bg-white shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 border-2 border-black bg-white text-brewery-green">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-brewery-dark">{section.title}</h2>
                                </div>
                                <ul className="space-y-3 text-gray-700">
                                    {section.items.map((item, index) => (
                                        <li key={`${key}-${index}`} className="flex gap-3">
                                            <span className="text-brewery-green">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>

                <div className="border-2 border-black p-6 text-center space-y-4 bg-white">
                    <h3 className="text-xl font-semibold text-brewery-dark flex items-center justify-center gap-2">
                        <Mail className="h-5 w-5" />
                        {terms.contact.title}
                    </h3>
                    <p className="text-gray-600">{terms.contact.text}</p>
                    <a
                        href={`mailto:${terms.contact.email}`}
                        className="inline-flex items-center justify-center font-semibold text-white bg-brewery-green border-2 border-black px-6 py-2 hover:bg-opacity-90 transition"
                    >
                        {terms.contact.email}
                    </a>
                </div>
            </div>
        </div>
    );
}
