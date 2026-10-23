"use server";

import { prisma } from "@/lib/prisma";
import { Product } from "@/data/products";
import { safeGetProduct } from "@/lib/product-utils";
import { generateOrderNumber } from "@/lib/orderNumber";
import { sendNotificationToAdmins } from "@/app/actions/notificationActions";

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

export type CartItemUnion = CartItem | EventTicketItem;

export interface CartStockIssue {
    id: string;
    name: string;
    type: "product" | "ticket";
    reason: "not_found" | "hidden" | "out_of_stock" | "insufficient_stock";
    availableStock?: number;
    requestedQuantity: number;
    message: string;
}

export async function validateCartStock(cartItems: CartItemUnion[], locale: string = "nl"): Promise<{
    valid: boolean;
    issues: CartStockIssue[];
    error?: string;
}> {
    const issues: CartStockIssue[] = [];

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { valid: true, issues: [] };
    }

    for (const item of cartItems) {
        if (!item.quantity || typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
            issues.push({
                id: item.id,
                name: (item as any).name || (item as any).title || item.id,
                type: item.itemType === "ticket" ? "ticket" : "product",
                reason: "not_found",
                requestedQuantity: item.quantity,
                message: locale === "en" ? "Invalid item quantity in cart." : "Ongeldig aantal stuks in winkelwagen.",
            });
            continue;
        }

        if (item.itemType === "product") {
            try {
                const product = await safeGetProduct(item.id);
                if (!product) {
                    issues.push({
                        id: item.id,
                        name: (item as any).name || item.id,
                        type: "product",
                        reason: "not_found",
                        requestedQuantity: item.quantity,
                        message: locale === "en"
                            ? `Product "${(item as any).name || item.id}" was not found.`
                            : `Product "${(item as any).name || item.id}" niet gevonden.`,
                    });
                    continue;
                }

                if (product.isHidden) {
                    issues.push({
                        id: item.id,
                        name: product.name,
                        type: "product",
                        reason: "hidden",
                        requestedQuantity: item.quantity,
                        message: locale === "en"
                            ? `"${product.name}" is no longer available.`
                            : `"${product.name}" is niet meer beschikbaar.`,
                    });
                    continue;
                }

                if (!product.inStock || product.stockCount <= 0) {
                    issues.push({
                        id: item.id,
                        name: product.name,
                        type: "product",
                        reason: "out_of_stock",
                        availableStock: 0,
                        requestedQuantity: item.quantity,
                        message: locale === "en"
                            ? `"${product.name}" is out of stock.`
                            : `"${product.name}" is momenteel uitverkocht.`,
                    });
                    continue;
                }

                if (product.stockCount < item.quantity) {
                    issues.push({
                        id: item.id,
                        name: product.name,
                        type: "product",
                        reason: "insufficient_stock",
                        availableStock: product.stockCount,
                        requestedQuantity: item.quantity,
                        message: locale === "en"
                            ? `Insufficient stock for "${product.name}". Only ${product.stockCount} available.`
                            : `Onvoldoende voorraad voor "${product.name}". Er zijn nog ${product.stockCount} stuks beschikbaar.`,
                    });
                }
            } catch (err) {
                console.error("Error validating product stock:", err);
            }
        } else if (item.itemType === "ticket") {
            try {
                const event = await prisma.event.findUnique({
                    where: { id: item.eventId },
                });
                if (!event || (event as any).isHidden) {
                    issues.push({
                        id: item.id,
                        name: item.title,
                        type: "ticket",
                        reason: "hidden",
                        requestedQuantity: item.quantity,
                        message: locale === "en"
                            ? `Event "${item.title}" is no longer available.`
                            : `Evenement "${item.title}" is niet meer beschikbaar.`,
                    });
                    continue;
                }
                if (event.capacity !== null && event.capacity !== undefined) {
                    const remaining = event.capacity - (event.ticketsSold || 0);
                    if (remaining < item.quantity) {
                        issues.push({
                            id: item.id,
                            name: event.title,
                            type: "ticket",
                            reason: remaining <= 0 ? "out_of_stock" : "insufficient_stock",
                            availableStock: Math.max(0, remaining),
                            requestedQuantity: item.quantity,
                            message: remaining <= 0
                                ? (locale === "en" ? `Tickets for "${event.title}" are sold out.` : `Tickets voor "${event.title}" zijn uitverkocht.`)
                                : (locale === "en" ? `Only ${remaining} tickets left for "${event.title}".` : `Nog slechts ${remaining} tickets beschikbaar voor "${event.title}".`),
                        });
                    }
                }
            } catch (err) {
                console.error("Error validating event tickets:", err);
            }
        }
    }

    const firstIssue = issues[0];
    return {
        valid: issues.length === 0,
        issues,
        error: firstIssue ? firstIssue.message : undefined,
    };
}

