import "server-only";
import MarkdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";

/**
 * Lesson content is authored in Markdown by admins. Raw HTML is disabled, so
 * even a compromised admin account cannot store an XSS payload in a lesson.
 * Fenced code blocks are highlighted at render time with Shiki (no client JS).
 */

type Md = InstanceType<typeof MarkdownIt>;

let cached: Promise<Md> | null = null;

async function build(): Promise<Md> {
  const md: Md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: false,
  });

  // `fallbackLanguage: "text"` is valid at runtime (Shiki special-cases plain
  // text) but the plugin's types only list bundled grammars, hence the cast.
  const shikiOptions = {
    themes: { light: "github-light", dark: "github-dark" },
    langs: ["java", "python", "html", "css", "javascript", "typescript", "json", "bash"],
    fallbackLanguage: "text",
  } as unknown as Parameters<typeof Shiki>[0];

  md.use(await Shiki(shikiOptions));

  // Make external links safe.
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = String(tokens[idx].attrGet("href") ?? "");
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet("rel", "noopener noreferrer");
      tokens[idx].attrSet("target", "_blank");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}

export async function renderMarkdown(source: string): Promise<string> {
  if (!cached) cached = build();
  const md = await cached;
  return md.render(source ?? "");
}

/** Rough reading-time helper for lesson metadata. */
export function readingMinutes(source: string): number {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
