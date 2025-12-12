import { prisma } from "./prisma";

/**
 * Generates a new order number in the format YYYY/####
 * where YYYY is the current year and #### is a sequential number starting from 0001
 */
export async function generateOrderNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `${currentYear}/`;

    // Find the highest order number for the current year
    const lastOrder = await prisma.order.findFirst({
        where: {
            orderNumber: {
                startsWith: yearPrefix,
            },
        },
        orderBy: {
            orderNumber: "desc",
        },
        select: {
            orderNumber: true,
        },
    });

    let nextNumber = 1;

    if (lastOrder?.orderNumber) {
        // Extract the number part from YYYY/####
        const numberPart = lastOrder.orderNumber.split("/")[1];
        nextNumber = parseInt(numberPart, 10) + 1;
    }

    // Format the number with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, "0");

    return `${yearPrefix}${formattedNumber}`;
}
