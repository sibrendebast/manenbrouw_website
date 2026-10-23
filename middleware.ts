import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyAdminToken } from "@/lib/session-core";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (pathname.startsWith("/admin")) {
        const isLoginPage = pathname === "/admin/login";
        const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        const session = token ? await verifyAdminToken(token) : null;

        if (isLoginPage) {
            // If already logged in, redirect away from login page to dashboard
            if (session) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }
            return NextResponse.next();
        }

        // For all other /admin routes, require a valid session
        if (!session) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
