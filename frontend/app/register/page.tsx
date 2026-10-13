"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, ApiValidationError } from "@/lib/api";
import type { UserRole } from "@/types/auth";

interface FormState {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "job_seeker",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const nextErrors: Record<string, string[]> = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      nextErrors.name = ["Nama wajib diisi."];
    } else if (trimmedName.length < 3) {
      nextErrors.name = ["Nama minimal 3 karakter."];
    } else if (!/^[\p{L}\s'.-]+$/u.test(trimmedName)) {
      nextErrors.name = [
        "Nama hanya boleh berisi huruf, spasi, tanda hubung, apostrof, dan titik.",
      ];
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      nextErrors.email = ["Email wajib diisi."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = ["Format email tidak valid."];
    }

    if (!form.password) {
      nextErrors.password = ["Password wajib diisi."];
    } else if (form.password.length < 8) {
      nextErrors.password = ["Password minimal 8 karakter."];
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)
    ) {
      nextErrors.password = [
        "Password harus memiliki huruf besar, huruf kecil, dan angka.",
      ];
    }

    if (!form.password_confirmation) {
      nextErrors.password_confirmation = ["Konfirmasi password wajib diisi."];
    } else if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = ["Konfirmasi password tidak cocok."];
    }

    if (!form.role) {
      nextErrors.role = ["Peran wajib dipilih."];
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        ...form,
        name: trimmedName,
        email: trimmedEmail,
      });
      router.push("/");
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
        <h1 className="text-2xl font-bold text-slate-900">Daftar Akun</h1>
        <p className="text-sm text-slate-600">
          Buat akun sebagai Recruiter atau Job Seeker.
        </p>
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
          <label htmlFor="role" className="text-sm font-medium text-slate-800">
            Saya adalah <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            data-testid="register-role"
            value={form.role}
            onChange={handleChange}
            className={inputClass(errors.role)}
          >
            <option value="job_seeker">Job Seeker (pencari kerja)</option>
            <option value="recruiter">Recruiter (perusahaan)</option>
          </select>
          {errors.role ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.role[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            data-testid="register-name"
            required
            value={form.name}
            onChange={handleChange}
            className={inputClass(errors.name)}
            placeholder="Nama lengkap"
          />
          {errors.name ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            data-testid="register-email"
            required
            value={form.email}
            onChange={handleChange}
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
            name="password"
            type="password"
            data-testid="register-password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className={inputClass(errors.password)}
            placeholder="Minimal 8 karakter"
          />
          {errors.password ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.password[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password_confirmation"
            className="text-sm font-medium text-slate-800"
          >
            Konfirmasi Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            data-testid="register-password-confirmation"
            required
            value={form.password_confirmation}
            onChange={handleChange}
            className={inputClass(errors.password_confirmation)}
            placeholder="Ulangi password"
          />
        </div>

        <button
          type="submit"
          data-testid="register-submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:underline"
        >
          Masuk di sini
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
