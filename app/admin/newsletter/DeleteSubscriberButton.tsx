'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteSubscriber } from '@/app/actions/newsletterActions';

interface DeleteSubscriberButtonProps {
    id: string;
}

export default function DeleteSubscriberButton({ id }: DeleteSubscriberButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to remove this subscriber?')) {
            setIsDeleting(true);
            await deleteSubscriber(id);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Remove subscriber"
        >
            <Trash2 className={`h-5 w-5 ${isDeleting ? 'opacity-50' : ''}`} />
        </button>
    );
}
