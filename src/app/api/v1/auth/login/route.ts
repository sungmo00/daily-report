import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";
import { LoginSchema } from "@/lib/validators/auth";
import type { Role } from "@/types";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "요청 본문이 올바른 JSON이 아닙니다.", 400);
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "필드 유효성 검사 실패",
      400,
      parsed.error.issues,
    );
  }

  const { email, password } = parsed.data;

  const salesRep = await prisma.salesRep.findFirst({
    where: { email, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!salesRep) {
    return errorResponse(
      "INVALID_CREDENTIALS",
      "이메일 또는 비밀번호가 올바르지 않습니다.",
      401,
    );
  }

  const isValid = await comparePassword(password, salesRep.passwordHash);
  if (!isValid) {
    return errorResponse(
      "INVALID_CREDENTIALS",
      "이메일 또는 비밀번호가 올바르지 않습니다.",
      401,
    );
  }

  const token = signToken({ sub: salesRep.id, role: salesRep.role as Role });

  return successResponse(
    {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? "86400", 10),
      user: {
        id: salesRep.id,
        name: salesRep.name,
        email: salesRep.email,
        role: salesRep.role,
      },
    },
    200,
  );
}
