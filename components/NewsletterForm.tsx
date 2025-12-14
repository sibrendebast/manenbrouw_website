'use client';

import { useState, useRef } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletterActions';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';

type NewsletterFormProps = {
    variant?: 'default' | 'footer';
    className?: string;
};

export default function NewsletterForm({ variant = 'default', className }: NewsletterFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { t } = useI18n();

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);

        const result = await subscribeToNewsletter(formData);

        if (result.success) {
            setIsSuccess(true);
            formRef.current?.reset();

            // Revert success message after 3 seconds
            setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
        } else {
            alert('Something went wrong. Please try again.');
        }

        setIsSubmitting(false);
    };

    const formClasses = cn(
        variant === 'footer'
            ? 'flex flex-col space-y-3'
            : 'flex flex-col gap-3 max-w-lg mx-auto w-full',
        className,
    );

    const inputClasses = variant === 'footer'
        ? 'px-4 py-3 bg-white/10 border border-white/20 focus:outline-none focus:border-brewery-green text-white placeholder:text-gray-200 disabled:opacity-60 w-full'
        : 'px-6 py-4 text-gray-900 font-medium focus:outline-none border-2 border-black disabled:bg-gray-100 w-full';

    const buttonBase = variant === 'footer'
        ? 'bg-brewery-green text-white px-4 py-3 font-bold border border-white hover:bg-opacity-90 w-full'
        : 'font-bold py-4 px-8 border-2 border-black w-full';

    const buttonClasses = cn(
        buttonBase,
        isSuccess ? (variant === 'footer' ? 'bg-green-500 border-green-600' : 'bg-green-500 text-white border-green-600')
            : (variant === 'footer' ? '' : 'bg-white text-brewery-green hover:bg-opacity-90'),
        'transition-all disabled:opacity-60'
    );

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className={formClasses}
        >
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    name="firstName"
                    placeholder={t("footer.firstName")}
                    className={inputClasses}
                    required
                    disabled={isSubmitting || isSuccess}
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder={t("footer.lastName")}
                    className={inputClasses}
                    required
                    disabled={isSubmitting || isSuccess}
                />
            </div>

            <input
                type="email"
                name="email"
                placeholder={t("footer.emailPlaceholder")}
                className={inputClasses}
                required
                disabled={isSubmitting || isSuccess}
            />
            <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={buttonClasses}
            >
                {isSubmitting ? '...' : isSuccess ? `${t("common.success")}!` : t("footer.subscribe")}
            </button>
        </form>
    );
}
