import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { getAttemptResult } from "@/lib/data/quiz";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuizResult } from "@/components/learn/QuizResult";

type Params = {
  params: Promise<{ course: string; module: string; attemptId: string }>;
};

export const metadata: Metadata = buildMetadata({
  title: "Assessment result",
  description: "Your assessment result.",
  path: "/learn",
  noindex: true,
});

export default async function QuizResultPage({ params }: Params) {
  const { course, module: moduleSlug, attemptId } = await params;
  const user = await requirePageUser();

  const result = await getAttemptResult(user.id, attemptId);
  if (!result || result.courseSlug !== course || result.moduleSlug !== moduleSlug) {
    notFound();
  }

  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: result.courseTitle, path: `/learn/${course}` },
            { name: result.moduleTitle, path: `/learn/${course}/${moduleSlug}` },
            { name: "Result", path: `/learn/${course}/${moduleSlug}/quiz/result/${attemptId}` },
          ]}
        />
        <h1 className="mt-6 text-3xl font-bold">Assessment result</h1>
        <div className="mt-6">
          <QuizResult result={result} />
        </div>
      </Container>
    </main>
  );
}
