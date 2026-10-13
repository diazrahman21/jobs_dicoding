import Link from "next/link";
import { formatSalaryRange } from "@/lib/format";
import type { Vacancy } from "@/types/vacancy";

interface JobCardProps {
  vacancy: Vacancy;
}

export function JobCard({ vacancy }: JobCardProps) {
  return (
    <Link
      href={`/vacancies/${vacancy.id}`}
      data-testid="job-card"
      className="group block rounded-card border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="flex flex-col gap-2">
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
            {vacancy.location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
            {vacancy.employment_type}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {formatSalaryRange(vacancy.salary_min, vacancy.salary_max)}
        </p>
      </div>
    </Link>
  );
}
