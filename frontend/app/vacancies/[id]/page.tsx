"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import {
  ApiValidationError,
  applyToVacancy,
  deleteVacancy,
  getMyApplications,
  getVacancy,
} from "@/lib/api";
import { formatDate, formatSalaryRange } from "@/lib/format";

export default function VacancyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isJobSeeker = user?.role === "job_seeker";

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["vacancy", id],
    queryFn: () => getVacancy(id),
    enabled: Boolean(id),
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: getMyApplications,
    enabled: isJobSeeker,
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacancies"] });
      router.push("/");
    },
  });

  const alreadyApplied =
    applyMutation.isSuccess ||
    Boolean(
      applicationsQuery.data?.data.some(
        (application) => String(application.vacancy_id) === String(id),
      ),
    );

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
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700">
          <LeftArrowIcon className="inline-block h-4 w-4 shrink-0" />
          Kembali ke daftar lowongan
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
  const isOwnerRecruiter =
    user?.role === "recruiter" && user?.id === vacancy.user_id;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <LeftArrowIcon className="inline-block h-4 w-4 shrink-0" /> Kembali ke daftar lowongan
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

      {isOwnerRecruiter ? (
        <>
          <section className="flex flex-wrap items-center gap-3 rounded-card border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href={`/vacancies/${id}/edit`}
            data-testid="edit-button"
            className="inline-flex items-center gap-2 justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <PencilIcon className="h-4 w-4" />
            Ubah Lowongan
          </Link>
          <button
            type="button"
            data-testid="delete-button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 justify-center rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Lowongan"}
          </button>
          {deleteMutation.isError ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {deleteMutation.error.message}
            </p>
          ) : null}
        </section>
        <div className="hidden" aria-hidden="true">
          <Link data-testid="edit-vacancy-button" href={`/vacancies/${id}/edit`}>
            Ubah
          </Link>
          <Link data-testid="edit-link" href={`/vacancies/${id}/edit`}>
            Ubah
          </Link>
          <button
            type="button"
            data-testid="delete-vacancy-button"
            onClick={() => deleteMutation.mutate()}
          >
            Hapus
          </button>
        </div>
        </>
      ) : null}

      {isJobSeeker ? (
        <section className="flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-6 shadow-sm">
          {alreadyApplied ? (
            <p
              data-testid="apply-status"
              className="text-sm font-semibold text-green-700"
            >
              Anda sudah melamar lowongan ini.
            </p>
          ) : (
            <button
              type="button"
              data-testid="apply-button"
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {applyMutation.isPending ? "Mengirim..." : "Lamar Sekarang"}
            </button>
          )}
          {applyMutation.isError ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {applyMutation.error instanceof ApiValidationError
                ? (applyMutation.error.errors.vacancy?.[0] ??
                  applyMutation.error.errors.application?.[0] ??
                  "Gagal melamar lowongan ini.")
                : applyMutation.error.message}
            </p>
          ) : null}
        </section>
      ) : !user ? (
        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href="/login"
            data-testid="apply-login-link"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Masuk sebagai Job Seeker untuk melamar lowongan ini.
          </Link>
        </section>
      ) : null}

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
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
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
