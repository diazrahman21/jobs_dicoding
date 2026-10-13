export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Freelance";

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const;

export interface Vacancy {
  id: number;
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface VacancyInput {
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
