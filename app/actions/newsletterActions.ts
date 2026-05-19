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

export type NewsletterPayload = {
    title: string;
    introHeading: string;
    introBody: string;
    storiesHeading: string;
    stories: NewsletterStory[];
    stockHeading: string;
    stockRows: NewsletterStockRow[];
    outroHeading: string;
    outroBody: string;
};

export async function getProductsForNewsletter() {
    return await prisma.product.findMany({
        where: {
            isHidden: false,
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

function buildNewsletterHtml(payload: NewsletterPayload): string {
    const storiesHtml = payload.stories.map(story => `
            <div class="news-item">
                <table class="news-item-table">
                    <tr>
                        ${story.imageUrl ? `
                        <td class="news-item-image-cell">
                            <img src="${story.imageUrl}" alt="${story.heading}" class="news-item-image">
                        </td>
                        ` : ''}
                        <td class="news-item-content" ${!story.imageUrl ? 'style="width: 100%"' : ''}>
                            <h3>${story.heading}</h3>
                            <p>${story.body.replace(/\n/g, '<br>')}</p>
                            ${story.linkUrl ? `<a href="${story.linkUrl}" class="button">${story.linkLabel || 'Meer info'}</a>` : ''}
                        </td>
                    </tr>
                </table>
            </div>
    `).join('');

    const stockRowsHtml = payload.stockRows.map(row => `
                    <tr>
                        <td>${row.imageUrl ? `<img src="${row.imageUrl}" alt="${row.name}" class="beer-image">` : ''}</td>
                        <td>${row.name}</td>
                        <td>${row.description}</td>
                        <td>${row.bottlePrice}</td>
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
            text-align: center;
            padding: 25px 0;
        }
        .top-banner-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
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
            padding: 20px 0;
            font-size: 0.9em;
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
        .news-item-table {
            width: 100%;
            border-collapse: collapse;
        }
        .news-item-table td {
             padding-left: 0;
             vertical-align: top;
        }
        .news-item-image-cell {
             width: 33.33%;
             padding-right: 20px;
        }
         .news-item-content {
             width: 66.67%;
             padding: 20px;
         }
        .news-item-image {
            max-width: 100%;
            height: auto;
            display: block;
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
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        td {
             border-bottom: 1px solid #eee;
        }
        tr:last-child td {
            border-bottom: none;
        }
        td:nth-child(1) {
            text-align: center;
        }
        td:nth-child(4) {
            text-align: right;
        }
        .beer-image {
            max-width: 60px;
            height: auto;
            display: block;
            margin: 0 auto;
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
            <img src="https://www.manenbrouw.be/wp-content/uploads/2022/01/cropped-logo_tekst_black_small.png" alt="Man & Brouw Logo" class="logo">
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

        ${payload.stories.length > 0 ? `
        <section>
            ${payload.storiesHeading ? `<h2>${payload.storiesHeading}</h2>` : ''}
            ${storiesHtml}
        </section>
        ` : ''}

        ${payload.stockRows.length > 0 ? `
        <section>
            ${payload.stockHeading ? `<h2>${payload.stockHeading}</h2>` : ''}
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Bier</th>
                        <th>Beschrijving</th>
                        <th>33cl fles</th>
                    </tr>
                </thead>
                <tbody>
                    ${stockRowsHtml}
                </tbody>
            </table>
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
        <div class="social-buttons">
            <a href="https://www.facebook.com/profile.php?id=61559618724445">Facebook</a>
            <a href="https://www.instagram.com/man_en_brouw/">Instagram</a>
        </div>
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
                html: html,
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
