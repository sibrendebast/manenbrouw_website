"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTicketPurchase(data: {
    eventId: string;
    orderId: string;
    buyerName: string;
    buyerEmail: string;
    quantity: number;
    totalPrice: number;
}) {
    try {
        const ticket = await prisma.eventTicket.create({
            data: {
                eventId: data.eventId,
                orderId: data.orderId,
                buyerName: data.buyerName,
                buyerEmail: data.buyerEmail,
                quantity: data.quantity,
                totalPrice: data.totalPrice,
            }
        });

        // Update tickets sold count
        await prisma.event.update({
            where: { id: data.eventId },
            data: {
                ticketsSold: {
                    increment: data.quantity
                }
            }
        });

        revalidatePath("/admin/events");
        revalidatePath("/events");

        return { success: true, ticket };
    } catch (error) {
        console.error("Error creating ticket purchase:", error);
        return { success: false, error: "Failed to create ticket purchase" };
    }
}

export async function getEventTickets(eventId: string) {
    try {
        const tickets = await prisma.eventTicket.findMany({
            where: { eventId },
            orderBy: {
                purchasedAt: 'desc'
            }
        });
        return tickets;
    } catch (error) {
        console.error("Error fetching event tickets:", error);
        return [];
    }
}
