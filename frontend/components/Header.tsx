"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Image
            src="/assets/icon.png"
            alt="Dicoding Jobs"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
          />
          <span>Dicoding Jobs</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium">
          {isLoading ? (
            <span className="h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : user ? (
            <>
              {user.role === "recruiter" ? (
                <>
                  <Link
                    href="/my-vacancies"
                    data-testid="my-vacancies-link"
                    className="text-slate-700 hover:text-brand-700"
                  >
                    Lowongan Saya
                  </Link>
                  <Link
                    href="/vacancies/new"
                    data-testid="create-vacancy-link"
                    className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    Pasang Lowongan
                  </Link>
                </>
              ) : (
                <Link
                  href="/my-applications"
                  className="text-slate-700 hover:text-brand-700"
                >
                  Lamaran Saya
                </Link>
              )}
              <span
                data-testid="current-user"
                className="hidden text-slate-600 sm:inline"
              >
                {user.name}
              </span>
              <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 sm:inline">
                {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                data-testid="login-link"
                className="text-slate-700 hover:text-brand-700"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                data-testid="register-link"
                className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
