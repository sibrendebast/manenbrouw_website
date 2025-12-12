"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '@/messages/en.json';
import nlMessages from '@/messages/nl.json';

type Locale = 'en' | 'nl';
type Messages = typeof enMessages;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    messages: Messages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
    en: enMessages,
    nl: nlMessages,
};

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('nl'); // Default to Dutch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load saved locale from localStorage
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'nl')) {
            setLocaleState(savedLocale);
        }
        setMounted(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = messages[locale];

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) return key;

        if (params) {
            return Object.entries(params).reduce((acc, [key, val]) => {
                return acc.replace(new RegExp(`{${key}}`, 'g'), String(val));
            }, value as string);
        }

        return value as string;
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, messages: messages[locale] }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
