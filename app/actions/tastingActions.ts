'use server';

import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { sendNotificationToAdmins } from "@/app/actions/notificationActions";
import { sendTelegramTastingNotification } from "@/lib/telegram";
import { requireAdminSession } from "@/lib/session";

import { calculateEstimatedPrice, TastingStatusType, TastingPaymentStatusType } from "@/lib/tastingUtils";
export type { TastingStatusType, TastingPaymentStatusType };


async function generateBookingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.tastingBooking.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            }
        }
    });
    const seq = String(count + 1).padStart(3, '0');
    return `TST-${year}-${seq}`;
}

export async function submitTastingRequest(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = (formData.get('phone') as string) || null;
    const dateStr = formData.get('date') as string;
    const timeStr = (formData.get('time') as string) || null;
    const peopleStr = formData.get('people') as string;
    const formula = formData.get('formula') as string;
    const keepGlass = formData.get('keepGlass') === 'true';
    const location = (formData.get('location') as string) || 'Brouwerij';
    const address = (formData.get('address') as string) || null;
    const message = (formData.get('message') as string) || null;

    if (!name || !email || !dateStr || !peopleStr || !formula) {
        return { success: false, error: 'Vul alle verplichte velden in.' };
    }

    const peopleCount = parseInt(peopleStr, 10);
    if (isNaN(peopleCount) || peopleCount < 1) {
        return { success: false, error: 'Ongeldig aantal personen.' };
    }

    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
        return { success: false, error: 'Ongeldige datum.' };
    }

    const estimatedPrice = calculateEstimatedPrice(formula, peopleCount, keepGlass);

    try {
        const bookingNumber = await generateBookingNumber();

        const booking = await prisma.tastingBooking.create({
            data: {
                bookingNumber,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                requestedDate,
                scheduledDate: requestedDate,
                scheduledTime: timeStr,
                peopleCount,
                formula,
                keepGlass,
                locationType: location,
                address,
                totalPrice: estimatedPrice,
                amountPaid: 0,
                paymentStatus: 'UNPAID',
                customerMessage: message,
                status: 'PENDING',
            }
        });

        // Send emails
        await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL, email],
            replyTo: email,
            subject: `Nieuwe proeverij aanvraag [${bookingNumber}]: ${name}`,
            html: `
                <h1>Nieuwe proeverij aanvraag (${bookingNumber})</h1>
                <p>Beste ${name},</p>
                <p>Bedankt voor je aanvraag voor een proeverij bij Man & Brouw. We hebben je aanvraag goed ontvangen en nemen zo snel mogelijk contact met je op om datum, tijdstip en details te bevestigen.</p>
                <hr />
                <p><strong>Aanvraagnummer:</strong> ${bookingNumber}</p>
                <p><strong>Naam:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Telefoon:</strong> ${phone}</p>` : ''}
                <p><strong>Gewenste datum:</strong> ${dateStr} ${timeStr ? `om ${timeStr}` : ''}</p>
                <p><strong>Aantal personen:</strong> ${peopleCount}</p>
                <p><strong>Formule:</strong> ${formula}</p>
                <p><strong>Glazen meenemen:</strong> ${keepGlass ? 'Ja (+€5 p.p.)' : 'Nee'}</p>
                <p><strong>Locatie:</strong> ${location} ${address ? `(${address})` : ''}</p>
                <p><strong>Geschatte richtprijs:</strong> &euro;${estimatedPrice.toFixed(2)}</p>
                <p><strong>Bericht / Opmerkingen:</strong> ${message || 'Geen extra opmerkingen'}</p>
                <hr />
                <p>Met vriendelijke groeten,<br />Het Man & Brouw team</p>
            `
        });

        // Notify admins via Telegram
        try {
            await sendTelegramTastingNotification(booking);
        } catch (tgErr) {
            console.error('Failed to send Telegram tasting notification:', tgErr);
        }

        // Notify admins via web-push
        try {
            await sendNotificationToAdmins(
                `Nieuwe proeverij aanvraag van ${name} (${peopleCount} pers.)`,
                `/admin/tastings`
            );
        } catch (pushErr) {
            console.error('Failed to send push notification to admins:', pushErr);
        }

        revalidatePath('/admin/tastings');
        return { success: true, bookingNumber, id: booking.id };
    } catch (error: any) {
        console.error('Failed to submit tasting request:', error);
        return { success: false, error: 'Er is een fout opgetreden bij het verzenden van de aanvraag.' };
    }
}

export async function getTastings(filters?: { status?: string; search?: string }) {
    await requireAdminSession();
    try {
        const whereClause: any = {};

        if (filters?.status && filters.status !== 'ALL') {
            whereClause.status = filters.status;
        }

        if (filters?.search && filters.search.trim() !== '') {
            const query = filters.search.trim();
            whereClause.OR = [
                { customerName: { contains: query, mode: 'insensitive' } },
                { customerEmail: { contains: query, mode: 'insensitive' } },
                { bookingNumber: { contains: query, mode: 'insensitive' } },
                { customerPhone: { contains: query, mode: 'insensitive' } },
            ];
        }

        const bookings = await prisma.tastingBooking.findMany({
            where: whereClause,
            orderBy: [
                { requestedDate: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return bookings;
    } catch (error) {
        console.error('Error fetching tasting bookings:', error);
        return [];
    }
}

export async function getTastingStats() {
    await requireAdminSession();
    try {
        const allBookings: any[] = await prisma.tastingBooking.findMany();

        const pendingCount = allBookings.filter((b: any) => b.status === 'PENDING').length;
        const confirmedCount = allBookings.filter((b: any) => b.status === 'CONFIRMED').length;
        const completedCount = allBookings.filter((b: any) => b.status === 'COMPLETED').length;
        const cancelledCount = allBookings.filter((b: any) => b.status === 'CANCELLED').length;

        const totalRevenue = allBookings
            .filter((b: any) => b.status !== 'CANCELLED')
            .reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);

        const openBalance = allBookings
            .filter((b: any) => b.status !== 'CANCELLED')
            .reduce((sum: number, b: any) => {
                const total = b.totalPrice || 0;
                const paid = b.amountPaid || 0;
                return sum + Math.max(0, total - paid);
            }, 0);

        return {
            pendingCount,
            confirmedCount,
            completedCount,
            cancelledCount,
            totalRevenue,
            openBalance,
            totalBookings: allBookings.length,
        };
    } catch (error) {
        console.error('Error fetching tasting stats:', error);
        return {
            pendingCount: 0,
            confirmedCount: 0,
            completedCount: 0,
            cancelledCount: 0,
            totalRevenue: 0,
            openBalance: 0,
            totalBookings: 0,
        };
    }
}

export async function updateTasting(id: string, data: {
    scheduledDate?: string | null;
    scheduledTime?: string | null;
    peopleCount?: number;
    formula?: string;
    keepGlass?: boolean;
    locationType?: string;
    address?: string | null;
    totalPrice?: number | null;
    amountPaid?: number;
    paymentStatus?: TastingPaymentStatusType;
    paymentMethod?: string | null;
    adminNotes?: string | null;
    status?: TastingStatusType;
    customerPhone?: string | null;
}) {
    await requireAdminSession();
    try {
        const updatePayload: any = { ...data };

        if (data.scheduledDate) {
            updatePayload.scheduledDate = new Date(data.scheduledDate);
        } else if (data.scheduledDate === null) {
            updatePayload.scheduledDate = null;
        }

        // Automatically update paymentStatus if amountPaid covers totalPrice
        if (typeof data.amountPaid === 'number' && typeof data.totalPrice === 'number' && !data.paymentStatus) {
            if (data.amountPaid <= 0) {
                updatePayload.paymentStatus = 'UNPAID';
            } else if (data.amountPaid >= data.totalPrice) {
                updatePayload.paymentStatus = 'PAID';
            } else {
                updatePayload.paymentStatus = 'PARTIALLY_PAID';
            }
        }

        const updated = await prisma.tastingBooking.update({
            where: { id },
            data: updatePayload,
        });

        revalidatePath('/admin/tastings');
        revalidatePath('/admin/dashboard');
        return { success: true, booking: updated };
    } catch (error: any) {
        console.error('Error updating tasting booking:', error);
        return { success: false, error: error.message || 'Failed to update tasting booking' };
    }
}

export async function createManualTasting(data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    scheduledDate: string;
    scheduledTime?: string;
    peopleCount: number;
    formula: string;
    keepGlass?: boolean;
    locationType?: string;
    address?: string;
    totalPrice?: number;
    amountPaid?: number;
    paymentStatus?: TastingPaymentStatusType;
    paymentMethod?: string;
    adminNotes?: string;
    status?: TastingStatusType;
}) {
    await requireAdminSession();
    try {
        const bookingNumber = await generateBookingNumber();
        const scheduledDate = new Date(data.scheduledDate);
        const totalPrice = data.totalPrice ?? calculateEstimatedPrice(data.formula, data.peopleCount, !!data.keepGlass);
        const amountPaid = data.amountPaid ?? 0;

        let paymentStatus: TastingPaymentStatusType = data.paymentStatus || 'UNPAID';
        if (!data.paymentStatus) {
            if (amountPaid >= totalPrice && totalPrice > 0) paymentStatus = 'PAID';
            else if (amountPaid > 0) paymentStatus = 'PARTIALLY_PAID';
        }

        const booking = await prisma.tastingBooking.create({
            data: {
                bookingNumber,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone || null,
                requestedDate: scheduledDate,
                scheduledDate: scheduledDate,
                scheduledTime: data.scheduledTime || null,
                peopleCount: data.peopleCount,
                formula: data.formula,
                keepGlass: !!data.keepGlass,
                locationType: data.locationType || 'Brouwerij',
                address: data.address || null,
                totalPrice,
                amountPaid,
                paymentStatus,
                paymentMethod: data.paymentMethod || null,
                adminNotes: data.adminNotes || null,
                status: data.status || 'CONFIRMED',
            }
        });

        revalidatePath('/admin/tastings');
        revalidatePath('/admin/dashboard');
        return { success: true, booking };
    } catch (error: any) {
        console.error('Error creating manual tasting:', error);
        return { success: false, error: error.message || 'Kon proeverij niet handmatig aanmaken.' };
    }
}

export async function deleteTasting(id: string) {
    await requireAdminSession();
    try {
        await prisma.tastingBooking.delete({
            where: { id }
        });
        revalidatePath('/admin/tastings');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting tasting:', error);
        return { success: false, error: error.message || 'Kon proeverij niet verwijderen.' };
    }
}
