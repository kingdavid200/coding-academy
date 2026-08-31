import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to your Coding Academy account to continue your Java, Python or HTML course.",
  path: "/login",
  noindex: true,
});

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
