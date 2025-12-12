import { prisma } from "../lib/prisma";
import { Order } from "@prisma/client";

async function listOrders() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Show last 20 orders
        });

        console.log("\n📦 Recent Orders:\n");
        console.log("─".repeat(100));

        for (const order of orders) {
            const hasInvoice = order.invoiceUrl ? "✅" : "❌";
            const date = new Date(order.createdAt).toLocaleString();

            console.log(`${hasInvoice} Order ID: ${order.id}`);
            console.log(`   Customer: ${order.customerName} (${order.customerEmail})`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Total: €${order.totalAmount.toFixed(2)}`);
            console.log(`   Date: ${date}`);
            console.log(`   Invoice: ${order.invoiceUrl || "Not generated"}`);
            console.log("─".repeat(100));
        }

        const ordersWithoutInvoice = orders.filter((o: Order) => !o.invoiceUrl && o.status === "paid");

        if (ordersWithoutInvoice.length > 0) {
            console.log(`\n⚠️  ${ordersWithoutInvoice.length} paid order(s) without invoice:\n`);
            ordersWithoutInvoice.forEach((order: Order) => {
                console.log(`   npx tsx scripts/generate-invoice-for-order.ts ${order.id}`);
            });
        } else {
            console.log("\n✅ All paid orders have invoices!");
        }
    } catch (error) {
        console.error("Error listing orders:", error);
    } finally {
        await prisma.$disconnect();
    }
}

listOrders();
