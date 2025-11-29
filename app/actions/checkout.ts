"use server";

import { prisma } from "@/lib/prisma";
import { Product } from "@/data/products";

export interface CartItem extends Product {
    quantity: number;
}

export async function placeOrder(formData: FormData, cartItems: CartItem[]) {
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const shippingMethod = formData.get("shippingMethod") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const zip = formData.get("zip") as string;
    const country = formData.get("country") as string;
    const newsletter = formData.get("newsletter") === "on";

    if (!customerName || !customerEmail || !customerPhone || !shippingMethod) {
        return { success: false, error: "Missing required fields" };
    }

    if (shippingMethod === "shipment" && (!street || !city || !zip || !country)) {
        return { success: false, error: "Missing address fields" };
    }

    if (shippingMethod === "shipment" && country !== "Belgium") {
        return { success: false, error: "Shipping is only available in Belgium" };
    }

    try {
        // Recalculate total to prevent tampering
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
            });

            if (!product) {
                throw new Error(`Product not found: ${item.id}`);
            }

            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }

        const shippingCost = shippingMethod === "shipment" ? 10 : 0;
        totalAmount += shippingCost;

        const shippingAddress =
            shippingMethod === "shipment"
                ? JSON.stringify({ street, city, zip, country })
                : "";

        const order = await prisma.order.create({
            data: {
                customerName,
                customerEmail,
                customerPhone,
                shippingAddress,
                shippingMethod,
                totalAmount,
                status: "pending_payment",
                items: {
                    create: orderItemsData,
                },
            },
        });

        if (newsletter) {
            try {
                await prisma.newsletterSubscriber.upsert({
                    where: { email: customerEmail },
                    update: {},
                    create: { email: customerEmail },
                });
            } catch (error) {
                console.error("Failed to subscribe to newsletter:", error);
                // Don't fail the order if newsletter subscription fails
            }
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Order placement failed:", error);
        return { success: false, error: "Failed to place order" };
    }
}
