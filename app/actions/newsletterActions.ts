"use server";

import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type NewsletterStory = {
    id: string;
    heading: string;
    body: string;
    imageUrl: string;
    linkUrl: string;
    linkLabel: string;
};

export type NewsletterStockRow = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    bottlePrice: string;
};

export type NewsletterAgendaRow = {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    linkUrl?: string;
};

export type NewsletterPayload = {
    title: string;
    introHeading: string;
    introBody: string;
    storiesHeading: string;
    stories: NewsletterStory[];
    stockHeading: string;
    stockRows: NewsletterStockRow[];
    agendaHeading?: string;
    agendaRows?: NewsletterAgendaRow[];
    outroHeading: string;
    outroBody: string;
};

export async function getProductsForNewsletter() {
    return await prisma.product.findMany({
        where: {
            isHidden: false,
            category: 'BEER',
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            name: true,
            style: true,
            abv: true,
            description: true,
            images: true,
            price: true,
            inStock: true,
        }
    });
}

export async function getEventsForNewsletter() {
    return await prisma.event.findMany({
        where: {
            isHidden: false,
            date: {
                gte: new Date(), // Only upcoming events
            }
        },
        orderBy: {
            date: 'asc',
        },
        select: {
            id: true,
            title: true,
            description: true,
            date: true,
            location: true,
            isPaid: true,
            ticketPrice: true,
            image: true,
        }
    });
}

