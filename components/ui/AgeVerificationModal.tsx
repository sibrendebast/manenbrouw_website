"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beer } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export default function AgeVerificationModal() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        const hasVerified = localStorage.getItem("age-verified");
        if (!hasVerified) {
            setIsVisible(true);
        }
    }, []);

    const handleVerify = () => {
        localStorage.setItem("age-verified", "true");
        setIsVisible(false);
    };

    const handleReject = () => {
        window.location.href = "https://www.google.com";
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white shadow-2xl max-w-md w-full p-8 text-center border-4 border-black"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-brewery-green p-4">
                                <Beer className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-brewery-dark">{t("ageVerification.question")}</h2>
                        <p className="text-gray-600 mb-8">
                            {t("ageVerification.message")}
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleVerify}
                                className="w-full bg-brewery-green text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors text-lg border-2 border-black"
                            >
                                {t("ageVerification.yes")}
                            </button>
                            <button
                                onClick={handleReject}
                                className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 hover:bg-gray-300 transition-colors border-2 border-black"
                            >
                                {t("ageVerification.no")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
