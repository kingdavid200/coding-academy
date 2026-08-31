import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.name} — learn to code with structured courses`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #3538cd 0%, #2b2ea8 55%, #1c1a17 100%)",
          padding: "72px",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            {"{ }"}
          </div>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            Learn to code, one module at a time
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
            Structured courses in Java, Python and HTML
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
