import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "paid"
            },
            select: {
                id: true,
                orderNumber: true,
                customerName: true,
                status: true,
                invoiceUrl: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        return NextResponse.json({
            success: true,
            count: orders.length,
            orders: orders,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        }, { status: 500 });
    }
}
