import { describe, it, expect } from "vitest";
import {
  computePercentage,
  didPass,
  deriveModuleStates,
  courseProgressPercent,
  currentModuleId,
  type ModuleLike,
  type ModuleProgressLike,
} from "@/lib/progression";

const modules: ModuleLike[] = [
  { id: "m1", order: 1, title: "Module 1", passingScore: 80 },
  { id: "m2", order: 2, title: "Module 2", passingScore: 80 },
  { id: "m3", order: 3, title: "Module 3", passingScore: 80 },
];

function progress(overrides: Partial<ModuleProgressLike> & { moduleId: string }): ModuleProgressLike {
  return {
    bestScore: 0,
    attemptsCount: 0,
    passed: false,
    startedAt: null,
    ...overrides,
  };
}

describe("computePercentage", () => {
  it("rounds to the nearest whole percent", () => {
    expect(computePercentage(4, 5)).toBe(80);
    expect(computePercentage(3, 5)).toBe(60);
    expect(computePercentage(5, 6)).toBe(83);
    expect(computePercentage(1, 3)).toBe(33);
  });
  it("returns 0 when there are no questions", () => {
    expect(computePercentage(0, 0)).toBe(0);
  });
});

describe("didPass", () => {
  it("passes at exactly the threshold", () => {
    expect(didPass(80, 80)).toBe(true);
  });
  it("fails one point below", () => {
    expect(didPass(79, 80)).toBe(false);
  });
});

describe("deriveModuleStates", () => {
  it("opens only the first module for a brand-new student", () => {
    const states = deriveModuleStates(modules, []);
    expect(states.map((s) => s.state)).toEqual(["AVAILABLE", "LOCKED", "LOCKED"]);
    expect(states[1].lockReason).toContain('"Module 1"');
    expect(states[1].lockReason).toContain("80%");
  });

  it("keeps the next module locked when the previous one is failed", () => {
    const states = deriveModuleStates(modules, [
      progress({ moduleId: "m1", bestScore: 60, attemptsCount: 2, passed: false, startedAt: new Date() }),
    ]);
    expect(states[0].state).toBe("IN_PROGRESS");
    expect(states[1].state).toBe("LOCKED");
  });

  it("unlocks the next module once the previous is passed", () => {
    const states = deriveModuleStates(modules, [
      progress({ moduleId: "m1", bestScore: 80, attemptsCount: 1, passed: true }),
    ]);
    expect(states[0].state).toBe("COMPLETED");
    expect(states[1].state).toBe("AVAILABLE");
    expect(states[2].state).toBe("LOCKED");
  });

  it("does not skip a locked module even if a later one somehow has progress", () => {
    // Simulates a tampered/stale row for m3 while m2 is not passed.
    const states = deriveModuleStates(modules, [
      progress({ moduleId: "m1", bestScore: 90, passed: true }),
      progress({ moduleId: "m3", bestScore: 100, passed: true }),
    ]);
    expect(states[1].state).toBe("AVAILABLE");
    expect(states[2].state).toBe("LOCKED");
  });

  it("respects a custom passing score", () => {
    const custom: ModuleLike[] = [
      { id: "a", order: 1, title: "A", passingScore: 50 },
      { id: "b", order: 2, title: "B", passingScore: 50 },
    ];
    const states = deriveModuleStates(custom, [
      progress({ moduleId: "a", bestScore: 55, passed: true }),
    ]);
    expect(states[1].state).toBe("AVAILABLE");
  });
});

describe("courseProgressPercent", () => {
  it("is the share of completed modules", () => {
    const derived = deriveModuleStates(modules, [
      progress({ moduleId: "m1", bestScore: 80, passed: true }),
    ]);
    expect(courseProgressPercent(derived)).toBe(33);
  });
  it("is 100 when everything is passed", () => {
    const derived = deriveModuleStates(
      modules,
      modules.map((m) => progress({ moduleId: m.id, passed: true, bestScore: 100 })),
    );
    expect(courseProgressPercent(derived)).toBe(100);
  });
});

describe("currentModuleId", () => {
  it("points at the first available module", () => {
    const derived = deriveModuleStates(modules, [
      progress({ moduleId: "m1", passed: true, bestScore: 90 }),
    ]);
    expect(currentModuleId(derived)).toBe("m2");
  });
  it("prefers an in-progress module", () => {
    const derived = deriveModuleStates(modules, [
      progress({ moduleId: "m1", passed: true, bestScore: 90 }),
      progress({ moduleId: "m2", startedAt: new Date(), attemptsCount: 1 }),
    ]);
    expect(currentModuleId(derived)).toBe("m2");
  });
});
