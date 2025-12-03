import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'nl'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
    if (!locale || !locales.includes(locale as Locale)) {
        notFound();
    }

    const validatedLocale = locale as Locale;

    return {
        locale: validatedLocale,
        messages: (await import(`./messages/${validatedLocale}.json`)).default
    };
});
