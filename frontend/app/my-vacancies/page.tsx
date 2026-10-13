"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { JobCard } from "@/components/JobCard";
import { deleteVacancy, getMyVacancies } from "@/lib/api";

export default function MyVacanciesPage() {
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [page, setPage] = useState(1);

  const vacanciesQuery = useQuery({
    queryKey: ["my-vacancies", page],
    queryFn: () => getMyVacancies({ page }),
    enabled: user?.role === "recruiter",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vacancies"] });
      queryClient.invalidateQueries({ queryKey: ["vacancies"] });
    },
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
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Masuk sebagai Recruiter
        </h1>
        <p className="text-base text-zinc-600">
          Anda harus masuk dengan akun Recruiter untuk mengelola lowongan.
        </p>
        <Link
          href="/login"
          data-testid="login-required"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Masuk
        </Link>
      </section>
    );
  }

  if (user.role !== "recruiter") {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Akses ditolak</h1>
        <p className="text-base text-zinc-600">
          Hanya akun Recruiter yang dapat mengelola lowongannya.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Kembali
        </Link>
      </section>
    );
  }

  const vacancies = vacanciesQuery.data?.data ?? [];
  const meta = vacanciesQuery.data?.meta;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Lowongan Saya
          </h1>
          <p className="text-sm text-slate-600">
            Kelola lowongan yang sudah Anda pasang.
          </p>
        </div>
        <Link
          href="/vacancies/new"
          data-testid="create-vacancy-link"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Pasang Lowongan
        </Link>
      </div>

      {vacanciesQuery.isError ? (
        <p
          data-testid="error-state"
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat lowongan. {(vacanciesQuery.error as Error)?.message}
        </p>
      ) : vacanciesQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-card border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <p
          data-testid="empty-state"
          className="rounded-card border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500"
        >
          Anda belum memasang lowongan.{" "}
          <Link
            href="/vacancies/new"
            className="font-semibold text-brand-700 hover:underline"
          >
            Pasang lowongan pertama
          </Link>
        </p>
      ) : (
        <div data-testid="vacancy-list" className="grid gap-4 sm:grid-cols-2">
          {vacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-5 shadow-sm"
            >
              <JobCard vacancy={vacancy} />
              <div className="flex gap-2">
                <Link
                  href={`/vacancies/${vacancy.id}/edit`}
                  data-testid="edit-button"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  Ubah
                </Link>
                <button
                  type="button"
                  data-testid="delete-button"
                  onClick={() => deleteMutation.mutate(vacancy.id)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteMutation.isError ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {deleteMutation.error.message}
        </p>
      ) : null}

      {meta && meta.last_page > 1 ? (
        <nav
          aria-label="Navigasi halaman"
          className="flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.current_page <= 1}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-slate-600">
            Halaman {meta.current_page} dari {meta.last_page}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={meta.current_page >= meta.last_page}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Berikutnya
          </button>
        </nav>
      ) : null}
    </section>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </svg>
  );
}
