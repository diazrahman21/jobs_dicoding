import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dicoding Jobs",
  description: "Temukan lowongan kerja teknologi terbaik di Dicoding Jobs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white">
              <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6">
                <Image
                  src="/assets/footer-logo.png"
                  alt="Dicoding Jobs"
                  width={138}
                  height={35}
                  className="h-8 w-auto"
                />
                <p className="text-left leading-relaxed">
                  Dicoding Space
                  <br />
                  Jl. Batik Kumeli No.50, Sukaluyu,
                  <br />
                  Kec. Cibeunying Kaler, Kota Bandung
                  <br />
                  Jawa Barat 40123
                </p>
              </div>
            </footer>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
