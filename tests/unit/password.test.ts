import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/password";

describe("validatePasswordStrength", () => {
  it("accepts a strong password", () => {
    expect(validatePasswordStrength("Testpass123")).toEqual([]);
  });
  it("rejects short passwords", () => {
    expect(validatePasswordStrength("Ab1")).toContain("Use at least 10 characters.");
  });
  it("requires a mix of character classes", () => {
    expect(validatePasswordStrength("alllowercase1")).toContain("Include an uppercase letter.");
    expect(validatePasswordStrength("ALLUPPERCASE1")).toContain("Include a lowercase letter.");
    expect(validatePasswordStrength("NoNumbersHere")).toContain("Include a number.");
  });
});

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("Testpass123");
    expect(hash).not.toContain("Testpass123");
    expect(await verifyPassword("Testpass123", hash)).toBe(true);
    expect(await verifyPassword("Testpass124", hash)).toBe(false);
  });
});

describe("validation schemas", () => {
  it("normalises and validates signup input", async () => {
    const { signupSchema } = await import("@/lib/validation");
    const parsed = signupSchema.parse({
      name: "  Ada  ",
      email: "ADA@Example.COM ",
      password: "Testpass123",
      courseSlug: "python",
    });
    expect(parsed.name).toBe("Ada");
    expect(parsed.email).toBe("ada@example.com");
  });

  it("rejects a quiz question with no correct option", async () => {
    const { questionInputSchema } = await import("@/lib/validation");
    const result = questionInputSchema.safeParse({
      quizId: "q1",
      prompt: "Which is right?",
      explanation: "Because.",
      options: [
        { text: "a", isCorrect: false },
        { text: "b", isCorrect: false },
      ],
    });
    expect(result.success).toBe(false);
  });
});
