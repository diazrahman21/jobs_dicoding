"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { getVacancies } from "@/lib/api";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["vacancies", debouncedSearch, page],
    queryFn: () => getVacancies({ search: debouncedSearch, page }),
  });

  const vacancies = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section className="-mt-6 flex flex-col gap-6 rounded-t-[32px] bg-white px-4 pt-10 shadow-sm sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Temukan Lowongan Impianmu
        </h1>
        <p className="text-sm text-slate-600">
          Jelajahi lowongan teknologi terbaru dari perusahaan di seluruh
          Indonesia.
        </p>
      </div>

      <SearchBar value={search} onChange={handleSearchChange} />

      {isError ? (
        <p
          data-testid="error-state"
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat lowongan. {(error as Error)?.message}
        </p>
      ) : isPending ? (
        <div data-testid="loading-skeleton" className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-card border border-slate-200 bg-white p-5"
            >
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <p
          data-testid="empty-state"
          className="rounded-card border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500"
        >
          Lowongan tidak ditemukan
        </p>
      ) : (
        <div data-testid="vacancy-list" className="grid gap-4 sm:grid-cols-2">
          {vacancies.map((vacancy) => (
            <JobCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}

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
