import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Threadline compares how major stories are covered across multiple outlets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-xl px-1 py-1 transition hover:bg-neutral-100/70"
            >
              <Image
                src="/assets/threadline.png"
                alt="Threadline logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-cover shadow-sm"
                priority
              />
              <span className="text-sm font-semibold tracking-tight text-neutral-900">
                {SITE_NAME}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 sm:inline-flex">
                Multi-source news explorer
              </span>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Live
              </span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
