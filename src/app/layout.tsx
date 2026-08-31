import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { metadataBase } from "@/lib/seo";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  formatDetection: { telephone: false },
  // Private, account-only platform — nothing should be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-[var(--color-canvas)]">
        <JsonLd data={organizationSchema()} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
