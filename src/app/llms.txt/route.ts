import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

/**
 * The platform is a private, account-only application. There is no public
 * content to describe.
 */
export function GET() {
  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.name} is a private, account-only learning platform.`,
    "All courses, lessons and assessments are behind authentication and there is",
    "no publicly accessible content.",
    "",
    `Contact: ${siteConfig.organization.email}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
