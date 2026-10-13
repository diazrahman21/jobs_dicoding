"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, ApiValidationError } from "@/lib/api";
import type { UserRole } from "@/types/auth";

interface LoginFormProps {
  expectedRole?: UserRole;
  title: string;
  subtitle: string;
  registerHref: string;
}

export function LoginForm({
  expectedRole,
  title,
  subtitle,
  registerHref,
}: LoginFormProps) {
  const router = useRouter();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const nextErrors: Record<string, string[]> = {};
    if (!email.trim()) {
      nextErrors.email = ["Email wajib diisi."];
    }
    if (!password) {
      nextErrors.password = ["Password wajib diisi."];
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login({ email: email.trim(), password });
      if (expectedRole && user.role !== expectedRole) {
        await logout();
        setFormError(
          expectedRole === "recruiter"
            ? "Akun ini bukan akun Recruiter."
            : "Akun ini bukan akun Job Seeker.",
        );
        return;
      }
      router.push(expectedRole === "recruiter" ? "/my-vacancies" : "/");
    } catch (error) {
      if (error instanceof ApiValidationError) {
        setErrors(error.errors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 rounded-card border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            data-testid="login-email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass(errors.email)}
            placeholder="nama@email.com"
          />
          {errors.email ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.email[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            data-testid="login-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass(errors.password)}
            placeholder="••••••••"
          />
          {errors.password ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.password[0]}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          data-testid="login-submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href={registerHref} className="font-semibold text-brand-700 hover:underline">
          Daftar di sini
        </Link>
      </p>
    </section>
  );
}

function inputClass(errors?: string[]): string {
  const base =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2";
  return errors?.length
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-200`
    : `${base} border-slate-300 focus:border-brand-500 focus:ring-brand-200`;
}
