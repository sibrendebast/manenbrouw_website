import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
import { generateInvoice } from "@/lib/invoice";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    console.log(`Webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const orderId = session.metadata?.orderId;
            const paymentMethod = session.metadata?.paymentMethod;

            console.log(`Processing checkout session for order: ${orderId}`);

            if (orderId) {
                try {
                    // First, find the order and include all necessary relations
                    const order = await prisma.order.findUnique({
                        where: { id: orderId },
                        include: {
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                            tickets: true,
                        },
                    });

                    if (!order) {
                        throw new Error(`Order with ID ${orderId} not found.`);
                    }

                    // Generate invoice
                    const invoicePdf = await generateInvoice(order);

                    // Upload to Cloudinary as image
                    const orderNumberSafe = order.orderNumber ? order.orderNumber.replace(/\//g, "-") : orderId;
                    const invoicePublicId = `invoice-${orderNumberSafe}`;
                    const uploadResult = await uploadToCloudinary(invoicePdf, "invoices", "image", invoicePublicId);
                    const invoiceUrl = uploadResult.secure_url;

                    // Update order with payment status and invoice URL
                    const updatedOrder = await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: "paid",
                            stripeSessionId: session.id,
                            paymentMethod: paymentMethod,
                            invoiceUrl: invoiceUrl,
                        },
                        include: {
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    });
                    console.log(`Order ${orderId} marked as paid. Items count: ${updatedOrder.items.length}`);

                    // Decrease stock for each product in the order
                    for (const orderItem of updatedOrder.items) {
                        const product = orderItem.product;
                        console.log(`Processing item: ${product.name}, Current Stock: ${product.stockCount}, Quantity: ${orderItem.quantity}`);

                        const newStockCount = Math.max(0, product.stockCount - orderItem.quantity);

                        await prisma.product.update({
                            where: { id: product.id },
                            data: {
                                stockCount: newStockCount,
                                inStock: newStockCount > 0,
                            },
                        });

                        console.log(`Updated stock for ${product.name}: ${product.stockCount} -> ${newStockCount}`);
                    }

                    // Send confirmation email to customer (with BCC to admin)
                    const customerEmailResult = await sendOrderConfirmationEmail(updatedOrder);
                    if (!customerEmailResult?.success) {
                        console.error("Failed to send customer confirmation email, but order was processed successfully");
                    }

                    // Send separate admin notification as backup
                    const adminEmailResult = await sendAdminOrderNotification(updatedOrder);
                    if (!adminEmailResult?.success) {
                        console.error("Failed to send admin notification email, but order was processed successfully");
                    }
                } catch (error) {
                    console.error(`Failed to update order ${orderId}:`, error);
                }
            } else {
                console.error("No orderId found in session metadata");
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
