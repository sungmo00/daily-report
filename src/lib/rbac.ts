import { type NextRequest, NextResponse } from "next/server";
import type { Role } from "@/types";

export type { Role };

export interface CurrentUser {
  id: number;
  role: Role;
}

/**
 * Extract the authenticated user from request headers.
 * These headers are injected by middleware.ts after JWT verification.
 * Throws if headers are missing (should not happen on guarded routes).
 */
export function getCurrentUser(req: NextRequest): CurrentUser {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");

  if (!userId || !userRole) {
    throw new Error("인증 정보가 요청 헤더에 없습니다.");
  }

  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    throw new Error("x-user-id 헤더가 유효한 숫자가 아닙니다.");
  }

  if (!["rep", "manager", "admin"].includes(userRole)) {
    throw new Error("x-user-role 헤더가 유효한 역할이 아닙니다.");
  }

  return { id, role: userRole as Role };
}

/**
 * Check that the authenticated user has one of the required roles.
 * Returns the CurrentUser on success, or a 403 NextResponse on failure.
 *
 * Usage in a route handler:
 *   const userOrError = requireRole(req, "manager", "admin");
 *   if (userOrError instanceof NextResponse) return userOrError;
 */
export function requireRole(
  req: NextRequest,
  ...roles: Role[]
): CurrentUser | NextResponse {
  let user: CurrentUser;

  try {
    user = getCurrentUser(req);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." },
      },
      { status: 401 },
    );
  }

  if (!roles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "접근 권한이 없습니다." },
      },
      { status: 403 },
    );
  }

  return user;
}
