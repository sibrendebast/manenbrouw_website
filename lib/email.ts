import { Resend } from 'resend';
import { OrderInvoice } from '@/app/emails/OrderInvoice';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(order: any) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Man & Brouw <onboarding@resend.dev>', // Update this with your verified domain in production
            to: [order.customerEmail],
            bcc: ['info@manenbrouw.be'], // Send copy to admin
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            react: OrderInvoice({ order }),
        });

        if (error) {
            console.error("Error sending email:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}
