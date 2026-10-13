import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import {
  saveVacancy,
  unsaveVacancy,
} from "@/lib/api";
import { formatSalaryRange } from "@/lib/format";
import type { Vacancy } from "@/types/vacancy";

interface JobCardProps {
  vacancy: Vacancy;
}

export function JobCard({ vacancy }: JobCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isJobSeeker = user?.role === "job_seeker";

  const saveMutation = useMutation({
    mutationFn: () =>
      vacancy.is_saved
        ? unsaveVacancy(vacancy.id)
        : saveVacancy(vacancy.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacancies"] });
      queryClient.invalidateQueries({ queryKey: ["vacancy", vacancy.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-vacancies"] });
    },
  });

  async function handleSaveClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await saveMutation.mutateAsync();
    } catch {
      // error feedback intentionally minimal; could be extended.
    }
  }

  return (
    <div className="group relative rounded-card border border-slate-200 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md">
      {isJobSeeker ? (
        <button
          type="button"
          data-testid="save-vacancy-button"
          aria-label={
            vacancy.is_saved ? "Hapus dari simpanan" : "Simpan lowongan"
          }
          aria-pressed={vacancy.is_saved}
          disabled={saveMutation.isPending}
          onClick={handleSaveClick}
          className={`absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:cursor-not-allowed disabled:opacity-60 ${vacancy.is_saved ? "text-black" : "text-black/50"}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={vacancy.is_saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
        </button>
      ) : null}
      <Link
        href={`/vacancies/${vacancy.id}`}
        data-testid="job-card"
        className="block p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
      <div className="flex items-start gap-4">
        <div className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5">
          <Image
            src="/assets/company-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-contain"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h3
          data-testid="vacancy-title"
          className="text-lg font-semibold text-slate-900 group-hover:text-brand-700"
        >
          {vacancy.title}
        </h3>
        <p className="text-sm font-medium text-slate-700">
          {vacancy.company_name}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            <PinIcon className="h-3.5 w-3.5 text-black/50" aria-hidden="true" />
            {vacancy.location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
            <BriefcaseIcon className="h-3.5 w-3.5 text-black/50" aria-hidden="true" />
            {vacancy.employment_type}
          </span>
        </div>
        <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
          <DollarIcon className="h-4 w-4 text-black/50" aria-hidden="true" />
          {formatSalaryRange(vacancy.salary_min, vacancy.salary_max)}
        </p>        </div>
      </div>
    </Link>
  </div>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
