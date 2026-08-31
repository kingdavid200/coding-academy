import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // Do not ship JS source maps to the browser in production.
  productionBrowserSourceMaps: false,

  poweredByHeader: false,

  reactStrictMode: true,

  // The repo lives under the home directory (which also has a stray lockfile).
  // Pin Turbopack's root to this project so it does not walk up.
  turbopack: {
    root: __dirname,
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next injects small inline bootstrap scripts; 'unsafe-inline' is
              // needed for the App Router runtime. No third-party script hosts.
              "script-src 'self' 'unsafe-inline'" + (isProd ? "" : " 'unsafe-eval'"),
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
