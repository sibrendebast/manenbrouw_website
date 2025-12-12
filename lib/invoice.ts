import fs from 'fs';
import path from 'path';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, OrderItem, EventTicket } from "@prisma/client";

// Extend jsPDF with the autoTable method
declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

type OrderWithItems = Order & {
    orderNumber?: string | null;
    items: (OrderItem & { product: { name: string } })[];
    tickets: EventTicket[];
};

// --- Configuration: Edit Company Details Here ---
const COMPANY_DETAILS = {
    name: process.env.COMPANY_NAME || "Man en Brouw",
    addressLine1: "Aarschotsesteenweg 179",
    addressLine2: "3012 Leuven",
    email: process.env.COMPANY_EMAIL || "info@manenbrouw.be",
    vat: "BE 0778.696.105",
};

export async function generateInvoice(order: OrderWithItems): Promise<Buffer> {
    const doc = new jsPDF();

    // Colors
    const breweryGreen = "#56c99b";
    const breweryDark = "#333333";
    const white = "#ffffff";
    const black = "#000000";

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // --- Header Section (Green Box) ---
    const headerHeight = 50;
    doc.setFillColor(breweryGreen);
    doc.rect(0, 0, pageWidth, headerHeight, "F"); // Header background

    // Logo (Centered)
    try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath);
            // Original size: 574x253 (Ratio ~2.27)
            const logoWidth = 60; // Increased from 40
            const logoHeight = 26.4; // Increased from 17.6
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = (headerHeight - logoHeight) / 2; // Vertically center in header

            doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);
        }
    } catch (error) {
        console.error("Failed to load logo for invoice:", error);
    }

    // Invoice Details (Top Right in Header)
    doc.setTextColor(white);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Right alignment calculation
    const rightMargin = pageWidth - margin;

    doc.text(`Factuurnummer:`, rightMargin, 20, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`${order.orderNumber || order.id}`, rightMargin, 25, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(`Datum:`, rightMargin, 35, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`${order.createdAt.toLocaleDateString("nl-BE")}`, rightMargin, 40, { align: "right" });


    // --- Info Boxes (Side by Side) ---
    const boxY = headerHeight + 10; // 60
    const gap = 10;
    const boxWidth = (pageWidth - (margin * 2) - gap) / 2;
    const boxHeight = 40;

    const leftBoxX = margin;
    const rightBoxX = margin + boxWidth + gap;

    // Draw Boxes
    doc.setDrawColor(black);
    doc.setLineWidth(0.5); // Increased from 0.1
    doc.rect(leftBoxX, boxY, boxWidth, boxHeight);
    doc.rect(rightBoxX, boxY, boxWidth, boxHeight);

    // Left Box Content (Brewery Info)
    doc.setTextColor(black);
    doc.setFontSize(10);

    let currentY = boxY + 8;
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_DETAILS.name, leftBoxX + 5, currentY);

    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY_DETAILS.addressLine1, leftBoxX + 5, currentY);

    currentY += 5;
    doc.text(COMPANY_DETAILS.addressLine2, leftBoxX + 5, currentY);

    currentY += 5;
    doc.text(COMPANY_DETAILS.vat, leftBoxX + 5, currentY);

    currentY += 5;
    doc.text(COMPANY_DETAILS.email, leftBoxX + 5, currentY);


    // Right Box Content (Customer Info)
    currentY = boxY + 8;
    doc.setFont("helvetica", "bold");
    doc.text("Klantgegevens", rightBoxX + 5, currentY); // Header

    currentY += 6;
    doc.text(order.customerName, rightBoxX + 5, currentY);

    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.text(order.customerEmail, rightBoxX + 5, currentY);

    currentY += 5;
    if (order.shippingMethod === "shipment" && order.shippingAddress) {
        try {
            const address = JSON.parse(order.shippingAddress);
            doc.text(`${address.street}`, rightBoxX + 5, currentY);
            currentY += 5;
            doc.text(`${address.zip} ${address.city}`, rightBoxX + 5, currentY);
        } catch (e) {
            doc.text("Verzendadres onbekend", rightBoxX + 5, currentY);
        }
    } else {
        doc.text("Afhalen bij de brouwerij", rightBoxX + 5, currentY);
    }

    // --- Items Table ---
    const tableData = [
        ...order.items.map(item => {
            const vatRate = item.btwCategory || 21;
            return [
                item.product.name,
                `${vatRate}%`, // BTW Column
                item.quantity,
                `€ ${item.price.toFixed(2)}`,
                `€ ${(item.quantity * item.price).toFixed(2)}`
            ];
        }),
        ...order.tickets.map(ticket => [
            `Ticket: ${ticket.buyerName}`,
            "21%", // Tickets usually 21% unless stated otherwise
            ticket.quantity,
            `€ ${(ticket.totalPrice / ticket.quantity).toFixed(2)}`,
            `€ ${ticket.totalPrice.toFixed(2)}`
        ])
    ];

    autoTable(doc, {
        startY: boxY + boxHeight + 10,
        margin: { left: margin, right: margin },
        head: [['Beschrijving', 'BTW', 'Aantal', 'Prijs per stuk', 'Totaal']],
        body: tableData,
        theme: 'grid', // 'grid' gives us the borders we want
        headStyles: {
            fillColor: breweryGreen,
            textColor: white,
            lineColor: black,
            lineWidth: 0.1,
            fontStyle: 'bold'
        },
        bodyStyles: {
            lineColor: black,
            lineWidth: 0.1,
            textColor: black
        },
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Description
            1: { cellWidth: 15, halign: 'center' }, // BTW
            2: { cellWidth: 20, halign: 'center' }, // Quantity
            3: { cellWidth: 30, halign: 'right' }, // Price
            4: { cellWidth: 30, halign: 'right' } // Total
        }
    });

    // --- Totals Box ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    // Calculate totals
    let totalExclVat = 0;
    const vatTotals: Record<number, number> = {};

    // Process Items
    order.items.forEach(item => {
        const rate = item.btwCategory || 21;
        const totalIncVat = item.price * item.quantity;
        const vatAmount = totalIncVat - (totalIncVat / (1 + rate / 100));
        const amountExclVat = totalIncVat - vatAmount;

        totalExclVat += amountExclVat;
        vatTotals[rate] = (vatTotals[rate] || 0) + vatAmount;
    });

    // Process Tickets (Assuming 21% for now)
    order.tickets.forEach(ticket => {
        const rate = 21;
        const totalIncVat = ticket.totalPrice;
        const vatAmount = totalIncVat - (totalIncVat / (1 + rate / 100));
        const amountExclVat = totalIncVat - vatAmount;

        totalExclVat += amountExclVat;
        vatTotals[rate] = (vatTotals[rate] || 0) + vatAmount;
    });

    const shippingCost = order.shippingMethod === "shipment" && order.totalAmount > 0
        ? parseFloat(process.env.SHIPPING_COST || "10")
        : 0;

    // Add shipping to totals (Shipping usually 21% in BE)
    if (shippingCost > 0) {
        const rate = 21;
        const vatAmount = shippingCost - (shippingCost / (1 + rate / 100));
        const amountExclVat = shippingCost - vatAmount;

        totalExclVat += amountExclVat;
        vatTotals[rate] = (vatTotals[rate] || 0) + vatAmount;
    }

    // Sort VAT rates
    const sortedRates = Object.keys(vatTotals).map(Number).sort((a, b) => a - b);

    // Draw Totals Box
    const totalsBoxWidth = 80;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth;
    const totalsBoxY = finalY;
    // Dynamic height based on number of VAT categories
    const totalsBoxHeight = 25 + (sortedRates.length * 5) + 15;

    doc.setDrawColor(black);
    doc.setLineWidth(0.5);
    doc.rect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight);

    // Totals Text
    const textRightX = pageWidth - margin - 5;
    const labelX = totalsBoxX + 5;
    currentY = totalsBoxY + 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Total Excl. BTW
    doc.text("Totaal Excl. BTW:", labelX, currentY);
    doc.text(`€ ${totalExclVat.toFixed(2)}`, textRightX, currentY, { align: "right" });
    currentY += 5;

    // VAT Breakdown
    sortedRates.forEach(rate => {
        doc.text(`BTW ${rate}%:`, labelX, currentY);
        doc.text(`€ ${vatTotals[rate].toFixed(2)}`, textRightX, currentY, { align: "right" });
        currentY += 5;
    });

    // Shipping
    if (shippingCost > 0) {
        doc.text("Verzending:", labelX, currentY);
        doc.text(`€ ${shippingCost.toFixed(2)}`, textRightX, currentY, { align: "right" });
        currentY += 5;
    }

    // Divider Line inside box
    doc.line(totalsBoxX, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 10;

    // Total Incl. BTW
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Totaal Incl. BTW:", labelX, currentY);
    doc.text(`€ ${order.totalAmount.toFixed(2)}`, textRightX, currentY, { align: "right" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Bedankt voor je bestelling!", pageWidth / 2, pageHeight - 15, { align: "center" });

    // Return as buffer
    const pdfBuffer = doc.output("arraybuffer");
    return Buffer.from(pdfBuffer);
}
