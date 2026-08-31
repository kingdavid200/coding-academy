/**
 * A small monogram for each language. Decorative — the surrounding link and
 * heading already name the course, so this is aria-hidden.
 */
export function CourseGlyph({
  label,
  accent,
  size = 44,
}: {
  label: string;
  accent: string;
  size?: number;
}) {
  const initials = label.slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, backgroundColor: `${accent}1a`, color: accent }}
      className="flex shrink-0 items-center justify-center rounded-[var(--radius)] font-mono text-sm font-semibold"
    >
      {initials}
    </span>
  );
}
