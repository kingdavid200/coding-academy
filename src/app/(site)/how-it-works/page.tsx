import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "How it works",
  description:
    "How learning on Coding Academy works: choose a language, work through ordered modules, and score at least 80% on each assessment to unlock the next.",
  path: "/how-it-works",
});

const sections = [
  {
    heading: "One language at a time",
    body: "When you sign up you pick Java, Python or HTML. That becomes your active path and your dashboard focuses on it. You can add another language whenever you want from your account page, and each course keeps its own separate progress.",
  },
  {
    heading: "Modules run in order",
    body: "Every course is a sequence of modules. Module 1 is open from the start. Each later module stays locked until you have passed the one before it, so you always have the background you need for what comes next.",
  },
  {
    heading: "Lessons, then an assessment",
    body: "A module contains several short lessons with explanations, syntax and worked code examples, plus a clear set of objectives. When you have read them, you take the module assessment: a set of multiple-choice questions.",
  },
  {
    heading: "80% to move on",
    body: "You need at least 80% on the assessment to complete a module and unlock the next one. Score below that and the next module stays locked, but you can review the lessons and retake the assessment as many times as you like. We record every attempt and keep your highest score.",
  },
  {
    heading: "Your progress is saved",
    body: "Completed, in-progress and locked modules are all shown on your dashboard and course page, along with your latest results and overall course completion. Everything is stored against your account, so you can stop and pick up later on any device.",
  },
];

export default function HowItWorksPage() {
  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]}
        />
        <div className="mt-6">
          <PageHeader
            title="How learning here works"
            description="A quick guide to the module structure and the 80% progression rule."
          />
        </div>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <p className="mt-2 text-[var(--color-ink-muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/signup">Create your free account</ButtonLink>
          <ButtonLink href="/courses" variant="secondary">
            See the courses
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
