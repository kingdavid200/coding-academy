import "server-only";
import { db } from "@/lib/db";
import { DEFAULT_PASSING_SCORE } from "@/config/site";

/** Reads the single AppSetting row, creating it with defaults on first use. */
export async function getSettings() {
  const existing = await db.appSetting.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return db.appSetting.create({
    data: { id: 1, defaultPassingScore: DEFAULT_PASSING_SCORE },
  });
}

export async function getDefaultPassingScore(): Promise<number> {
  const settings = await getSettings();
  return settings.defaultPassingScore;
}

export async function updateDefaultPassingScore(value: number) {
  return db.appSetting.upsert({
    where: { id: 1 },
    update: { defaultPassingScore: value },
    create: { id: 1, defaultPassingScore: value },
  });
}
