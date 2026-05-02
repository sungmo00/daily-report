import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/api/v1/auth/login", "/login"];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only guard API routes here; page routes are guarded client-side
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." } },
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
      { success: false, error: { code: "INVALID_TOKEN", message: "유효하지 않은 토큰입니다." } },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
