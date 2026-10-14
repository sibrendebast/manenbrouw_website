'use client';

import { useState } from 'react';
import { Building2, User, Loader2 } from 'lucide-react';
import { updateSubscriberCommercial } from '@/app/actions/newsletterActions';

interface SubscriberCommercialToggleProps {
    id: string;
    initialIsCommercial: boolean;
    subscriberEmail: string;
}

export default function SubscriberCommercialToggle({
    id,
    initialIsCommercial,
    subscriberEmail
}: SubscriberCommercialToggleProps) {
    const [isCommercial, setIsCommercial] = useState(initialIsCommercial);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;
        const nextState = !isCommercial;

        // Optimistic update
        setIsCommercial(nextState);
        setIsLoading(true);

        const res = await updateSubscriberCommercial(id, nextState);
        if (!res.success) {
            // Revert on failure
            setIsCommercial(!nextState);
            alert(`Fout bij bijwerken van ${subscriberEmail}: ${res.error || 'Onbekende fout'}`);
        }
        setIsLoading(false);
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            title={
                isCommercial
                    ? 'Commerciële klant (horeca, winkel). Klik om te wijzigen naar particulier.'
                    : 'Particuliere klant. Klik om te wijzigen naar commercieel.'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border-2 transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed ${
                isCommercial
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-800 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200'
            }`}
        >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isCommercial ? (
                <>
                    <Building2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span>Zakelijk</span>
                </>
            ) : (
                <>
                    <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    <span>Particulier</span>
                </>
            )}
        </button>
    );
}
