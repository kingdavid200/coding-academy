import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { AdminPageTitle } from "@/components/admin/AdminUI";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <AdminPageTitle
        title="Settings"
        description="Platform-wide configuration."
      />
      <SettingsForm defaultPassingScore={settings.defaultPassingScore} />
    </div>
  );
}
