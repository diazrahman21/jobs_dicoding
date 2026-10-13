"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getMyApplications, getSavedVacancies } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { formatDate } from "@/lib/format";

type JobSeekerTab = "applications" | "saved";

export default function MyApplicationsPage() {
  const { user, isLoading } = useAuth();
  const isJobSeeker = user?.role === "job_seeker";
  const [activeTab, setActiveTab] = useState<JobSeekerTab>("applications");

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: getMyApplications,
    enabled: isJobSeeker && activeTab === "applications",
  });

  const savedVacanciesQuery = useQuery({
    queryKey: ["saved-vacancies"],
    queryFn: () => getSavedVacancies(),
    enabled: isJobSeeker && activeTab === "saved",
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
          Masuk sebagai Job Seeker untuk melihat lamaran dan lowongan tersimpan Anda.
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

  const applications = applicationsQuery.data?.data ?? [];
  const savedVacancies = savedVacanciesQuery.data?.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Lowongan Saya</h1>

      <div
        role="tablist"
        aria-label="Lowongan saya"
        className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          data-testid="applications-tab"
          aria-selected={activeTab === "applications"}
          onClick={() => setActiveTab("applications")}
          className={
            activeTab === "applications"
              ? "rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition"
              : "rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-brand-700"
          }
        >
          Lamaran Saya
        </button>
        <button
          type="button"
          role="tab"
          data-testid="saved-tab"
          aria-selected={activeTab === "saved"}
          onClick={() => setActiveTab("saved")}
          className={
            activeTab === "saved"
              ? "rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition"
              : "rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-brand-700"
          }
        >
          Lowongan Tersimpan
        </button>
      </div>

      {activeTab === "applications" ? (
        <>
          {applicationsQuery.isPending ? (
            <div className="flex flex-col gap-4">
              <div className="h-24 animate-pulse rounded-card border border-slate-200 bg-white" />
            </div>
          ) : applicationsQuery.isError ? (
            <p
              role="alert"
              className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
            >
              Gagal memuat lamaran. {(applicationsQuery.error as Error)?.message}
            </p>
          ) : applications.length === 0 ? (
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
        </>
      ) : (
        <>
          {savedVacanciesQuery.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-card border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          ) : savedVacanciesQuery.isError ? (
            <p
              role="alert"
              className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
            >
              Gagal memuat lowongan tersimpan.{" "}
              {(savedVacanciesQuery.error as Error)?.message}
            </p>
          ) : savedVacancies.length === 0 ? (
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
              {savedVacancies.map((vacancy) => (
                <JobCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}