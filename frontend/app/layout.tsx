import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import "./globals.css";

// Geist is a variable font, so every weight (100–900) ships in one file.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}: OAU 200L Engineering Notes, Practice & Mock Exams`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  openGraph: {
    title: `${APP_NAME}: OAU 200L Engineering Notes, Practice & Mock Exams`,
    description: APP_TAGLINE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME}: OAU 200L Engineering Notes, Practice & Mock Exams`,
    description: APP_TAGLINE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1012" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
