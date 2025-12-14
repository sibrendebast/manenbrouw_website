'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSubscriber(id: string) {
    try {
        await prisma.newsletterSubscriber.delete({
            where: { id }
        });
        revalidatePath('/admin/newsletter');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete subscriber:', error);
        return { success: false, error: 'Failed to delete subscriber' };
    }
}

export async function subscribeToNewsletter(formData: FormData) {
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return { success: false, error: 'Invalid email address' };
    }

    try {
        await prisma.newsletterSubscriber.create({
            data: {
                email,
                firstName: firstName || undefined,
                lastName: lastName || undefined
            }
        });
        revalidatePath('/admin/newsletter');
        return { success: true };
    } catch (error) {
        // Check for unique constraint violation (P2002)
        if ((error as any).code === 'P2002') {
            return { success: true }; // Treat duplicate as success to avoid leaking info/errors
        }
        console.error('Failed to subscribe:', error);
        return { success: false, error: 'Failed to subscribe' };
    }
}
