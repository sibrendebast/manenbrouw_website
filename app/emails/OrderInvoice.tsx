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

interface OrderInvoiceProps {
    order: {
        id: string;
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
        }[];
    };
}

export const OrderInvoice = ({ order }: OrderInvoiceProps) => {
    const shippingAddress = order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null;

    return (
        <Html>
            <Head />
            <Preview>Order Invoice #{order.id.slice(0, 8)} - Man & Brouw</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Row>
                            <Column>
                                <Heading style={heading}>Man & Brouw</Heading>
                                <Text style={paragraph}>
                                    Mechelsesteenweg 291<br />
                                    1800 Vilvoorde<br />
                                    Belgium<br />
                                    <Link href="mailto:info@manenbrouw.be">info@manenbrouw.be</Link>
                                </Text>
                            </Column>
                            <Column align="right">
                                <Text style={heading}>INVOICE</Text>
                                <Text style={paragraph}>
                                    Order #{order.id.slice(0, 8)}<br />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row>
                            <Column>
                                <Text style={subHeading}>Bill To:</Text>
                                <Text style={paragraph}>
                                    {order.customerName}<br />
                                    {order.customerEmail}<br />
                                    {order.customerPhone}
                                </Text>
                            </Column>
                            <Column>
                                <Text style={subHeading}>Ship To:</Text>
                                <Text style={paragraph}>
                                    {order.shippingMethod === "pickup" ? (
                                        "Pickup at Brewery"
                                    ) : shippingAddress ? (
                                        <>
                                            {shippingAddress.street}<br />
                                            {shippingAddress.zip} {shippingAddress.city}<br />
                                            {shippingAddress.country}
                                        </>
                                    ) : (
                                        "N/A"
                                    )}
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Section>
                        <Text style={subHeading}>Payment Method</Text>
                        <Text style={{ ...paragraph, textTransform: "capitalize" }}>
                            {order.paymentMethod || "N/A"}
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row style={{ marginBottom: "10px" }}>
                            <Column style={{ width: "50%" }}><Text style={tableHeader}>Item</Text></Column>
                            <Column style={{ width: "15%", textAlign: "center" }}><Text style={tableHeader}>Qty</Text></Column>
                            <Column style={{ width: "15%", textAlign: "right" }}><Text style={tableHeader}>Price</Text></Column>
                            <Column style={{ width: "20%", textAlign: "right" }}><Text style={tableHeader}>Total</Text></Column>
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
                                <Column style={{ width: "50%" }}><Text style={tableCell}>Shipping</Text></Column>
                                <Column style={{ width: "15%", textAlign: "center" }}><Text style={tableCell}>1</Text></Column>
                                <Column style={{ width: "15%", textAlign: "right" }}><Text style={tableCell}>€10.00</Text></Column>
                                <Column style={{ width: "20%", textAlign: "right" }}><Text style={tableCell}>€10.00</Text></Column>
                            </Row>
                        )}
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Row>
                            <Column align="right">
                                <Text style={totalText}>Total: €{order.totalAmount.toFixed(2)}</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Text style={footer}>
                            Thank you for your business!<br />
                            If you have any questions, please contact us at info@manenbrouw.be
                        </Text>
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
    padding: "20px 0 48px",
    width: "580px",
};

const heading = {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0",
};

const subHeading = {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 8px",
    color: "#484848",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px",
    color: "#484848",
};

const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
};

const tableHeader = {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#484848",
};

const tableCell = {
    fontSize: "14px",
    color: "#484848",
};

const totalText = {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0",
};

const footer = {
    color: "#9ca299",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center" as const,
};
