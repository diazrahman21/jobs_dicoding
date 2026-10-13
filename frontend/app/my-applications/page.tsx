"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getMyApplications } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function MyApplicationsPage() {
  const { user, isLoading } = useAuth();
  const isJobSeeker = user?.role === "job_seeker";

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["applications"],
    queryFn: getMyApplications,
    enabled: isJobSeeker,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded-card border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-card border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Masuk diperlukan</h1>
        <p className="text-sm text-slate-600">
          Masuk sebagai Job Seeker untuk melihat daftar lamaran Anda.
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
          <LeftArrowIcon className="inline-block h-4 w-4 shrink-0" />
          Kembali ke daftar lowongan
        </Link>
      </section>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded-card border border-slate-200 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        Gagal memuat lamaran. {(error as Error)?.message}
      </p>
    );
  }

  const applications = data?.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Lamaran Saya</h1>

      {applications.length === 0 ? (
        <p
          data-testid="applications-empty"
          className="rounded-card border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600"
        >
          Anda belum melamar lowongan apa pun.{" "}
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            Cari lowongan
          </Link>
          .
        </p>
      ) : (
        <ul
          data-testid="application-list"
          className="flex flex-col gap-4"
        >
          {applications.map((application) => (
            <li
              key={application.id}
              data-testid="application-card"
              className="flex flex-col gap-2 rounded-card border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/vacancies/${application.vacancy_id}`}
                  className="text-base font-semibold text-slate-900 hover:text-brand-700"
                >
                  {application.vacancy?.title ?? `Lowongan #${application.vacancy_id}`}
                </Link>
                {application.vacancy ? (
                  <span className="text-sm text-slate-600">
                    {application.vacancy.company_name} &middot;{" "}
                    {application.vacancy.location}
                  </span>
                ) : null}
                <span className="text-xs text-slate-500">
                  Dilamar pada {formatDate(application.created_at)}
                </span>
              </div>
              <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {application.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LeftArrowIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
