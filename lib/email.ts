import { Resend } from 'resend';
import { OrderInvoice } from '@/app/emails/OrderInvoice';

// Use a fallback key during build time to prevent build failures
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Man & Brouw <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@manenbrouw.be';

// Type definition for order with items included
type OrderWithItems = {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    shippingMethod: string;
    paymentMethod: string;
    totalAmount: number;
    createdAt: Date;
    items: {
        product: {
            name: string;
        };
        quantity: number;
        price: number;
    }[];
};

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing - emails will not be sent");
        return { success: false, error: "RESEND_API_KEY is missing" };
    }

    try {
        // Send email to customer with BCC to admin
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [order.customerEmail],
            bcc: [ADMIN_EMAIL], // Send copy to admin
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            react: OrderInvoice({ order }),
        });

        if (error) {
            console.error("Error sending order confirmation email:", error);
            return { success: false, error };
        }

        console.log(`Order confirmation email sent successfully to ${order.customerEmail} with copy to ${ADMIN_EMAIL}`);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send order confirmation email:", error);
        return { success: false, error };
    }
}

// Send a separate admin notification email to ensure admin is always notified
export async function sendAdminOrderNotification(order: OrderWithItems) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing - admin notification email will not be sent");
        return { success: false, error: "RESEND_API_KEY is missing" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `New Order Placed #${order.id.slice(0, 8)} - ${order.customerName}`,
            react: OrderInvoice({ order }),
        });

        if (error) {
            console.error("Error sending admin notification email:", error);
            return { success: false, error };
        }

        console.log(`Admin notification email sent successfully to ${ADMIN_EMAIL} for order #${order.id.slice(0, 8)}`);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send admin notification email:", error);
        return { success: false, error };
    }
}
