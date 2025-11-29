'use client';

import { useState, useRef } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletterActions';

export default function NewsletterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

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

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
        >
            <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="flex-grow px-6 py-4 text-gray-900 font-medium focus:outline-none border-2 border-black"
                required
                disabled={isSubmitting || isSuccess}
            />
            <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`font-bold py-4 px-8 transition-all border-2 border-black min-w-[140px] ${isSuccess
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-white text-brewery-green hover:bg-opacity-90'
                    }`}
            >
                {isSubmitting ? '...' : isSuccess ? 'Subscribed!' : 'Subscribe'}
            </button>
        </form>
    );
}
