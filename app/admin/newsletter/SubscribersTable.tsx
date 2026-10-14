'use client';

import { useState, useMemo } from 'react';
import { Mail, Search, Copy, Check, Building2, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import SubscriberCommercialToggle from './SubscriberCommercialToggle';
import DeleteSubscriberButton from './DeleteSubscriberButton';

export interface SubscriberItem {
    id: string;
    email: string;
    createdAt: Date | string;
    firstName: string | null;
    lastName: string | null;
    isCommercial: boolean;
}

interface SubscribersTableProps {
    subscribers: SubscriberItem[];
}

type FilterTab = 'ALL' | 'COMMERCIAL' | 'REGULAR';

export default function SubscribersTable({ subscribers }: SubscribersTableProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const counts = useMemo(() => {
        const commercial = subscribers.filter(s => s.isCommercial).length;
        return {
            total: subscribers.length,
            commercial,
            regular: subscribers.length - commercial
        };
    }, [subscribers]);

    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(s => {
            // Filter by tab
            if (activeTab === 'COMMERCIAL' && !s.isCommercial) return false;
            if (activeTab === 'REGULAR' && s.isCommercial) return false;

            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
                const email = s.email.toLowerCase();
                return fullName.includes(query) || email.includes(query);
            }
            return true;
        });
    }, [subscribers, activeTab, searchQuery]);

    const handleCopyEmails = async () => {
        if (filteredSubscribers.length === 0) return;
        const emailsString = filteredSubscribers.map(s => s.email).join(', ');

        try {
            await navigator.clipboard.writeText(emailsString);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy emails:', err);
            alert('Kon e-mails niet kopiëren naar klembord');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Controls: Filter Tabs & Search & Copy */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ALL')}
                        className={`px-3 py-1.5 text-xs font-bold border-2 border-black transition-all cursor-pointer ${
                            activeTab === 'ALL'
                                ? 'bg-brewery-dark text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Alle ({counts.total})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('COMMERCIAL')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-black transition-all cursor-pointer ${
                            activeTab === 'COMMERCIAL'
                                ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        Zakelijk ({counts.commercial})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('REGULAR')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-black transition-all cursor-pointer ${
                            activeTab === 'REGULAR'
                                ? 'bg-gray-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <User className="h-3.5 w-3.5" />
                        Particulier ({counts.regular})
                    </button>
                </div>

                {/* Copy filtered emails */}
                {filteredSubscribers.length > 0 && (
                    <button
                        type="button"
                        onClick={handleCopyEmails}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            isCopied
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-brewery-dark hover:bg-gray-50'
                        }`}
                    >
                        {isCopied ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Gekopieerd!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" />
                                Kopieer e-mails ({filteredSubscribers.length})
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Zoek abonnees op naam of e-mail..."
                    className="w-full pl-9 pr-4 py-2 border-2 border-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brewery-green"
                />
            </div>

            {/* Table or Empty state */}
            {filteredSubscribers.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-300">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900 mb-1">Geen abonnees gevonden</h3>
                    <p className="text-xs text-gray-500">
                        {searchQuery
                            ? `Geen resultaten gevonden voor "${searchQuery}".`
                            : 'Er zijn geen abonnees in deze categorie.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto border-2 border-black">
                    <table className="min-w-full divide-y-2 divide-black">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Naam
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    E-mailadres
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Datum
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Acties
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSubscribers.map(subscriber => (
                                <tr key={subscriber.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {subscriber.firstName || subscriber.lastName
                                            ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                                            : <span className="text-gray-400 italic">Geen naam</span>}
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-700 font-mono text-xs">
                                        {subscriber.email}
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                                        <SubscriberCommercialToggle
                                            id={subscriber.id}
                                            initialIsCommercial={subscriber.isCommercial}
                                            subscriberEmail={subscriber.email}
                                        />
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500">
                                        {formatDate(subscriber.createdAt)}
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                                        <DeleteSubscriberButton id={subscriber.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
