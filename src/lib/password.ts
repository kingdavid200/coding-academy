import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Password policy, enforced on signup and password change.
 * Returns a list of human-readable problems (empty === valid).
 */
export function validatePasswordStrength(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 10) problems.push("Use at least 10 characters.");
  if (password.length > 200) problems.push("That password is too long.");
  if (!/[a-z]/.test(password)) problems.push("Include a lowercase letter.");
  if (!/[A-Z]/.test(password)) problems.push("Include an uppercase letter.");
  if (!/[0-9]/.test(password)) problems.push("Include a number.");
  if (/^\s|\s$/.test(password)) problems.push("Remove leading or trailing spaces.");
  return problems;
}
