import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// API routes that do not require authentication
const PUBLIC_API_PATHS = new Set(["/api/v1/auth/login"]);

// Page routes that are accessible without authentication
const PUBLIC_PAGE_PATHS = new Set(["/login"]);

// Page route prefixes that require authentication
const PROTECTED_PAGE_PREFIXES = [
  "/dashboard",
  "/reports",
  "/customers",
  "/notifications",
  "/sales-reps",
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── API route protection ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." },
        },
        { status: 401 },
      );
    }

    try {
      const payload = verifyToken(token);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", String(payload.sub));
      requestHeaders.set("x-user-role", payload.role);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "유효하지 않은 토큰입니다." },
        },
        { status: 401 },
      );
    }
  }

  // ── Page route protection ─────────────────────────────────────────────────
  let isAuthenticated = false;
  const rawToken = request.cookies.get("auth-token")?.value;
  if (rawToken) {
    try {
      verifyToken(rawToken);
      isAuthenticated = true;
    } catch {
      // Invalid or expired token — treat as unauthenticated
    }
  }

  // Authenticated user accessing /login → redirect to /dashboard
  if (PUBLIC_PAGE_PATHS.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user accessing a protected page → redirect to /login
  const isProtected = PROTECTED_PAGE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (rawToken) {
      response.cookies.delete("auth-token");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/login",
    "/dashboard/:path*",
    "/reports/:path*",
    "/customers/:path*",
    "/notifications/:path*",
    "/sales-reps/:path*",
  ],
};
