import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Role } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");

const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN ?? "86400", 10);

export interface JwtPayload {
  sub: number;
  role: Role;
  iat?: number;
  exp?: number;
}

const JwtPayloadSchema = z.object({
  sub: z.number().int(),
  role: z.enum(["rep", "manager", "admin"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  const raw = jwt.verify(token, JWT_SECRET!);
  return JwtPayloadSchema.parse(raw);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
