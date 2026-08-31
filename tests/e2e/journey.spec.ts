import { test, expect, type Page } from "@playwright/test";

const PY_M1_CORRECT: Record<string, string> = {
  "Which command shows the installed Python 3 version?": "python3 --version",
  "What does REPL stand for?": "Read-Evaluate-Print Loop",
  "In a .py file, what does the line  5 + 5  display when you run it?": "Nothing is displayed",
  'What is printed by:  print("x", "y", sep="-")': "x-y",
  "When reading a Python traceback, where is the most specific information?": "The last line",
};

function uniqueEmail() {
  return `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function signup(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Learner");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: false }).fill("Testpass123");
  await page.getByRole("radio", { name: "python" }).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard");
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const CORRECT_BY_NORM = new Map(
  Object.entries(PY_M1_CORRECT).map(([q, a]) => [norm(q), a]),
);

async function answerQuiz(page: Page, mode: "pass" | "fail") {
  const questions = page.locator("form fieldset");
  await questions.first().waitFor();
  const count = await questions.count();
  for (let i = 0; i < count; i++) {
    const fieldset = questions.nth(i);
    const legend = norm(
      (await fieldset.locator("legend").innerText()).replace(/^\d+\.\s*/, ""),
    );
    const correct = CORRECT_BY_NORM.get(legend);
    expect(correct, `known answer for "${legend}"`).toBeTruthy();
    const options = fieldset.locator("label");
    const optCount = await options.count();
    let chosen = false;
    for (let j = 0; j < optCount; j++) {
      const text = (await options.nth(j).innerText()).trim();
      const wantCorrect = mode === "pass" || i < 1; // fail mode: only Q1 right -> 20%
      if (wantCorrect ? text === correct : text !== correct) {
        await options.nth(j).locator("input[type=radio]").check();
        chosen = true;
        break;
      }
    }
    expect(chosen, `picked an option for "${legend}"`).toBe(true);
  }
}

test.describe("student journey", () => {
  test("signup, locked modules, failing then passing the assessment, unlock, logout", async ({
    page,
  }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    // Module 1 available, module 2 locked.
    await page.goto("/learn/python");
    await expect(page.getByRole("heading", { name: "Python", exact: true })).toBeVisible();
    await expect(
      page.locator("li", { hasText: "Getting Started with Python" }).getByText("Available").first(),
    ).toBeVisible();
    await expect(
      page.locator("li", { hasText: "Variables and Data Types" }).getByText("Locked").first(),
    ).toBeVisible();

    // Direct URL to a locked module shows the lock message, not the content.
    await page.goto("/learn/python/variables-and-types/numbers-and-strings");
    await expect(page.getByText("This lesson is locked")).toBeVisible();

    // Read a lesson and mark it complete.
    await page.goto("/learn/python/getting-started/what-is-python");
    await page.getByRole("button", { name: "Mark as read" }).click();
    await expect(page.getByText("Marked as read")).toBeVisible();

    // Fail the assessment.
    await page.goto("/learn/python/getting-started/quiz");
    await expect(page.getByRole("heading", { name: /assessment/i })).toBeVisible();
    await answerQuiz(page, "fail");
    await page.getByRole("button", { name: "Submit assessment" }).click();
    await expect(page.getByText("Not passed")).toBeVisible();
    await expect(page.getByText(/Not quite there yet/)).toBeVisible();

    // Module 2 still locked.
    await page.goto("/learn/python");
    await expect(
      page.locator("li", { hasText: "Variables and Data Types" }).getByText("Locked").first(),
    ).toBeVisible();

    // Pass the assessment.
    await page.goto("/learn/python/getting-started/quiz");
    await answerQuiz(page, "pass");
    await page.getByRole("button", { name: "Submit assessment" }).click();
    await expect(page.getByText("Passed")).toBeVisible();
    await expect(page.getByText(/Module complete/)).toBeVisible();

    // Module 2 now unlocked.
    await page.goto("/learn/python");
    await expect(
      page.locator("li", { hasText: "Variables and Data Types" }).first(),
    ).not.toContainText("Locked");
    await expect(
      page.locator("li", { hasText: "Variables and Data Types" }).first().getByText("Available"),
    ).toBeVisible();

    // Logout.
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/login**");
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });
});

test.describe("authorization", () => {
  test("students cannot reach the admin area or admin APIs", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await page.goto("/admin");
    await page.waitForURL("**/dashboard");

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const post = await request.post("/api/admin/courses", {
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      data: { slug: "x", title: "xx", language: "X", tagline: "tt", description: "aaaaaaaaaaa" },
    });
    expect(post.status()).toBe(403);

    const settings = await request.post("/api/admin/settings", {
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      data: { defaultPassingScore: 10 },
    });
    expect(settings.status()).toBe(403);
  });

  test("anonymous requests to protected APIs are rejected", async ({ request }) => {
    expect((await request.post("/api/admin/settings", { data: {} })).status()).toBe(401);
    expect((await request.post("/api/lessons/abc/complete", { data: {} })).status()).toBe(401);
  });

  test("the whole site is private — every page redirects a signed-out visitor to login", async ({
    page,
  }) => {
    for (const path of ["/", "/courses", "/courses/python", "/how-it-works", "/about", "/dashboard"]) {
      await page.goto(path);
      await page.waitForURL("**/login**");
    }
    // The auth pages themselves stay reachable.
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("admin can sign in and see the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("admin@codingacademy.test");
    await page.getByLabel("Password").fill("Admin!Passw0rd");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText(/Students/).first()).toBeVisible();
  });
});

test.describe("quiz score integrity", () => {
  test("a forged high score in the request body is ignored", async ({ page, request }) => {
    const email = uniqueEmail();
    await signup(page, email);
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const start = await request.post("/api/quiz/python/getting-started/start", {
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      data: {},
    });
    const { attemptId, questions } = await start.json();

    // Send every answer wrong, but also try to smuggle score fields.
    const submit = await request.post(`/api/quiz/attempts/${attemptId}/submit`, {
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      data: {
        score: 5,
        percentage: 100,
        passed: true,
        responses: questions.map((q: { id: string; options: { id: string }[] }) => ({
          questionId: q.id,
          optionId: q.options[q.options.length - 1].id,
        })),
      },
    });
    const result = await submit.json();
    expect(result.passed).toBe(false);
    expect(result.percentage).toBeLessThan(100);
  });
});
