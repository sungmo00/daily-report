import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (classnames merge)", () => {
  it("클래스를 병합한다", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("Tailwind 충돌 클래스를 마지막 것으로 덮어쓴다", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("falsy 값은 무시한다", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });
});
