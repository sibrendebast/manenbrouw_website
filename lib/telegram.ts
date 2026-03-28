const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

function getBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
    }
    return token;
}

function getChatId(): string {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
        throw new Error("TELEGRAM_CHAT_ID is not set in environment variables");
    }
    return chatId;
}

export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
    try {
        const token = getBotToken();
        const chatId = getChatId();

        const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML",
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API error:", data);
            return { success: false, error: data.description || "Unknown Telegram error" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Failed to send Telegram message:", error);
        return { success: false, error: error.message || String(error) };
    }
}

interface OrderItem {
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface OrderTicket {
    quantity: number;
    totalPrice: number;
    event: {
        title: string;
    };
}

interface Order {
    orderNumber?: string | null;
    customerName: string;
    customerEmail: string;
    shippingMethod: string;
    totalAmount: number;
    items: OrderItem[];
    tickets: OrderTicket[];
    comment?: string | null;
}

export async function sendTelegramOrderNotification(order: Order): Promise<{ success: boolean; error?: string }> {
    const lines: string[] = [];

    lines.push(`🛒 <b>Nieuwe bestelling${order.orderNumber ? ` #${order.orderNumber}` : ""}</b>`);
    lines.push("");
    lines.push(`👤 ${order.customerName}`);
    lines.push(`📧 ${order.customerEmail}`);
    lines.push(`🚚 ${order.shippingMethod === "shipment" ? "Verzending" : "Afhalen"}`);

    if (order.items.length > 0) {
        lines.push("");
        lines.push("<b>Producten:</b>");
        for (const item of order.items) {
            lines.push(`  • ${item.quantity}x ${item.product.name} — €${item.price.toFixed(2)}`);
        }
    }

    if (order.tickets.length > 0) {
        lines.push("");
        lines.push("<b>Tickets:</b>");
        for (const ticket of order.tickets) {
            lines.push(`  • ${ticket.quantity}x ${ticket.event.title} — €${ticket.totalPrice.toFixed(2)}`);
        }
    }

    if (order.comment) {
        lines.push("");
        lines.push(`💬 ${order.comment}`);
    }

    lines.push("");
    lines.push(`💰 <b>Totaal: €${order.totalAmount.toFixed(2)}</b>`);

    return sendTelegramMessage(lines.join("\n"));
}
