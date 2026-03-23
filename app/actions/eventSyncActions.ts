"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Recalculates the ticketsSold field for all events based on paid orders.
 * This fixes discrepancies caused by manual order deletions or cancelled orders
 * that might have incorrectly affected the denormalized ticketsSold field.
 */
export async function syncAllActiveEventsTicketCounts() {
    try {
        const events = await prisma.event.findMany();
        
        for (const event of events) {
            // Sum up quantities of tickets from orders that are PAID or COMPLETED or SHIPPED
            const tickets = await prisma.eventTicket.findMany({
                where: {
                    eventId: event.id,
                    order: {
                        status: {
                            in: ["paid", "completed", "shipped"]
                        }
                    }
                },
                select: {
                    quantity: true
                }
            });
            
            const realCount = tickets.reduce((sum: number, t: { quantity: number }) => sum + t.quantity, 0);
            
            if (event.ticketsSold !== realCount) {
                console.log(`Syncing event ${event.title}: ${event.ticketsSold} -> ${realCount}`);
                await prisma.event.update({
                    where: { id: event.id },
                    data: { ticketsSold: realCount }
                });
            }
        }
        
        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Failed to sync ticket counts:", error);
        return { success: false, error: "Sync failed" };
    }
}
