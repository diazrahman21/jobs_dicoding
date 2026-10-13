"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getSavedVacancies } from "@/lib/api";
import { JobCard } from "@/components/JobCard";

export default function SavedVacanciesPage() {
  const { user, isLoading } = useAuth();
  const isJobSeeker = user?.role === "job_seeker";

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["saved-vacancies"],
    queryFn: () => getSavedVacancies(),
    enabled: isJobSeeker,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-card border border-slate-200 bg-white p-5"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-card border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Masuk diperlukan</h1>
        <p className="text-sm text-slate-600">
          Masuk sebagai Job Seeker untuk melihat lowongan yang disimpan.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Masuk
        </Link>
      </section>
    );
  }

  if (!isJobSeeker) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-card border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Akses ditolak</h1>
        <p className="text-sm text-slate-600">
          Halaman ini hanya tersedia untuk akun Job Seeker.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke daftar lowongan
        </Link>
      </section>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-card border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        Gagal memuat lowongan tersimpan. {(error as Error)?.message}
      </p>
    );
  }

  const vacancies = data?.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Lowongan Tersimpan
        </h1>
        <p className="text-sm text-slate-600">
          Lowongan yang telah Anda simpan untuk dilihat nanti.
        </p>
      </div>

      {vacancies.length === 0 ? (
        <p
          data-testid="empty-state"
          className="rounded-card border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500"
        >
          Anda belum menyimpan lowongan.{" "}
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            Cari lowongan
          </Link>
          .
        </p>
      ) : (
        <div data-testid="vacancy-list" className="grid gap-4 sm:grid-cols-2">
          {vacancies.map((vacancy) => (
            <JobCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </section>
  );
}