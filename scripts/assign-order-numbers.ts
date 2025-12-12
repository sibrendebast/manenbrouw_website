import { prisma } from "../lib/prisma";

async function assignOrderNumbers() {
    try {
        console.log("Fetching all orders without order numbers...\n");

        const orders = await prisma.order.findMany({
            where: {
                orderNumber: null,
            },
            orderBy: {
                createdAt: "asc", // Process oldest first
            },
        });

        console.log(`Found ${orders.length} orders without order numbers\n`);

        let successCount = 0;
        let failCount = 0;

        for (const order of orders) {
            try {
                const year = new Date(order.createdAt).getFullYear();
                const yearPrefix = `${year}/`;

                // Find the highest order number for this year
                const lastOrderInYear = await prisma.order.findFirst({
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

                if (lastOrderInYear?.orderNumber) {
                    const numberPart = lastOrderInYear.orderNumber.split("/")[1];
                    nextNumber = parseInt(numberPart, 10) + 1;
                }

                const formattedNumber = nextNumber.toString().padStart(4, "0");
                const orderNumber = `${yearPrefix}${formattedNumber}`;

                // Update order with order number
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        orderNumber: orderNumber,
                    },
                });

                console.log(`✅ Assigned ${orderNumber} to order ${order.id} (${new Date(order.createdAt).toLocaleDateString()})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to assign order number to ${order.id}:`, error);
                failCount++;
            }
        }

        console.log("\n" + "=".repeat(80));
        console.log(`Summary: ${successCount} successful, ${failCount} failed`);
        console.log("=".repeat(80));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

assignOrderNumbers();
