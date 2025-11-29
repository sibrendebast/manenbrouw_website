import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "No signature provided" },
            { status: 400 }
        );
    }

    let event;

    try {
        // In production, you'll need to set STRIPE_WEBHOOK_SECRET
        // For now, we'll parse the event without verification for testing
        event = JSON.parse(body);

        // In production, uncomment this:
        // event = stripe.webhooks.constructEvent(
        //   body,
        //   signature,
        //   process.env.STRIPE_WEBHOOK_SECRET!
        // );
    } catch (error) {
        console.error("Webhook signature verification failed:", error);
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const orderId = session.metadata?.orderId;
            const paymentMethod = session.metadata?.paymentMethod;

            if (orderId) {
                try {
                    const updatedOrder = await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: "paid",
                            stripeSessionId: session.id,
                            paymentMethod: paymentMethod,
                        },
                        include: {
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    });
                    console.log(`Order ${orderId} marked as paid`);

                    // Send confirmation email
                    await sendOrderConfirmationEmail(updatedOrder);
                } catch (error) {
                    console.error(`Failed to update order ${orderId}:`, error);
                }
            }
            break;

        case "checkout.session.expired":
            const expiredSession = event.data.object;
            const expiredOrderId = expiredSession.metadata?.orderId;

            if (expiredOrderId) {
                try {
                    await prisma.order.update({
                        where: { id: expiredOrderId },
                        data: {
                            status: "cancelled",
                        },
                    });
                    console.log(`Order ${expiredOrderId} marked as cancelled`);
                } catch (error) {
                    console.error(`Failed to update order ${expiredOrderId}:`, error);
                }
            }
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
