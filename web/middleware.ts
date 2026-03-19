import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  let wallet = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production"
      );
      const { payload } = await jwtVerify(token, secret);
      wallet = payload.wallet;
    } catch (err) {
      // Invalid or expired token
    }
  }

  // Protect all dashboard routes
  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/workspace") ||
    request.nextUrl.pathname.startsWith("/auditor") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isDashboardRoute && !wallet) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";

  if (wallet && isAuthPage) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/auditor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
