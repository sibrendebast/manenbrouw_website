"use server";

import { prisma } from "@/lib/prisma";
import { Product } from "@/data/products";
import { safeGetProduct } from "@/lib/product-utils";
import { generateOrderNumber } from "@/lib/orderNumber";

export interface CartItem extends Product {
    quantity: number;
    itemType: "product";
}

export interface EventTicketItem {
    id: string;
    title: string;
    date: Date;
    location: string;
    price: number;
    quantity: number;
    itemType: "ticket";
    eventId: string;
}

type CartItemUnion = CartItem | EventTicketItem;

export async function placeOrder(formData: FormData, cartItems: CartItemUnion[]) {
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

    // Check if there are any products that require shipping
    const hasProducts = cartItems.some(item => item.itemType === "product");

    if (hasProducts && shippingMethod === "shipment" && (!street || !city || !zip || !country)) {
        return { success: false, error: "Missing address fields" };
    }

    if (hasProducts && shippingMethod === "shipment" && country !== "Belgium") {
        return { success: false, error: "Shipping is only available in Belgium" };
    }

    try {
        // Recalculate total to prevent tampering
        let totalAmount = 0;
        const orderItemsData = [];
        const ticketData = [];

        for (const item of cartItems) {
            if (item.itemType === "product") {
                const product = await safeGetProduct(item.id);

                if (!product) {
                    throw new Error(`Product not found: ${item.id}`);
                }

                totalAmount += product.price * item.quantity;
                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    btwCategory: (product as any).btwCategory || 21,
                });
            } else if (item.itemType === "ticket") {
                const event = await prisma.event.findUnique({
                    where: { id: item.eventId },
                });

                if (!event) {
                    throw new Error(`Event not found: ${item.eventId}`);
                }

                if (!event.isPaid || !event.ticketPrice) {
                    throw new Error(`Event is not a paid event: ${item.eventId}`);
                }

                totalAmount += event.ticketPrice * item.quantity;
                ticketData.push({
                    eventId: event.id,
                    buyerName: customerName,
                    buyerEmail: customerEmail,
                    quantity: item.quantity,
                    totalPrice: event.ticketPrice * item.quantity,
                });
            }
        }

        // Only add shipping cost if there are products
        const shippingCost = hasProducts && shippingMethod === "shipment" ? 10 : 0;
        totalAmount += shippingCost;

        const shippingAddress =
            hasProducts && shippingMethod === "shipment"
                ? JSON.stringify({ street, city, zip, country })
                : "";

        // Try to create order with btwCategory, fall back if column doesn't exist
        let order;
        try {
            // Generate order number
            const orderNumber = await generateOrderNumber();

            order = await prisma.order.create({
                data: {
                    orderNumber,
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingAddress,
                    shippingMethod: hasProducts ? shippingMethod : "pickup",
                    totalAmount,
                    status: "pending_payment",
                    items: orderItemsData.length > 0 ? {
                        create: orderItemsData,
                    } : undefined,
                    tickets: ticketData.length > 0 ? {
                        create: ticketData,
                    } : undefined,
                },
            });
        } catch (error: any) {
            // If btwCategory column doesn't exist in OrderItem, retry without it
            if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
                // Remove btwCategory from order items data
                const orderItemsDataWithoutBtw = orderItemsData.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                }));

                // Generate order number for fallback
                const orderNumber = await generateOrderNumber();

                order = await prisma.order.create({
                    data: {
                        orderNumber,
                        customerName,
                        customerEmail,
                        customerPhone,
                        shippingAddress,
                        shippingMethod: hasProducts ? shippingMethod : "pickup",
                        totalAmount,
                        status: "pending_payment",
                        items: orderItemsDataWithoutBtw.length > 0 ? {
                            create: orderItemsDataWithoutBtw,
                        } : undefined,
                        tickets: ticketData.length > 0 ? {
                            create: ticketData,
                        } : undefined,
                    },
                });
            } else {
                throw error;
            }
        }

        // Update tickets sold count for each event
        for (const ticket of ticketData) {
            await prisma.event.update({
                where: { id: ticket.eventId },
                data: {
                    ticketsSold: {
                        increment: ticket.quantity
                    }
                }
            });
        }

        if (newsletter) {
            try {
                const nameParts = customerName.trim().split(" ");
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

                await prisma.newsletterSubscriber.upsert({
                    where: { email: customerEmail },
                    update: {
                        firstName: firstName || undefined,
                        lastName: lastName || undefined
                    },
                    create: {
                        email: customerEmail,
                        firstName: firstName || undefined,
                        lastName: lastName || undefined
                    },
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
