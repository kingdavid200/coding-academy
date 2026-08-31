import type { ModuleState } from "@/lib/progression";
import { Badge } from "@/components/ui/Feedback";

const map: Record<ModuleState, { tone: "success" | "info" | "neutral" | "warning"; label: string }> = {
  COMPLETED: { tone: "success", label: "Completed" },
  IN_PROGRESS: { tone: "warning", label: "In progress" },
  AVAILABLE: { tone: "info", label: "Available" },
  LOCKED: { tone: "neutral", label: "Locked" },
};

export function ModuleStatusBadge({ state }: { state: ModuleState }) {
  const { tone, label } = map[state];
  return (
    <Badge tone={tone}>
      <LockGlyph state={state} />
      {label}
    </Badge>
  );
}

function LockGlyph({ state }: { state: ModuleState }) {
  if (state === "LOCKED") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (state === "COMPLETED") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m5 13 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}
