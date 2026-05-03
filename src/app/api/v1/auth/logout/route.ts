import { successResponse } from "@/lib/api";

/**
 * POST /api/v1/auth/logout
 *
 * JWT is stateless — actual token invalidation happens client-side.
 * This endpoint simply confirms the logout request and returns success.
 */
export async function POST() {
  return successResponse(null);
}
