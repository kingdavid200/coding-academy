import { db } from "@/lib/db";
import { ok, badRequest } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { settingsSchema } from "@/lib/validation";
import { updateDefaultPassingScore } from "@/lib/settings";

export const POST = adminRoute(async ({ req }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = settingsSchema.parse(json);

  const updated = await updateDefaultPassingScore(data.defaultPassingScore);

  let modulesUpdated = 0;
  if (data.applyToExistingModules) {
    const result = await db.module.updateMany({
      data: { passingScore: data.defaultPassingScore },
    });
    modulesUpdated = result.count;
  }

  return ok({ defaultPassingScore: updated.defaultPassingScore, modulesUpdated });
});
