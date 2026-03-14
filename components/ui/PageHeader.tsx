"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    bgColor?: string;
}

export default function PageHeader({ 
    title, 
    subtitle, 
    bgColor = "bg-brewery-green" 
}: PageHeaderProps) {
    return (
        <section className={`${bgColor} text-white py-12 border-b-2 border-black`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block border-2 border-black p-6 md:p-8 bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    <h1 className="text-3xl md:text-5xl font-black mb-3 uppercase tracking-tighter">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg md:text-xl max-w-2xl mx-auto font-bold text-gray-700">
                            {subtitle}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
