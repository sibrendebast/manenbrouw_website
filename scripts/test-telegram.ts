/**
 * Test script for Telegram bot integration.
 * 
 * Usage: npx tsx --env-file=.env scripts/test-telegram.ts
 * 
 * If TELEGRAM_CHAT_ID is not set, this script will try to discover it
 * by calling getUpdates on the bot. You need to send a message to the bot first.
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

async function main() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error("❌ TELEGRAM_BOT_TOKEN is not set in .env");
        process.exit(1);
    }

    console.log("✅ TELEGRAM_BOT_TOKEN found");

    let chatId = process.env.TELEGRAM_CHAT_ID;

    // If no chat ID, try to discover it
    if (!chatId) {
        console.log("\n⚠️  TELEGRAM_CHAT_ID is not set. Trying to discover it via getUpdates...");
        console.log("   (Make sure you've sent a message to the bot first!)\n");

        const response = await fetch(`${TELEGRAM_API_BASE}${token}/getUpdates`);
        const data = await response.json();

        if (!data.ok) {
            console.error("❌ Failed to call getUpdates:", data.description);
            process.exit(1);
        }

        if (data.result.length === 0) {
            console.error("❌ No updates found. Please send a message to your bot first, then run this script again.");
            process.exit(1);
        }

        // Get the chat ID from the most recent message
        const lastUpdate = data.result[data.result.length - 1];
        chatId = String(lastUpdate.message?.chat?.id || lastUpdate.channel_post?.chat?.id);

        if (!chatId || chatId === "undefined") {
            console.error("❌ Could not extract chat ID from updates. Raw data:");
            console.log(JSON.stringify(data.result, null, 2));
            process.exit(1);
        }

        console.log(`✅ Discovered chat ID: ${chatId}`);
        console.log(`\n   Add this to your .env file:`);
        console.log(`   TELEGRAM_CHAT_ID=${chatId}\n`);
    } else {
        console.log(`✅ TELEGRAM_CHAT_ID found: ${chatId}`);
    }

    // Send a test message
    console.log("📤 Sending test message...\n");

    const testMessage = [
        "🧪 <b>Test bericht van Man & Brouw</b>",
        "",
        "Dit is een test om te controleren of de Telegram bot correct werkt.",
        "",
        `📅 ${new Date().toLocaleString("nl-BE")}`,
    ].join("\n");

    const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: testMessage,
            parse_mode: "HTML",
        }),
    });

    const data = await response.json();

    if (data.ok) {
        console.log("✅ Test message sent successfully! Check your Telegram.");
    } else {
        console.error("❌ Failed to send message:", data.description);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
});
