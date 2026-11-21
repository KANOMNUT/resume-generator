import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (latin subset, variable weight) so the build never fetches from
// Google Fonts: Turbopack's next/font/google fails on Google's /l/font?kit= URLs.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 700",
  variable: "--font-ui",
  display: "swap",
});

const sourceSerif4 = localFont({
  src: "./fonts/source-serif-4-latin.woff2",
  weight: "400 700",
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Resume Studio",
  description: "Generate a professional PDF resume instantly. No data stored.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
        style={{ background: "var(--bg)" }}
      >
        {children}
      </body>
    </html>
  );
}
