import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/rbac";
import { ChangePasswordSchema } from "@/lib/validators/auth";

/**
 * PATCH /api/v1/auth/password
 * Change the authenticated user's password.
 */
export async function PATCH(req: NextRequest) {
  let user: ReturnType<typeof getCurrentUser>;
  try {
    user = getCurrentUser(req);
  } catch {
    return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "요청 본문이 올바른 JSON이 아닙니다.", 400);
  }

  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "필드 유효성 검사 실패",
      400,
      parsed.error.issues,
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const salesRep = await prisma.salesRep.findUnique({
    where: { id: user.id },
    select: { id: true, passwordHash: true },
  });

  if (!salesRep) {
    return errorResponse("NOT_FOUND", "사용자를 찾을 수 없습니다.", 404);
  }

  const isValid = await comparePassword(currentPassword, salesRep.passwordHash);
  if (!isValid) {
    return errorResponse(
      "INVALID_CREDENTIALS",
      "현재 비밀번호가 올바르지 않습니다.",
      401,
    );
  }

  const newHash = await hashPassword(newPassword);

  await prisma.salesRep.update({
    where: { id: salesRep.id },
    data: { passwordHash: newHash },
  });

  return successResponse(null);
}
