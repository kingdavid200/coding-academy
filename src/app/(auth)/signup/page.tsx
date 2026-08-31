import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import { listPublishedCourses } from "@/lib/data/courses";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  description:
    "Sign up for Coding Academy and choose your first language: Java, Python or HTML. Free, with progress tracking built in.",
  path: "/signup",
  noindex: true,
});

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  const courses = await listPublishedCourses();
  return (
    <SignupForm
      courses={courses.map((c) => ({ slug: c.slug, title: c.title, tagline: c.tagline }))}
    />
  );
}
