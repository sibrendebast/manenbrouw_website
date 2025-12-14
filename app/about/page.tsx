"use client";

import { Beer, Wrench, Hourglass } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";

type AboutMessages = {
    hero: {
        title: string;
        subtitle: string;
    };
    story: {
        title: string;
        imageAlt: string;
        paragraphs: string[];
    };
    highlights: {
        flavors: {
            title: string;
            description: string;
            imageAlt: string;
        };
        makerMentality: {
            title: string;
            description: string;
        };
        temporal: {
            title: string;
            description: string;
        };
    };
};

export default function AboutPage() {
    const { messages } = useI18n();
    const about = messages.aboutPage as AboutMessages | undefined;

    if (!about) {
        return null;
    }

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">
                        {about.hero.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {about.hero.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-brewery-green mb-6">
                            {about.story.title}
                        </h2>
                        {about.story.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="text-gray-700 mb-4 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                    <div className="relative w-full max-w-sm mx-auto aspect-square border-2 border-black overflow-hidden">
                        <Image
                            src="/about/beer_assortment.jpg"
                            alt={about.story.imageAlt}
                            width={3064}
                            height={3064}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="relative p-6 border-2 border-black overflow-hidden group min-h-[300px] flex flex-col justify-center">
                        <Image
                            src="/about/abrikozen.jpg"
                            alt={about.highlights.flavors.imageAlt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                                <Beer className="h-8 w-8 text-brewery-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{about.highlights.flavors.title}</h3>
                            <p className="text-gray-200">
                                {about.highlights.flavors.description}
                            </p>
                        </div>
                    </div>

                    <div className="relative p-6 border-2 border-black overflow-hidden group min-h-[300px] flex flex-col justify-center">
                        <Image
                            src="/about/brewery.jpg"
                            alt={about.highlights.makerMentality.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                                <Wrench className="h-8 w-8 text-brewery-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{about.highlights.makerMentality.title}</h3>
                            <p className="text-gray-200">
                                {about.highlights.makerMentality.description}
                            </p>
                        </div>
                    </div>
                    <div className="relative p-6 border-2 border-black overflow-hidden group min-h-[300px] flex flex-col justify-center">
                        <Image
                            src="/about/rabarber.jpg"
                            alt={about.highlights.temporal.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                                <Hourglass className="h-8 w-8 text-brewery-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{about.highlights.temporal.title}</h3>
                            <p className="text-gray-200">
                                {about.highlights.temporal.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
