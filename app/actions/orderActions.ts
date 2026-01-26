"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                orderNumber: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                shippingAddress: true,
                shippingMethod: true,
                totalAmount: true,
                status: true,
                comment: true,
                stripeSessionId: true,
                paymentMethod: true,
                invoiceUrl: true,
                createdAt: true,
                updatedAt: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return orders;
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        return { success: false, error: "Failed to update order status" };
    }
}

export async function deleteOrder(orderId: string) {
    try {
        await prisma.order.delete({
            where: { id: orderId },
        });
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}
