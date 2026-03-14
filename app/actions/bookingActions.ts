'use server';

import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendTastingRequest(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const date = formData.get('date') as string;
    const people = formData.get('people') as string;
    const formula = formData.get('formula') as string;
    const keepGlass = formData.get('keepGlass') === 'true';
    const location = formData.get('location') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !date || !people || !formula || !location) {
        return { success: false, error: 'Vul alle verplichte velden in.' };
    }

    try {
        // Send email to brewery
        await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `Nieuwe proeverij aanvraag: ${name}`,
            html: `
                <h1>Nieuwe proeverij aanvraag</h1>
                <p><strong>Naam:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Datum:</strong> ${date}</p>
                <p><strong>Aantal personen:</strong> ${people}</p>
                <p><strong>Formule:</strong> ${formula}</p>
                <p><strong>Houdt glas:</strong> ${keepGlass ? 'Ja' : 'Nee'}</p>
                <p><strong>Locatie:</strong> ${location}</p>
                <p><strong>Bericht:</strong> ${message || 'Geen extra bericht'}</p>
            `
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send tasting request:', error);
        return { success: false, error: 'Er is iets misgegaan bij het verzenden van de aanvraag.' };
    }
}
