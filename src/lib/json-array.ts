/**
 * Several text columns (objectives, outcomes) hold a JSON array of strings so
 * the schema stays portable between SQLite and PostgreSQL. These helpers keep
 * the parsing in one place and never throw.
 */

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function serializeStringArray(items: string[]): string {
  return JSON.stringify(items.map((s) => s.trim()).filter(Boolean));
}
