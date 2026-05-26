'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteNewsletter } from '@/app/actions/newsletterActions';

interface DeleteNewsletterButtonProps {
    id: string;
    status: string;
}

export default function DeleteNewsletterButton({ id, status }: DeleteNewsletterButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const message = status === 'DRAFT'
            ? 'Weet je zeker dat je dit concept wilt verwijderen?'
            : 'Weet je zeker dat je deze nieuwsbriefgeschiedenis wilt verwijderen? Dit verwijdert alleen het logboek, de verzonden e-mails worden niet beïnvloed.';
            
        if (confirm(message)) {
            setIsDeleting(true);
            const res = await deleteNewsletter(id);
            if (!res.success) {
                alert(`Fout bij verwijderen: ${res.error}`);
            }
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors inline-flex items-center gap-1 text-sm font-semibold border border-transparent hover:border-red-200"
            title={status === 'DRAFT' ? "Concept verwijderen" : "Geschiedenis verwijderen"}
        >
            <Trash2 className="h-4 w-4" />
            Verwijder
        </button>
    );
}
