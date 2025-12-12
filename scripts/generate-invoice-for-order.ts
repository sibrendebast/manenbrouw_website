import { prisma } from "../lib/prisma";
import { generateInvoice } from "../lib/invoice";
import { uploadToCloudinary } from "../lib/cloudinary";

async function generateInvoiceForOrder(orderId: string) {
    try {
        console.log(`Fetching order ${orderId}...`);

        // Fetch the order with all relations
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                tickets: true,
            },
        });

        if (!order) {
            console.error(`Order ${orderId} not found`);
            return;
        }

        console.log(`Generating invoice for order ${orderId}...`);

        // Generate invoice PDF
        const invoicePdf = await generateInvoice(order);
        console.log("Invoice PDF generated successfully");

        // Upload to Cloudinary
        console.log("Uploading to Cloudinary...");
        const orderNumberSafe = order.orderNumber ? order.orderNumber.replace(/\//g, "-") : order.id;
        // For "image" resource type (PDFs), we don't need the extension in the public_id
        const invoicePublicId = `invoice-${orderNumberSafe}`;

        // Pass "image" as resource_type. Cloudinary treats PDFs as images for delivery purposes.
        const uploadResult = await uploadToCloudinary(invoicePdf, "invoices", "image", invoicePublicId);
        const invoiceUrl = uploadResult.secure_url;
        console.log(`Invoice uploaded: ${invoiceUrl}`);

        // Update order with invoice URL
        await prisma.order.update({
            where: { id: orderId },
            data: {
                invoiceUrl: invoiceUrl,
            },
        });

        console.log(`✅ Invoice generated and saved for order ${orderId}`);
        console.log(`Invoice URL: ${invoiceUrl}`);
    } catch (error) {
        console.error("Error generating invoice:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get order ID from command line arguments
const orderId = process.argv[2];

if (!orderId) {
    console.error("Please provide an order ID");
    console.log("Usage: npx tsx scripts/generate-invoice-for-order.ts <order-id>");
    process.exit(1);
}

generateInvoiceForOrder(orderId);
