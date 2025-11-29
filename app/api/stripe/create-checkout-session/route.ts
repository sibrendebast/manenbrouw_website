import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    try {
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

        // Map payment method to Stripe payment method types
        const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [];

        if (paymentMethod === "bancontact" || paymentMethod === "payconiq") {
            paymentMethodTypes.push("bancontact");
        } else if (paymentMethod === "card") {
            paymentMethodTypes.push("card");
        }

        // Create line items for Stripe
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(
            (item: any) => ({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name,
                        description: item.style,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            })
        );

        // Add shipping as a line item if applicable
        if (shippingMethod === "shipment") {
            lineItems.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Shipping",
                        description: "Delivery to Belgium",
                    },
                    unit_amount: 1000, // €10 in cents
                },
                quantity: 1,
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethodTypes,
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.nextUrl.origin}/checkout/cancel?order_id=${orderId}`,
            customer_email: customerEmail,
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
