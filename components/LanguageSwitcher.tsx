"use client";

import { useI18n } from "@/lib/i18n-context";

export default function LanguageSwitcher() {
    const { locale, setLocale } = useI18n();

    return (
        <div className="flex items-center gap-2 border-2 border-black bg-white p-1">
            <button
                onClick={() => setLocale('nl')}
                className={`px-2 py-1 text-sm font-bold transition-colors ${locale === 'nl'
                        ? 'bg-brewery-green text-white'
                        : 'text-gray-500 hover:text-black'
                    }`}
            >
                NL
            </button>
            <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 text-sm font-bold transition-colors ${locale === 'en'
                        ? 'bg-brewery-green text-white'
                        : 'text-gray-500 hover:text-black'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
