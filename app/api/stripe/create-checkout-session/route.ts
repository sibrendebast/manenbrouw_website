import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { safeGetProduct } from "@/lib/product-utils";

export async function POST(req: NextRequest) {
    try {
        // Validate Stripe key at runtime
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: "Stripe is not configured" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const {
            orderId,
            cartItems,
            shippingMethod,
            totalAmount,
            customerEmail,
            customerName,
            paymentMethod,
        } = body;

        if (!orderId || !cartItems || !totalAmount || !customerEmail || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Fetch and verify the order directly from the database
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                tickets: {
                    include: { event: true }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.status !== "pending_payment" && order.status !== "pending") {
            return NextResponse.json(
                { error: "Order is already processed or invalid" },
                { status: 400 }
            );
        }

        // Validate stock for all products in the database order
        for (const orderItem of order.items) {
            const product = orderItem.product;
            if (!product.inStock || product.stockCount < orderItem.quantity) {
                return NextResponse.json(
                    {
                        error: `Insufficient stock for ${product.name}. Only ${product.stockCount} available.`,
                        code: 'INSUFFICIENT_STOCK',
                        product: product.name,
                        available: product.stockCount
                    },
                    { status: 400 }
                );
            }
        }

        // Map payment method to Stripe payment method types
        const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [];

        if (paymentMethod === "bancontact" || paymentMethod === "payconiq") {
            paymentMethodTypes.push("bancontact");
        } else if (paymentMethod === "card") {
            paymentMethodTypes.push("card");
        }

        // Build line items directly from verified database order (tamper-proof)
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        for (const orderItem of order.items) {
            lineItems.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: orderItem.product.name,
                        description: `${orderItem.product.style || ""} (BTW ${orderItem.btwCategory || 21}%)`.trim(),
                    },
                    unit_amount: Math.round(orderItem.price * 100),
                    tax_behavior: "inclusive",
                },
                quantity: orderItem.quantity,
            });
        }

        for (const ticket of order.tickets) {
            const unitPrice = ticket.quantity > 0 ? (ticket.totalPrice / ticket.quantity) : ticket.totalPrice;
            lineItems.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: ticket.event.title,
                        description: `Event at ${ticket.event.location}`,
                    },
                    unit_amount: Math.round(unitPrice * 100),
                    tax_behavior: "inclusive",
                },
                quantity: ticket.quantity,
            });
        }

        if (order.shippingMethod === "shipment" && order.items.length > 0) {
            lineItems.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Verzending",
                        description: "Levering binnen België",
                    },
                    unit_amount: 1000, // €10 in cents
                },
                quantity: 1,
            });
        }

        // Create or reuse a Stripe Customer so name + email are prefilled
        // on the Stripe hosted checkout page.
        let stripeCustomerId: string | undefined;
        try {
            // Look up an existing customer by email to avoid duplicates
            const existingCustomers = await stripe.customers.list({
                email: customerEmail,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                stripeCustomerId = existingCustomers.data[0].id;
                // Update name in case it changed
                await stripe.customers.update(stripeCustomerId, { name: customerName });
            } else {
                const newCustomer = await stripe.customers.create({
                    email: customerEmail,
                    name: customerName,
                });
                stripeCustomerId = newCustomer.id;
            }
        } catch (customerError) {
            // Non-fatal: fall back to customer_email only
            console.error("Failed to create/retrieve Stripe customer:", customerError);
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethodTypes,
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.nextUrl.origin}/checkout/cancel?order_id=${orderId}`,
            ...(stripeCustomerId
                ? { customer: stripeCustomerId }
                : { customer_email: customerEmail }),
            metadata: {
                orderId,
                paymentMethod,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe checkout session error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
