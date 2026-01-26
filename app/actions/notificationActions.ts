"use server";

import webPush from "web-push";
import { prisma } from "@/lib/prisma";

webPush.setVapidDetails(
    "mailto:admin@manenbrouw.be",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(subscription: webPush.PushSubscription) {
    try {
        // Determine the admin ID (For now, we'll associate with the first admin or passed ID)
        // Ideally, pass the authenticated admin's ID contextually
        const admins = await prisma.adminUser.findMany();
        if (admins.length === 0) return { success: false, error: "No admin found" };

        // Check if subscription already exists
        const existing = await prisma.pushSubscription.findFirst({
            where: { endpoint: subscription.endpoint },
        });

        if (existing) {
            return { success: true, message: "Already subscribed" };
        }

        await prisma.pushSubscription.create({
            data: {
                endpoint: subscription.endpoint,
                keys: JSON.parse(JSON.stringify(subscription.keys)),
                adminId: admins[0].id, // Default to first admin for now or current logged in 
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Subscription error:", error);
        return { success: false, error: "Failed to subscribe" };
    }
}

export async function sendNotificationToAdmins(message: string, url: string = "/admin/orders") {
    try {
        const subscriptions = await prisma.pushSubscription.findMany();

        const payload = JSON.stringify({
            title: "New Order!",
            body: message,
            url: url,
        });

        const notifications = subscriptions.map((sub: any) => {
            // @ts-ignore
            return webPush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys as any
            }, payload).catch(error => {
                if (error.statusCode === 410) {
                    // Subscription expired, remove it
                    prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
                console.error("Error sending notification", error);
            });
        });

        await Promise.all(notifications);
        return { success: true };
    } catch (error) {
        console.error("Notification send error:", error);
        return { success: false };
    }
}
