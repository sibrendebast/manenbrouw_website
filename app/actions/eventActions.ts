"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvents() {
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                date: 'asc'
            }
        });
        return events;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export async function getEvent(id: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id }
        });
        return event;
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

export async function createEvent(data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    isPaid: boolean;
    ticketPrice?: number;
    capacity?: number;
    image?: string;
}) {
    try {
        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                location: data.location,
                isPaid: data.isPaid,
                ticketPrice: data.isPaid ? data.ticketPrice : null,
                capacity: data.capacity,
                image: data.image,
            }
        });
        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true, event };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

export async function updateEvent(id: string, data: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
    isPaid?: boolean;
    ticketPrice?: number;
    capacity?: number;
    image?: string;
}) {
    try {
        const event = await prisma.event.update({
            where: { id },
            data
        });
        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true, event };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

export async function deleteEvent(id: string) {
    try {
        await prisma.event.delete({
            where: { id }
        });
        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

export async function toggleEventHidden(id: string, isHidden: boolean) {
    try {
        await prisma.event.update({
            where: { id },
            data: { isHidden }
        });
        revalidatePath("/admin/events");
        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error toggling event visibility:", error);
        return { success: false, error: "Failed to toggle event visibility" };
    }
}
