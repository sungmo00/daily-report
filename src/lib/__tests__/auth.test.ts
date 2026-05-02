import { describe, it, expect } from "vitest";
import { signToken, verifyToken, hashPassword, comparePassword } from "../auth";

describe("auth utilities", () => {
  describe("JWT", () => {
    it("signToken 으로 발급한 토큰을 verifyToken 으로 검증한다", () => {
      const payload = { sub: 1, role: "rep" };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.sub).toBe(1);
      expect(decoded.role).toBe("rep");
    });

    it("잘못된 토큰은 verifyToken 에서 에러를 던진다", () => {
      expect(() => verifyToken("invalid.token.here")).toThrow();
    });
  });

  describe("password", () => {
    it("hashPassword 는 bcrypt 해시를 반환한다", async () => {
      const hash = await hashPassword("password123");
      expect(hash).not.toBe("password123");
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it("comparePassword 는 올바른 비밀번호에 true 를 반환한다", async () => {
      const hash = await hashPassword("password123");
      const result = await comparePassword("password123", hash);
      expect(result).toBe(true);
    });

    it("comparePassword 는 잘못된 비밀번호에 false 를 반환한다", async () => {
      const hash = await hashPassword("password123");
      const result = await comparePassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });
});
