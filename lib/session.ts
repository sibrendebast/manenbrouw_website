import { cookies } from "next/headers";
import {
    SESSION_COOKIE_NAME,
    SESSION_DURATION_SECONDS,
    AdminSession,
    createAdminToken,
    verifyAdminToken,
} from "./session-core";

export {
    SESSION_COOKIE_NAME,
    SESSION_DURATION_SECONDS,
    type AdminSession,
    createAdminToken,
    verifyAdminToken,
};

export async function setAdminSession(userId: string, username: string): Promise<void> {
    const token = await createAdminToken(userId, username);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_SECONDS,
        path: "/",
    });
}

export async function getAdminSession(): Promise<AdminSession | null> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(SESSION_COOKIE_NAME);
        if (!cookie || !cookie.value) return null;
        return await verifyAdminToken(cookie.value);
    } catch {
        return null;
    }
}

export async function clearAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAdminSession(): Promise<AdminSession> {
    const session = await getAdminSession();
    if (!session) {
        throw new Error("Unauthorized: Admin privileges required.");
    }
    return session;
}