function buildNewsletterHtml(payload: NewsletterPayload): string {
    const storiesHtml = payload.stories.map(story => `
            <table class="story-card" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    ${story.imageUrl ? `
                    <td class="story-image-cell">
                        <img src="${story.imageUrl}" alt="${story.heading}" class="story-image">
                    </td>
                    ` : ''}
                    <td class="story-content-cell" ${!story.imageUrl ? 'style="width: 100%;"' : ''}>
                        <h3 class="story-heading">${story.heading}</h3>
                        <p class="story-body">${story.body.replace(/\n/g, '<br>')}</p>
                        ${story.linkUrl ? `<a href="${story.linkUrl}" class="button">${story.linkLabel || 'Meer info'}</a>` : ''}
                    </td>
                </tr>
            </table>
    `).join('');

    const stockRowsHtml = payload.stockRows.map(row => `
                    <tr>
                        <td class="beer-img-cell">${row.imageUrl ? `<img src="${row.imageUrl}" alt="${row.name}" class="beer-image">` : ''}</td>
                        <td class="beer-name-cell">${row.name}</td>
                        <td class="beer-desc-cell">${row.description}</td>
                    </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${payload.title}</title>
    <style>
        body {
            font-family: sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #56c99b;
        }
        .top-banner {
            background-color: #56c99b;
            color: white;
            text-align: left;
            padding: 25px 0;
        }
        .top-banner-content {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 20px;
            max-width: 660px;
            margin: 0 auto;
            padding: 0 30px;
            box-sizing: border-box;
        }
        .top-banner .logo {
            max-height: 60px;
            width: auto;
        }
        .top-banner h1 {
            color: white;
            margin: 0;
            font-size: 2em;
        }
        .bottom-banner {
            background-color: #f2f2f2;
            color: #333;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
            max-width: 660px;
            margin: 0 auto;
            box-sizing: border-box;
        }
        .bottom-banner a {
            color: #56c99b;
            text-decoration: none;
            margin: 0 10px;
        }
        .bottom-banner a:hover {
            text-decoration: underline;
        }
        .social-buttons {
            margin-top: 10px;
        }
        .social-buttons a {
            display: inline-block;
            margin: 0 5px;
        }
        .container {
            max-width: 660px;
            margin: 20px auto;
            background-color: #56c99b;
            padding: 30px;
        }
        section {
            background-color: #fff;
            border: 3px solid black;
            padding: 20px;
            margin-bottom: 20px;
        }
        section:last-child {
            margin-bottom: 0;
        }
        h2, h3 {
            color: #56c99b;
        }
        .news-item {
             margin-bottom: 20px;
             padding-bottom: 15px;
             border-bottom: 1px solid #eee;
        }
         .news-item:last-child {
             border-bottom: none;
        }
        /* Per-story card */
        .story-card {
            border-collapse: collapse;
            border: 3px solid black;
            margin-bottom: 16px;
            overflow: hidden;
            background-color: #fff;
        }
        .story-image-cell {
            width: 40%;
            padding: 0;
            vertical-align: top;
        }
        .story-image {
            display: block;
            width: 100%;
            height: auto;
        }
        .story-content-cell {
            width: 60%;
            padding: 20px;
            vertical-align: top;
        }
        .story-heading {
            margin: 0 0 10px 0;
            color: #56c99b;
            font-size: 1.1em;
        }
        .story-body {
            margin: 0 0 12px 0;
            font-size: 0.95em;
            color: #333;
            line-height: 1.5;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: none;
        }
        th, td {
            border: none;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        td {
             border-bottom: 1px solid #eee;
        }
        .beer-img-cell {
            padding: 0;
            border-bottom: none;
        }
        tr:last-child td {
            border-bottom: none;
        }
        td:nth-child(1) {
            text-align: left;
        }
        td:nth-child(4) {
            text-align: left;
        }
        .beer-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            display: block;
        }
        .beer-img-cell {
            padding: 0 !important;
            width: 100px;
            vertical-align: top;
        }
        .beer-name-cell {
            padding: 8px 12px !important;
            font-weight: bold;
            vertical-align: middle;
        }
        .beer-desc-cell {
            padding: 8px 12px !important;
            color: #555;
            font-size: 0.9em;
            vertical-align: middle;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #56c99b;
            color: white;
            text-decoration: none;
            margin-top: 10px;
        }
        .button:hover {
            background-color: #45a07d;
        }
    </style>
</head>
<body>
    <div class="top-banner">
        <div class="top-banner-content">
            <img src="https://www.manenbrouw.be/logo.png" alt="Man & Brouw Logo" class="logo">
            <h1>${payload.title}</h1>
        </div>
    </div>

    <div class="container">

        ${payload.introHeading || payload.introBody ? `
        <section>
            ${payload.introHeading ? `<h2>${payload.introHeading}</h2>` : ''}
            ${payload.introBody ? `<div class="news-item">${payload.introBody.replace(/\n/g, '<br>')}</div>` : ''}
        </section>
        ` : ''}

        ${storiesHtml}

        ${payload.stockRows.length > 0 ? `
        <section>
            ${payload.stockHeading ? `<h2>${payload.stockHeading}</h2>` : ''}
            <table>
                <tbody>
                    ${stockRowsHtml}
                </tbody>
            </table>
            <div style="text-align: left; margin-top: 25px; margin-bottom: 10px;">
                <a href="https://manenbrouw.be/shop" style="display: inline-block; background-color: #56c99b; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 1em; border: 2px solid black; box-shadow: 4px 4px 0px 0px #000;">Bestel in onze webshop</a>
            </div>
        </section>
        ` : ''}

        ${payload.agendaRows && payload.agendaRows.length > 0 ? `
        <section>
            ${payload.agendaHeading ? `<h2>${payload.agendaHeading}</h2>` : ''}
            ${payload.agendaRows.map(row => `
                <div class="agenda-item" style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <h3 style="margin: 0 0 5px 0; color: #56c99b;">${row.title}</h3>
                    <p style="margin: 0 0 5px 0; font-size: 0.9em; font-weight: bold; color: #333;">
                        📅 ${row.date} | 📍 ${row.location}
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 0.95em; color: #555;">${row.description}</p>
                    ${row.linkUrl ? `
                        <a href="${row.linkUrl}" style="display: inline-block; background-color: #56c99b; color: white; padding: 6px 12px; text-decoration: none; font-weight: bold; font-size: 0.85em; border: 2px solid black;">Tickets / Meer info</a>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${payload.outroHeading || payload.outroBody ? `
        <section>
            ${payload.outroHeading ? `<h2>${payload.outroHeading}</h2>` : ''}
            ${payload.outroBody ? `<p style="margin-top: 20px;">${payload.outroBody.replace(/\n/g, '<br>')}</p>` : ''}
        </section>
        ` : ''}

    </div>

    <div class="bottom-banner">
        <p>Contacteer ons: <a href="mailto:info@manenbrouw.be">info@manenbrouw.be</a> | Bel ons: <a href="tel:0032472766499">+32 4 72 766 499</a></p>
        <p>Bezoek onze website: <a href="https://manenbrouw.be">manenbrouw.be</a></p>
        <p style="font-size: 0.85em; color: #666; margin-top: 8px; margin-bottom: 8px;">Aarschotsesteenweg 179, 3012 Wilsele</p>
        <div class="social-buttons">
            <a href="https://www.facebook.com/profile.php?id=61559618724445">Facebook</a>
            <a href="https://www.instagram.com/man_en_brouw/">Instagram</a>
        </div>
        <p style="margin-top: 15px; font-size: 0.8em; color: #666;">
            Wil je deze nieuwsbrief niet meer ontvangen? 
            <a href="*|UNSUBSCRIBE_LINK|*" style="color: #da3737; text-decoration: underline; margin-left: 5px;">Uitschrijven</a>
        </p>
        <p>&copy; ${new Date().getFullYear()} Man & Brouw. All rights reserved.</p>
    </div>
</body>
</html>`;
}

export async function generateNewsletterHtml(payload: NewsletterPayload) {
    return buildNewsletterHtml(payload);
}

export async function sendNewsletterPreview(payload: NewsletterPayload) {
    let html = buildNewsletterHtml(payload);
    // Automatically translate local URLs to production for email readability
    html = html.replace(/http:\/\/localhost:\d+/g, 'https://www.manenbrouw.be');
    // Replace placeholder with admin test unsubscribe URL
    html = html.replace(/\*\|UNSUBSCRIBE_LINK\|\*/g, `https://www.manenbrouw.be/newsletter/unsubscribe?email=${encodeURIComponent(ADMIN_EMAIL)}`);
    
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY is missing" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `[PREVIEW] ${payload.title}`,
            html: html,
        });

        if (error) {
            console.error("Error sending preview email:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to send preview email:", error);
        return { success: false, error: error.message };
    }
}

export async function sendNewsletterToAll(payload: NewsletterPayload) {
    let html = buildNewsletterHtml(payload);
    // Automatically translate local URLs to production for email readability
    html = html.replace(/http:\/\/localhost:\d+/g, 'https://www.manenbrouw.be');
    
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY is missing" };
    }

    try {
        const subscribers = await prisma.newsletterSubscriber.findMany();
        if (subscribers.length === 0) {
            return { success: false, error: "No subscribers found." };
        }

        // Resend batch sending allows up to 100 emails per request, but we can also just loop.
        // Let's use the individual send in a loop for simplicity, or resend.batch.send if available.
        // We'll use individual sends with a small delay or Promise.all.
        // For larger lists, consider batching:
        const BATCH_SIZE = 50;
        let sentCount = 0;

        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
            const batch = subscribers.slice(i, i + BATCH_SIZE);
            const emails = batch.map((s: { email: string }) => ({
                from: FROM_EMAIL,
                to: s.email,
                subject: payload.title,
                html: html.replace(/\*\|UNSUBSCRIBE_LINK\|\*/g, `https://www.manenbrouw.be/newsletter/unsubscribe?email=${encodeURIComponent(s.email)}`),
            }));

            const { data, error } = await resend.batch.send(emails);

            if (error) {
                console.error("Error sending batch email:", error);
                // We'll return early on first batch error, though in production you might want to continue
                return { success: false, error: error.message, sentCount };
            }
            sentCount += batch.length;
        }

        return { success: true, sentCount };
    } catch (error: any) {
        console.error("Failed to send newsletter to all:", error);
        return { success: false, error: error.message };
    }
}

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

