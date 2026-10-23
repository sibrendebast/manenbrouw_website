export const SESSION_COOKIE_NAME = "mb_admin_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AdminSession {
    userId: string;
    username: string;
    exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

let cachedKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;
    const secret =
        process.env.ADMIN_SESSION_SECRET ||
        process.env.DATABASE_URL ||
        "man-en-brouw-secure-auth-secret-key-32chars-fallback";

    cachedKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
    return cachedKey;
}

export async function createAdminToken(userId: string, username: string): Promise<string> {
    const sessionData: AdminSession = {
        userId,
        username,
        exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
    };

    const payloadBase64 = base64UrlEncode(encoder.encode(JSON.stringify(sessionData)));
    const key = await getCryptoKey();
    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(payloadBase64) as unknown as BufferSource
    );
    const signatureBase64 = base64UrlEncode(new Uint8Array(signatureBuffer));

    return `${payloadBase64}.${signatureBase64}`;
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
    try {
        if (!token || typeof token !== "string") return null;

        const parts = token.split(".");
        if (parts.length !== 2) return null;

        const [payloadBase64, signatureBase64] = parts;
        const key = await getCryptoKey();

        const signatureBytes = base64UrlDecode(signatureBase64);
        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            signatureBytes as unknown as BufferSource,
            encoder.encode(payloadBase64) as unknown as BufferSource
        );

        if (!isValid) {
            return null;
        }

        const jsonStr = decoder.decode(base64UrlDecode(payloadBase64));
        const session: AdminSession = JSON.parse(jsonStr);

        if (!session.exp || session.exp < Date.now()) {
            return null; // Expired
        }

        return session;
    } catch {
        return null;
    }
}
