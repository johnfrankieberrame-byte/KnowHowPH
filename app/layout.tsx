import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "KnowHow PH — Find careers that fit you",
    template: "%s | KnowHow PH",
  },
  description:
    "KnowHow helps people in the Philippines explore careers, understand what they involve, and make grounded career decisions with a free career-match quiz.",
  openGraph: {
    type: "website",
    siteName: "KnowHow PH",
    locale: "en_PH",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
