import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dicoding Jobs",
  description: "Temukan lowongan kerja teknologi terbaik di Dicoding Jobs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
              <Link
                href="/"
                className="text-lg font-bold text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Dicoding Jobs
              </Link>
              <Link
                href="/vacancies/new"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Pasang Lowongan
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-slate-500 sm:px-6">
              &copy; {new Date().getFullYear()} Dicoding Jobs. Dibuat untuk
              technical exercise.
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
