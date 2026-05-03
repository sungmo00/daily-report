import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/types";
import { signToken, verifyToken, hashPassword, comparePassword } from "@/lib/auth";
import { middleware } from "@/middleware";
import { requireRole } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Prisma mock — must be defined before importing route handlers
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    salesRep: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as loginPOST } from "@/app/api/v1/auth/login/route";
import { POST as logoutPOST } from "@/app/api/v1/auth/logout/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Unit tests: JWT utilities
// ---------------------------------------------------------------------------

describe("JWT utilities", () => {
  it("signToken 으로 발급한 토큰을 verifyToken 으로 검증한다", () => {
    const payload = { sub: 1, email: "hong@example.com", role: "rep" as Role };
    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.sub).toBe(1);
    expect(decoded.email).toBe("hong@example.com");
    expect(decoded.role).toBe("rep");
  });

  it("잘못된 토큰은 verifyToken 에서 에러를 던진다", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("만료된 토큰은 verifyToken 에서 에러를 던진다", async () => {
    // Create a token that expires in -1 seconds (already expired)
    // We directly sign a token with a negative expiresIn via the underlying library
    const jwt = await import("jsonwebtoken");
    const expiredToken = jwt.default.sign(
      { sub: 1, email: "hong@example.com", role: "rep" },
      process.env.JWT_SECRET!,
      { expiresIn: -1 },
    );
    expect(() => verifyToken(expiredToken)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Unit tests: password utilities
// ---------------------------------------------------------------------------

describe("password utilities", () => {
  it("hashPassword 는 bcrypt 해시를 반환한다", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("comparePassword 는 올바른 비밀번호에 true 를 반환한다", async () => {
    const hash = await hashPassword("password123");
    expect(await comparePassword("password123", hash)).toBe(true);
  });

  it("comparePassword 는 잘못된 비밀번호에 false 를 반환한다", async () => {
    const hash = await hashPassword("password123");
    expect(await comparePassword("wrongpassword", hash)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Integration-style tests: POST /api/v1/auth/login
// ---------------------------------------------------------------------------

describe("POST /api/v1/auth/login", () => {
  const mockFindFirst = prisma.salesRep.findFirst as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("올바른 자격증명으로 로그인하면 200과 accessToken을 반환한다", async () => {
    const plainPassword = "password123";
    const hash = await hashPassword(plainPassword);

    mockFindFirst.mockResolvedValueOnce({
      id: 1,
      name: "홍길동",
      email: "hong@example.com",
      role: "rep",
      passwordHash: hash,
    });

    const req = makeRequest({ email: "hong@example.com", password: plainPassword });
    const res = await loginPOST(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.tokenType).toBe("Bearer");
    expect(body.data.user.id).toBe(1);
    expect(body.data.user.role).toBe("rep");
  });

  it("잘못된 비밀번호로 로그인하면 401 INVALID_CREDENTIALS를 반환한다", async () => {
    const hash = await hashPassword("correctpassword");

    mockFindFirst.mockResolvedValueOnce({
      id: 1,
      name: "홍길동",
      email: "hong@example.com",
      role: "rep",
      passwordHash: hash,
    });

    const req = makeRequest({ email: "hong@example.com", password: "wrongpassword" });
    const res = await loginPOST(req as never);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("존재하지 않는 이메일로 로그인하면 401 INVALID_CREDENTIALS를 반환한다", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = makeRequest({ email: "nobody@example.com", password: "password123" });
    const res = await loginPOST(req as never);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("이메일 형식이 아닌 경우 400 VALIDATION_ERROR를 반환한다", async () => {
    const req = makeRequest({ email: "not-an-email", password: "password123" });
    const res = await loginPOST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("비밀번호가 8자 미만이면 400 VALIDATION_ERROR를 반환한다", async () => {
    const req = makeRequest({ email: "hong@example.com", password: "short" });
    const res = await loginPOST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// Integration-style tests: POST /api/v1/auth/logout
// ---------------------------------------------------------------------------

describe("POST /api/v1/auth/logout", () => {
  it("로그아웃 요청에 200과 null data를 반환한다", async () => {
    const res = await logoutPOST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unit tests: middleware — 인증 보호
// ---------------------------------------------------------------------------

describe("middleware", () => {
  it("토큰 없이 보호된 API 호출 시 401 UNAUTHORIZED를 반환한다", async () => {
    const req = new NextRequest("http://localhost/api/v1/reports");
    const res = middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("만료된 토큰으로 보호된 API 호출 시 401 INVALID_TOKEN을 반환한다", async () => {
    const jwt = await import("jsonwebtoken");
    const expiredToken = jwt.default.sign(
      { sub: 1, email: "hong@example.com", role: "rep" },
      process.env.JWT_SECRET!,
      { expiresIn: -1 },
    );
    const req = new NextRequest("http://localhost/api/v1/reports", {
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    const res = middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_TOKEN");
  });
});

// ---------------------------------------------------------------------------
// Unit tests: requireRole — 역할 기반 접근 제어
// ---------------------------------------------------------------------------

describe("requireRole", () => {
  it("rep 역할로 requireRole('admin') 호출 시 403 FORBIDDEN NextResponse를 반환한다", async () => {
    const req = new NextRequest("http://localhost/api/v1/test", {
      headers: {
        "x-user-id": "1",
        "x-user-role": "rep",
      },
    });
    const result = requireRole(req, "admin");

    expect(result instanceof NextResponse).toBe(true);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    }
  });
});
