"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getVacancy } from "@/lib/api";
import { formatDate, formatSalaryRange } from "@/lib/format";

export default function VacancyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["vacancy", id],
    queryFn: () => getVacancy(id),
    enabled: Boolean(id),
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-40 animate-pulse rounded-card border border-slate-200 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm font-medium text-brand-700">
          &larr; Kembali ke daftar lowongan
        </Link>
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat detail lowongan. {(error as Error)?.message}
        </p>
      </div>
    );
  }

  const vacancy = data.data;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        &larr; Kembali ke daftar lowongan
      </Link>

      <header className="flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-6 shadow-sm">
        <h1
          data-testid="vacancy-title"
          className="text-2xl font-bold text-slate-900 sm:text-3xl"
        >
          {vacancy.title}
        </h1>
        <p className="text-base font-medium text-slate-700">
          {vacancy.company_name}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {vacancy.location}
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
            {vacancy.employment_type}
          </span>
        </div>
        <p className="text-lg font-semibold text-slate-900">
          {formatSalaryRange(vacancy.salary_min, vacancy.salary_max)}
        </p>
      </header>

      <section className="rounded-card border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Deskripsi</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {vacancy.description}
        </p>
      </section>

      {vacancy.requirements ? (
        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Kualifikasi</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {vacancy.requirements}
          </p>
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        Dipasang pada {formatDate(vacancy.created_at)}
      </p>
    </article>
  );
}
