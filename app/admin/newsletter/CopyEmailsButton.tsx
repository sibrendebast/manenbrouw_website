'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyEmailsButtonProps {
    emails: string[];
}

export default function CopyEmailsButton({ emails }: CopyEmailsButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (emails.length === 0) return;

        const emailString = emails.join(', ');

        try {
            await navigator.clipboard.writeText(emailString);
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy emails:', err);
            alert('Failed to copy emails to clipboard');
        }
    };

    if (emails.length === 0) return null;

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center font-bold py-2 px-4 border-2 border-black transition-all ${isCopied
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-white text-brewery-dark hover:bg-gray-100'
                }`}
        >
            {isCopied ? (
                <>
                    <Check className="h-4 w-4 mr-2" /> Copied!
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4 mr-2" /> Copy All Emails
                </>
            )}
        </button>
    );
}
