import { prisma } from "../lib/prisma";
import { generateInvoice } from "../lib/invoice";
import { uploadToCloudinary } from "../lib/cloudinary";

async function regenerateAllInvoices() {
    try {
        console.log("Fetching all paid orders...\n");

        const orders = await prisma.order.findMany({
            where: {
                status: "paid",
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                tickets: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`Found ${orders.length} paid orders\n`);

        let successCount = 0;
        let failCount = 0;

        for (const order of orders) {
            try {
                console.log(`Processing order ${order.id}...`);

                // Generate invoice PDF
                const invoicePdf = await generateInvoice(order);

                // Upload to Cloudinary with .pdf extension handled by format
                const orderNumberSafe = order.orderNumber ? order.orderNumber.replace(/\//g, "-") : order.id;
                // For image type, public_id should not have extension if we want clean delivery
                const invoicePublicId = `invoice-${orderNumberSafe}`;
                const uploadResult = await uploadToCloudinary(invoicePdf, "invoices", "image", invoicePublicId);
                const invoiceUrl = uploadResult.secure_url;

                // Update order with invoice URL
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        invoiceUrl: invoiceUrl,
                    },
                });

                console.log(`✅ Invoice regenerated for order ${order.id}`);
                console.log(`   URL: ${invoiceUrl}\n`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to regenerate invoice for order ${order.id}:`, error);
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

regenerateAllInvoices();
