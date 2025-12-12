import jsPDF from "jspdf";
import "jspdf-autotable";
import { Order, OrderItem, EventTicket } from "@prisma/client";

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

type OrderWithItems = Order & {
    items: (OrderItem & { product: { name: string } })[];
    tickets: EventTicket[];
};

export async function generateInvoice(order: OrderWithItems): Promise<Buffer> {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const companyName = process.env.COMPANY_NAME || "Man en Brouw";
    const companyAddress = process.env.COMPANY_ADDRESS || "Brouwerijstraat 1, 9999 Brouwersdam";
    const companyEmail = process.env.COMPANY_EMAIL || "info@manenbrouw.be";

    // Add header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, margin, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(companyAddress, margin, 40);
    doc.text(companyEmail, margin, 45);

    // Add invoice details
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Factuur", pageWidth - margin, 30, { align: "right" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Factuurnummer: ${order.id}`, pageWidth - margin, 40, { align: "right" });
    doc.text(`Datum: ${order.createdAt.toLocaleDateString("nl-BE")}`, pageWidth - margin, 45, { align: "right" });

    // Add customer details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Klantgegevens", margin, 70);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(order.customerName, margin, 80);
    doc.text(order.customerEmail, margin, 85);
    if (order.shippingMethod === "shipment" && order.shippingAddress) {
        try {
            const address = JSON.parse(order.shippingAddress);
            doc.text(`${address.street}`, margin, 90);
            doc.text(`${address.zip} ${address.city}`, margin, 95);
        } catch (e) {
            doc.text("Verzendadres onbekend", margin, 90);
        }
    } else {
        doc.text("Afhalen bij de brouwerij", margin, 90);
    }

    // Prepare table data
    const tableData = [
        ...order.items.map(item => [
            item.product.name,
            item.quantity,
            `€${item.price.toFixed(2)}`,
            `€${(item.quantity * item.price).toFixed(2)}`
        ]),
        ...order.tickets.map(ticket => [
            `Ticket: ${ticket.buyerName}`, // Simplified, might need more event details
            ticket.quantity,
            `€${(ticket.totalPrice / ticket.quantity).toFixed(2)}`,
            `€${ticket.totalPrice.toFixed(2)}`
        ])
    ];

    // Add table
    doc.autoTable({
        startY: 110,
        head: [['Beschrijving', 'Aantal', 'Prijs per stuk', 'Totaal']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
    });

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const shippingCost = order.shippingMethod === "shipment" ? parseFloat(process.env.SHIPPING_COST || "10") : 0;
    const subtotal = order.totalAmount - shippingCost;

    doc.setFontSize(12);
    doc.text(`Subtotaal: €${subtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: "right" });
    doc.text(`Verzending: €${shippingCost.toFixed(2)}`, pageWidth - margin, finalY + 5, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`Totaal: €${order.totalAmount.toFixed(2)}`, pageWidth - margin, finalY + 15, { align: "right" });

    // Return as buffer
    const pdfBuffer = doc.output("arraybuffer");
    return Buffer.from(pdfBuffer);
}
