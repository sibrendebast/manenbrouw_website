import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";
import { calculateBtwBreakdown } from "@/lib/btw";

interface OrderInvoiceProps {
    order: {
        id: string;
        orderNumber?: string | null;
        locale?: string;
        createdAt: Date;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        shippingAddress: string;
        shippingMethod: string;
        paymentMethod: string;
        totalAmount: number;
        items: {
            product: {
                name: string;
            };
            quantity: number;
            price: number;
            btwCategory: number;
        }[];
    };
}

// Simple translation dictionary for email
const translations = {
    en: {
        invoiceTitle: "INVOICE",
        orderDate: "Order Date",
        billTo: "Bill To",
        shipTo: "Ship To",
        pickup: "Pickup at Brewery",
        shipping: "Shipping",
        paymentMethod: "Payment Method",
        item: "Item",
        qty: "Qty",
        price: "Price",
        total: "Total",
        vatDetails: "VAT Details (prices include VAT)",
        includedVat: "Included VAT {rate}% on €{amount}",
        totalLabel: "Total",
        footer: "Thank you for your business!<br />If you have any questions, please contact us at info@manenbrouw.be",
        orderNumber: "Order #",
        nA: "N/A"
    },
    nl: {
        invoiceTitle: "FACTUUR",
        orderDate: "Datum",
        billTo: "Factuuradres",
        shipTo: "Leveradres",
        pickup: "Ophalen bij brouwerij",
        shipping: "Verzending",
        paymentMethod: "Betaalmethode",
        item: "Item",
        qty: "Aantal",
        price: "Prijs",
        total: "Totaal",
        vatDetails: "BTW Details (prijzen inclusief BTW)",
        includedVat: "Inclusief BTW {rate}% op €{amount}",
        totalLabel: "Totaal",
        footer: "Bedankt voor je bestelling!<br />Vragen? Mail naar info@manenbrouw.be",
        orderNumber: "Bestelling #",
        nA: "N/A"
    }
};

