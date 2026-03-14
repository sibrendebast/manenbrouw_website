"use client";

import { Beer, MapPin, Users, GlassWater, Utensils, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import TastingForm from "@/components/tasting/TastingForm";
import PageHeader from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

type TastingMessages = {
    title: string;
    subtitle: string;
    infoTitle: string;
    formulaTitle: string;
    formula4: { title: string; description: string; price: string };
    formula6: { title: string; description: string; price: string };
    addonGlass: { title: string; description: string; price: string };
    info: {
        minimumTitle: string;
        minimumText: string;
        locationTitle: string;
        breweryText: string;
        onLocationText: string;
    };
    form: {
        title: string;
        name: string;
        email: string;
        date: string;
        people: string;
        formula: string;
        formula4: string;
        formula6: string;
        keepGlass: string;
        location: string;
        atBrewery: string;
        otherLocation: string;
        message: string;
        submit: string;
        success: string;
    };
};

export default function TastingPage() {
    const { t, messages } = useI18n();
    const tasting = messages.tasting as TastingMessages | undefined;

    if (!tasting) return null;

    return (
        <div className="bg-white min-h-screen">
            <PageHeader 
                title={tasting.title} 
                subtitle={tasting.subtitle} 
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div>
                        <h2 className="text-4xl font-bold text-brewery-dark mb-10 border-l-8 border-brewery-green pl-6">
                            {tasting.formulaTitle}
                        </h2>
                        
                        <div className="space-y-8">
                            {/* Formula 4 */}
                            <div className="border-2 border-black p-8 bg-gray-50 hover:bg-white transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 font-bold group-hover:bg-brewery-green transition-colors">
                                    {tasting.formula4.price}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Beer className="text-brewery-green" />
                                    {tasting.formula4.title}
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {tasting.formula4.description}
                                </p>
                            </div>

                            {/* Formula 6 */}
                            <div className="border-2 border-black p-8 bg-gray-50 hover:bg-white transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 font-bold group-hover:bg-brewery-green transition-colors">
                                    {tasting.formula6.price}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Utensils className="text-brewery-green" />
                                    {tasting.formula6.title}
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {tasting.formula6.description}
                                </p>
                            </div>

                            {/* Addon Glass */}
                            <div className="border-2 border-dashed border-black p-8 bg-brewery-green/5 flex items-start gap-6">
                                <div className="bg-white border-2 border-black p-3 shrink-0">
                                    <GlassWater className="h-8 w-8 text-brewery-green" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        {tasting.addonGlass.title}
                                        <span className="text-brewery-green font-black">{tasting.addonGlass.price}</span>
                                    </h3>
                                    <p className="text-gray-600 italic">
                                        {tasting.addonGlass.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:pt-[84px] space-y-8">
                        <div className="border-2 border-black p-8 bg-white text-black">
                            <h2 className="text-3xl font-bold mb-8 text-brewery-green tracking-widest">{tasting.infoTitle}</h2>
                            
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <Users className="h-8 w-8 text-brewery-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">{tasting.info.minimumTitle}</h4>
                                        <p className="text-gray-600">{tasting.info.minimumText}</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <MapPin className="h-8 w-8 text-brewery-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">{tasting.info.locationTitle}</h4>
                                        <p className="text-gray-600 mb-2">{tasting.info.breweryText}</p>
                                        <p className="text-brewery-green text-sm italic">{tasting.info.onLocationText}</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <Info className="h-8 w-8 text-brewery-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Rondleiding</h4>
                                        <p className="text-gray-600">Onze proeverijen in de brouwerij zijn inclusief een kijkje achter de schermen en verhalen over hoe we onze bieren maken.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-4 self-center">
                        <div className="sticky top-32">
                            <h2 className="text-4xl font-black mb-6 leading-tight">
                                {tasting.form.title}
                            </h2>
                            <p className="text-gray-600 text-lg mb-8">
                                Klaar om onze bieren te ontdekken? Vul het formulier in en we maken er een onvergetelijke sessie van.
                            </p>
                            <div className="border-t-4 border-black pt-6">
                                <p className="font-bold text-brewery-green">Vragen?</p>
                                <p className="text-2xl font-bold">info@manenbrouw.be</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-8">
                        <div className="border-4 border-black p-8 md:p-12">
                            <TastingForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
