const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export function escapeHtml(text: string | null | undefined): string {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function getCredentials(): { token: string; chatId: string } | null {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
        console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in environment variables");
        return null;
    }
    return { token, chatId };
}

export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
    try {
        const credentials = getCredentials();
        if (!credentials) {
            return { success: false, error: "Telegram bot is not configured" };
        }

        const response = await fetch(`${TELEGRAM_API_BASE}${credentials.token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: credentials.chatId,
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

export interface OrderItem {
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

export interface OrderTicket {
    quantity: number;
    totalPrice: number;
    event: {
        title: string;
    };
}

export interface OrderNotificationData {
    orderNumber?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    shippingMethod: string;
    shippingAddress?: string | null;
    totalAmount: number;
    items?: OrderItem[];
    tickets?: OrderTicket[];
    comment?: string | null;
}

export async function sendTelegramOrderNotification(order: OrderNotificationData): Promise<{ success: boolean; error?: string }> {
    const lines: string[] = [];

    const orderRef = order.orderNumber ? ` #${escapeHtml(order.orderNumber)}` : "";
    lines.push(`🛒 <b>Nieuwe bestelling${orderRef}</b>`);
    lines.push("");
    lines.push(`👤 <b>Klant:</b> ${escapeHtml(order.customerName)}`);
    lines.push(`📧 <b>E-mail:</b> ${escapeHtml(order.customerEmail)}`);
    if (order.customerPhone) {
        lines.push(`📞 <b>Tel:</b> ${escapeHtml(order.customerPhone)}`);
    }

    if (order.shippingMethod === "shipment") {
        let addressText = "";
        if (order.shippingAddress) {
            try {
                const addr = JSON.parse(order.shippingAddress);
                const parts = [addr.street, `${addr.zip || ""} ${addr.city || ""}`.trim(), addr.country].filter(Boolean);
                addressText = parts.length > 0 ? ` (${escapeHtml(parts.join(", "))})` : "";
            } catch {
                addressText = ` (${escapeHtml(order.shippingAddress)})`;
            }
        }
        lines.push(`🚚 <b>Levering:</b> Verzending${addressText}`);
    } else {
        lines.push(`🚚 <b>Levering:</b> Afhalen bij brouwerij`);
    }

    if (order.items && order.items.length > 0) {
        lines.push("");
        lines.push("<b>Producten:</b>");
        for (const item of order.items) {
            lines.push(`  • ${item.quantity}x ${escapeHtml(item.product.name)} — €${item.price.toFixed(2)}`);
        }
    }

    if (order.tickets && order.tickets.length > 0) {
        lines.push("");
        lines.push("<b>Tickets:</b>");
        for (const ticket of order.tickets) {
            lines.push(`  • ${ticket.quantity}x ${escapeHtml(ticket.event.title)} — €${ticket.totalPrice.toFixed(2)}`);
        }
    }

    if (order.comment && order.comment.trim()) {
        lines.push("");
        lines.push("📝 <b>Opmerking van klant:</b>");
        lines.push(`<i>"${escapeHtml(order.comment.trim())}"</i>`);
    }

    lines.push("");
    lines.push(`💰 <b>Totaal: €${order.totalAmount.toFixed(2)}</b>`);

    return sendTelegramMessage(lines.join("\n"));
}

export interface TastingBookingNotificationData {
    bookingNumber?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    requestedDate?: Date | string | null;
    scheduledDate?: Date | string | null;
    scheduledTime?: string | null;
    peopleCount: number;
    formula: string;
    keepGlass?: boolean;
    locationType?: string;
    address?: string | null;
    totalPrice?: number | null;
    customerMessage?: string | null;
}

export async function sendTelegramTastingNotification(booking: TastingBookingNotificationData): Promise<{ success: boolean; error?: string }> {
    const lines: string[] = [];

    const bookingRef = booking.bookingNumber ? ` [${escapeHtml(booking.bookingNumber)}]` : "";
    lines.push(`🍷 <b>Nieuwe proeverij aanvraag${bookingRef}</b>`);
    lines.push("");
    lines.push(`👤 <b>Klant:</b> ${escapeHtml(booking.customerName)}`);
    lines.push(`📧 <b>E-mail:</b> ${escapeHtml(booking.customerEmail)}`);
    if (booking.customerPhone) {
        lines.push(`📞 <b>Tel:</b> ${escapeHtml(booking.customerPhone)}`);
    }

    const dateToFormat = booking.scheduledDate || booking.requestedDate;
    let formattedDate = "-";
    if (dateToFormat) {
        const d = typeof dateToFormat === "string" ? new Date(dateToFormat) : dateToFormat;
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("nl-BE", { weekday: "short", year: "numeric", month: "long", day: "numeric" });
        }
    }
    const timeStr = booking.scheduledTime ? ` om ${escapeHtml(booking.scheduledTime)}` : "";
    lines.push(`📅 <b>Datum:</b> ${formattedDate}${timeStr}`);
    lines.push(`👥 <b>Aantal personen:</b> ${booking.peopleCount}`);
    lines.push(`🍺 <b>Formule:</b> ${escapeHtml(booking.formula)}`);
    lines.push(`🥂 <b>Glazen meenemen:</b> ${booking.keepGlass ? "Ja (+€5 p.p.)" : "Nee"}`);

    const locType = booking.locationType || "Brouwerij";
    const locAddress = booking.address ? ` (${escapeHtml(booking.address)})` : "";
    lines.push(`📍 <b>Locatie:</b> ${escapeHtml(locType)}${locAddress}`);

    if (booking.totalPrice !== undefined && booking.totalPrice !== null) {
        lines.push(`💰 <b>Richtprijs:</b> €${booking.totalPrice.toFixed(2)}`);
    }

    if (booking.customerMessage && booking.customerMessage.trim()) {
        lines.push("");
        lines.push("📝 <b>Bericht / Opmerkingen:</b>");
        lines.push(`<i>"${escapeHtml(booking.customerMessage.trim())}"</i>`);
    }

    return sendTelegramMessage(lines.join("\n"));
}

export async function sendTelegramAdminAlert(title: string, message: string, url?: string): Promise<{ success: boolean; error?: string }> {
    const lines: string[] = [];
    lines.push(`🔔 <b>${escapeHtml(title)}</b>`);
    lines.push("");
    lines.push(escapeHtml(message));
    if (url) {
        lines.push("");
        lines.push(`🔗 <a href="https://www.manenbrouw.be${escapeHtml(url)}">Bekijk in beheer</a>`);
    }
    return sendTelegramMessage(lines.join("\n"));
}