export async function placeOrder(formData: FormData, cartItems: CartItemUnion[]) {
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const shippingMethod = formData.get("shippingMethod") as string;
    const comment = formData.get("comment") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const zip = formData.get("zip") as string;
    const country = formData.get("country") as string;
    const newsletter = formData.get("newsletter") === "on";
    const newsletterCommercial = formData.get("newsletterCommercial") === "on";
    const locale = (formData.get("locale") as string) || "nl";

    if (!customerName || !customerEmail || !customerPhone || !shippingMethod) {
        return { success: false, error: "Missing required fields" };
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { success: false, error: locale === "en" ? "Cart is empty" : "Winkelwagen is leeg" };
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
        // ── 1. Validate Stock and Availability across all items ───────────────
        const stockValidation = await validateCartStock(cartItems, locale);
        if (!stockValidation.valid) {
            return {
                success: false,
                error: stockValidation.error || (locale === "en" ? "One or more items in your cart are no longer available." : "Een of meerdere items in je winkelwagen zijn niet meer beschikbaar."),
            };
        }

        // Recalculate total directly from database product/event data to prevent tampering
        let totalAmount = 0;
        const orderItemsData = [];
        const ticketData = [];

        for (const item of cartItems) {
            if (item.itemType === "product") {
                const product = await safeGetProduct(item.id);
                if (!product) {
                    return { success: false, error: `Product not found: ${item.id}` };
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

                if (!event || !event.isPaid || !event.ticketPrice) {
                    return { success: false, error: `Event ticket unavailable: ${item.eventId}` };
                }

                // Check if early-bird pricing applies
                const now = new Date();
                const earlyBirdEndDate = event.earlyBirdEndDate ? new Date(event.earlyBirdEndDate) : null;
                const isEarlyBird = event.earlyBirdPrice && earlyBirdEndDate && now < earlyBirdEndDate;
                const currentPrice = isEarlyBird ? event.earlyBirdPrice : event.ticketPrice;

                totalAmount += currentPrice * item.quantity;
                ticketData.push({
                    eventId: event.id,
                    buyerName: customerName,
                    buyerEmail: customerEmail,
                    quantity: item.quantity,
                    totalPrice: currentPrice * item.quantity,
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

        // ── 2. Deduplication ─────────────────────────────────────────────────
        // If customer already has a pending_payment order created within the last
        // 30 minutes, update its items and total with fresh validated data instead
        // of creating duplicate rows.
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingOrder = await prisma.order.findFirst({
            where: {
                customerEmail,
                customerPhone,
                status: "pending_payment",
                createdAt: { gte: thirtyMinutesAgo },
            },
            orderBy: { createdAt: "desc" },
        });

        let order;
        if (existingOrder) {
            console.log(`Updating existing pending_payment order ${existingOrder.id} with validated cart items`);
            await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
            await prisma.eventTicket.deleteMany({ where: { orderId: existingOrder.id } });

            try {
                order = await prisma.order.update({
                    where: { id: existingOrder.id },
                    data: {
                        locale,
                        comment,
                        shippingAddress,
                        shippingMethod: hasProducts ? shippingMethod : "pickup",
                        totalAmount,
                        items: orderItemsData.length > 0 ? { create: orderItemsData } : undefined,
                        tickets: ticketData.length > 0 ? { create: ticketData } : undefined,
                    },
                });
            } catch (error: any) {
                if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
                    const orderItemsWithoutBtw = orderItemsData.map(({ btwCategory, ...rest }) => rest);
                    order = await prisma.order.update({
                        where: { id: existingOrder.id },
                        data: {
                            locale,
                            comment,
                            shippingAddress,
                            shippingMethod: hasProducts ? shippingMethod : "pickup",
                            totalAmount,
                            items: orderItemsWithoutBtw.length > 0 ? { create: orderItemsWithoutBtw } : undefined,
                            tickets: ticketData.length > 0 ? { create: ticketData } : undefined,
                        },
                    });
                } else {
                    throw error;
                }
            }
        } else {
            const orderNumber = await generateOrderNumber();
            try {
                order = await prisma.order.create({
                    data: {
                        orderNumber,
                        locale,
                        comment,
                        customerName,
                        customerEmail,
                        customerPhone,
                        shippingAddress,
                        shippingMethod: hasProducts ? shippingMethod : "pickup",
                        totalAmount,
                        status: "pending_payment",
                        items: orderItemsData.length > 0 ? { create: orderItemsData } : undefined,
                        tickets: ticketData.length > 0 ? { create: ticketData } : undefined,
                    },
                });
            } catch (error: any) {
                if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
                    const orderItemsWithoutBtw = orderItemsData.map(({ btwCategory, ...rest }) => rest);
                    order = await prisma.order.create({
                        data: {
                            orderNumber,
                            locale,
                            comment,
                            customerName,
                            customerEmail,
                            customerPhone,
                            shippingAddress,
                            shippingMethod: hasProducts ? shippingMethod : "pickup",
                            totalAmount,
                            status: "pending_payment",
                            items: orderItemsWithoutBtw.length > 0 ? { create: orderItemsWithoutBtw } : undefined,
                            tickets: ticketData.length > 0 ? { create: ticketData } : undefined,
                        },
                    });
                } else {
                    throw error;
                }
            }
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
                        lastName: lastName || undefined,
                        isCommercial: newsletterCommercial,
                    },
                    create: {
                        email: customerEmail,
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        isCommercial: newsletterCommercial,
                    },
                });
            } catch (error) {
                console.error("Failed to subscribe to newsletter:", error);
            }
        }

        // Send Push Notification to Admins
        try {
            await sendNotificationToAdmins(`New order ${(order as any).orderNumber} received from ${customerName}!`);
        } catch (error) {
            console.error("Failed to send notification:", error);
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Order placement failed:", error);
        return { success: false, error: "Failed to place order" };
    }
}
