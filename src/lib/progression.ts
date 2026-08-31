/**
 * Pure module-progression rules. No database access here so the logic can be
 * unit-tested in isolation. The server is the only place these run — the client
 * never decides whether a module is unlocked.
 */

export type ModuleState = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export type ModuleLike = {
  id: string;
  order: number;
  title: string;
  passingScore: number;
};

export type ModuleProgressLike = {
  moduleId: string;
  bestScore: number;
  attemptsCount: number;
  passed: boolean;
  startedAt: Date | string | null;
};

export type DerivedModule = {
  moduleId: string;
  order: number;
  state: ModuleState;
  bestScore: number;
  attemptsCount: number;
  passed: boolean;
  /** Present only when state is LOCKED. */
  lockReason?: string;
  /** The module that must be passed first (when locked). */
  blockedBy?: { title: string; passingScore: number };
};

export function computePercentage(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export function didPass(percentage: number, passingScore: number): boolean {
  return percentage >= passingScore;
}

/**
 * Given every module in a course (any order) and the student's progress rows,
 * work out the state of each module. A module unlocks only when the previous
 * module in `order` has been passed.
 */
export function deriveModuleStates(
  modules: ModuleLike[],
  progress: ModuleProgressLike[],
): DerivedModule[] {
  const ordered = [...modules].sort((a, b) => a.order - b.order);
  const byModule = new Map(progress.map((p) => [p.moduleId, p]));

  const result: DerivedModule[] = [];
  let previousPassed = true; // there is no module before the first one

  for (let i = 0; i < ordered.length; i++) {
    const mod = ordered[i];
    const p = byModule.get(mod.id);
    const bestScore = p?.bestScore ?? 0;
    const attemptsCount = p?.attemptsCount ?? 0;
    const passed = p?.passed ?? false;
    const started = Boolean(p?.startedAt) || attemptsCount > 0;

    let state: ModuleState;
    let lockReason: string | undefined;
    let blockedBy: DerivedModule["blockedBy"];

    if (!previousPassed) {
      state = "LOCKED";
      const prev = ordered[i - 1];
      blockedBy = { title: prev.title, passingScore: prev.passingScore };
      lockReason = `Score at least ${prev.passingScore}% on the "${prev.title}" assessment to unlock this module.`;
    } else if (passed) {
      state = "COMPLETED";
    } else if (started) {
      state = "IN_PROGRESS";
    } else {
      state = "AVAILABLE";
    }

    result.push({
      moduleId: mod.id,
      order: mod.order,
      state,
      bestScore,
      attemptsCount,
      passed,
      lockReason,
      blockedBy,
    });

    previousPassed = passed;
  }

  return result;
}

export function isModuleAccessible(state: ModuleState): boolean {
  return state !== "LOCKED";
}

/** Overall course completion as a percentage of completed modules. */
export function courseProgressPercent(derived: DerivedModule[]): number {
  if (derived.length === 0) return 0;
  const done = derived.filter((d) => d.state === "COMPLETED").length;
  return Math.round((done / derived.length) * 100);
}

/** The module a student should continue with: first not-completed, accessible one. */
export function currentModuleId(derived: DerivedModule[]): string | null {
  const ordered = [...derived].sort((a, b) => a.order - b.order);
  const inProgress = ordered.find((d) => d.state === "IN_PROGRESS");
  if (inProgress) return inProgress.moduleId;
  const available = ordered.find((d) => d.state === "AVAILABLE");
  if (available) return available.moduleId;
  const lastCompleted = [...ordered].reverse().find((d) => d.state === "COMPLETED");
  return lastCompleted?.moduleId ?? ordered[0]?.moduleId ?? null;
}