export const OrderInvoice = ({ order }: OrderInvoiceProps) => {
    const locale = (order.locale as 'en' | 'nl') || 'nl';
    const t = translations[locale] || translations.nl;

    const shippingAddress = order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null;

    // Calculate BTW breakdown using shared utility
    const itemsForBtw = order.items.map(item => ({
        price: item.price,
        quantity: item.quantity,
        btwCategory: item.btwCategory
    }));

    if (order.shippingMethod === "shipment") {
        itemsForBtw.push({
            price: 10.00,
            quantity: 1,
            btwCategory: 21 // Shipping is standard 21% VAT
        });
    }

    const btwBreakdown = calculateBtwBreakdown(itemsForBtw);

    return (
        <Html>
            <Head />
            <Preview>Order Invoice #{order.orderNumber || order.id.slice(0, 8)} - Man & Brouw</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Row>
                            <Column>
                                <Heading style={heading}>Man & Brouw</Heading>
                                <Text style={paragraph}>
                                    Aarschotsesteenweg 179<br />
                                    3012 Wilsele<br />
                                    Belgium<br />
                                    <Link href="mailto:info@manenbrouw.be">info@manenbrouw.be</Link>
                                </Text>
                            </Column>
                            <Column align="right">
                                <Text style={accentHeading}>{t.invoiceTitle}</Text>
                                <Text style={paragraph}>
                                    {t.orderNumber}{order.orderNumber || order.id.slice(0, 8)}<br />
                                    {new Date(order.createdAt).toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-GB')}
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row>
                            <Column>
                                <Text style={subHeading}>{t.billTo}:</Text>
                                <Text style={paragraph}>
                                    {order.customerName}<br />
                                    {order.customerEmail}<br />
                                    {order.customerPhone}
                                </Text>
                            </Column>
                            <Column>
                                <Text style={subHeading}>{t.shipTo}:</Text>
                                <Text style={paragraph}>
                                    {order.shippingMethod === "pickup" ? (
                                        t.pickup
                                    ) : shippingAddress ? (
                                        <>
                                            {shippingAddress.street}<br />
                                            {shippingAddress.zip} {shippingAddress.city}<br />
                                            {shippingAddress.country}
                                        </>
                                    ) : (
                                        t.nA
                                    )}
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Section>
                        <Text style={subHeading}>{t.paymentMethod}</Text>
                        <Text style={{ ...paragraph, textTransform: "capitalize" }}>
                            {order.paymentMethod || t.nA}
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row style={{ marginBottom: "10px" }}>
                            <Column style={{ width: "50%" }}><Text style={tableHeader}>{t.item}</Text></Column>
                            <Column style={{ width: "15%", textAlign: "center" }}><Text style={tableHeader}>{t.qty}</Text></Column>
                            <Column style={{ width: "15%", textAlign: "right" }}><Text style={tableHeader}>{t.price}</Text></Column>
                            <Column style={{ width: "20%", textAlign: "right" }}><Text style={tableHeader}>{t.total}</Text></Column>
                        </Row>
                        {order.items.map((item, index) => (
                            <Row key={index} style={{ marginBottom: "10px" }}>
                                <Column style={{ width: "50%" }}><Text style={tableCell}>{item.product.name}</Text></Column>
                                <Column style={{ width: "15%", textAlign: "center" }}><Text style={tableCell}>{item.quantity}</Text></Column>
                                <Column style={{ width: "15%", textAlign: "right" }}><Text style={tableCell}>€{item.price.toFixed(2)}</Text></Column>
                                <Column style={{ width: "20%", textAlign: "right" }}><Text style={tableCell}>€{(item.price * item.quantity).toFixed(2)}</Text></Column>
                            </Row>
                        ))}
                        {order.shippingMethod === "shipment" && (
                            <Row style={{ marginBottom: "10px" }}>
                                <Column style={{ width: "50%" }}><Text style={tableCell}>{t.shipping}</Text></Column>
                                <Column style={{ width: "15%", textAlign: "center" }}><Text style={tableCell}>1</Text></Column>
                                <Column style={{ width: "15%", textAlign: "right" }}><Text style={tableCell}>€10.00</Text></Column>
                                <Column style={{ width: "20%", textAlign: "right" }}><Text style={tableCell}>€10.00</Text></Column>
                            </Row>
                        )}
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Text style={subHeading}>{t.vatDetails}</Text>
                        {btwBreakdown.map((btw, index) => (
                            <Row key={index} style={{ marginBottom: "5px" }}>
                                <Column style={{ width: "70%" }}><Text style={tableCell}>{t.includedVat.replace('{rate}', btw.category.toString()).replace('{amount}', btw.subtotal.toFixed(2))}</Text></Column>
                                <Column style={{ width: "30%", textAlign: "right" }}><Text style={tableCell}>€{btw.btw.toFixed(2)}</Text></Column>
                            </Row>
                        ))}
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row>
                            <Column align="right">
                                <Text style={totalText}>{t.totalLabel}: €{order.totalAmount.toFixed(2)}</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Text style={footer} dangerouslySetInnerHTML={{ __html: t.footer }} />
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderInvoice;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "40px 20px",
    width: "100%",
    maxWidth: "600px",
    border: "2px solid #000000",
    backgroundColor: "#ffffff",
};

const heading = {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0",
    color: "#000000",
};

const accentHeading = {
    ...heading,
    color: "#56c99b",
};

const subHeading = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 12px",
    color: "#56c99b",
    textTransform: "uppercase" as const,
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 16px",
    color: "#000000",
};

const hr = {
    borderColor: "#000000",
    borderWidth: "2px",
    margin: "24px 0",
};

const tableHeader = {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase" as const,
    borderBottom: "2px solid #000000",
    paddingBottom: "8px",
};

const tableCell = {
    fontSize: "15px",
    color: "#000000",
    paddingTop: "8px",
    paddingBottom: "8px",
};

const totalText = {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0",
    color: "#56c99b",
};

const footer = {
    color: "#666666",
    fontSize: "14px",
    marginTop: "20px",
    textAlign: "center" as const,
};