export async function unsubscribeByEmail(email: string) {
    try {
        await prisma.newsletterSubscriber.delete({
            where: { email }
        });
        revalidatePath('/admin/newsletter');
        return { success: true };
    } catch (error) {
        console.error('Failed to unsubscribe by email:', error);
        return { success: false, error: 'E-mailadres niet gevonden of al uitgeschreven.' };
    }
}

export async function getNewsletters() {
    try {
        return await prisma.newsletter.findMany({
            orderBy: {
                updatedAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get newsletters:', error);
        return [];
    }
}

export async function getNewsletterById(id: string) {
    try {
        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        });
        if (newsletter) {
            return {
                ...newsletter,
                payload: newsletter.payload as any as NewsletterPayload
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to get newsletter by id:', error);
        return null;
    }
}

export async function saveNewsletterDraft(id: string | null, title: string, payload: NewsletterPayload) {
    try {
        if (id) {
            const updated = await prisma.newsletter.update({
                where: { id },
                data: {
                    title,
                    payload: payload as any,
                    status: 'DRAFT',
                }
            });
            revalidatePath('/admin/newsletter');
            return { success: true, newsletter: updated };
        } else {
            const created = await prisma.newsletter.create({
                data: {
                    title,
                    payload: payload as any,
                    status: 'DRAFT',
                }
            });
            revalidatePath('/admin/newsletter');
            return { success: true, newsletter: created };
        }
    } catch (error: any) {
        console.error('Failed to save newsletter draft:', error);
        return { success: false, error: error.message };
    }
}

export async function sendNewsletterToAllWithSave(id: string | null, payload: NewsletterPayload) {
    const sendResult = await sendNewsletterToAll(payload);
    if (!sendResult.success) {
        return sendResult;
    }

    try {
        const sentCount = sendResult.sentCount || 0;
        if (id) {
            await prisma.newsletter.update({
                where: { id },
                data: {
                    title: payload.title,
                    payload: payload as any,
                    status: 'SENT',
                    sentAt: new Date(),
                    sentCount: sentCount
                }
            });
        } else {
            await prisma.newsletter.create({
                data: {
                    title: payload.title,
                    payload: payload as any,
                    status: 'SENT',
                    sentAt: new Date(),
                    sentCount: sentCount
                }
            });
        }
        revalidatePath('/admin/newsletter');
        return { success: true, sentCount };
    } catch (error: any) {
        console.error('Failed to save sent newsletter history:', error);
        return { success: true, sentCount: sendResult.sentCount, warning: "Emails sent, but failed to save log: " + error.message };
    }
}

export async function deleteNewsletter(id: string) {
    try {
        await prisma.newsletter.delete({
            where: { id }
        });
        revalidatePath('/admin/newsletter');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete newsletter:', error);
        return { success: false, error: error.message };
    }
}
