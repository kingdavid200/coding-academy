"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export function SettingsForm({ defaultPassingScore }: { defaultPassingScore: number }) {
  const { run, pending, error, fieldErrors, message } = useAdminMutation();
  const [value, setValue] = useState(defaultPassingScore);
  const [applyToExistingModules, setApply] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await run(
      "/api/admin/settings",
      { defaultPassingScore: Number(value), applyToExistingModules },
      { successMessage: "Settings saved." },
    );
  }

  return (
    <Card>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        {message ? <Alert tone="success" className="mb-4">{message}</Alert> : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field
            label="Default passing percentage"
            htmlFor="passing"
            hint="Applied to newly created modules. Each module can still override this."
            error={fieldErrors.defaultPassingScore}
          >
            <Input
              id="passing"
              type="number"
              min={1}
              max={100}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="max-w-32"
            />
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={applyToExistingModules}
              onChange={(e) => setApply(e.target.checked)}
              className="mt-0.5"
            />
            Also set every existing module to this passing percentage
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
