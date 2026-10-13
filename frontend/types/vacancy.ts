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

export const POSITIONS = [
  "Android Developer",
  "iOS Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
] as const;

export type Position = (typeof POSITIONS)[number];

export const EXPERIENCE_LEVELS = [
  "Fresh Graduate",
  "1-3 tahun",
  "3-5 tahun",
  "5-10 tahun",
  "Lebih dari 10 tahun",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export interface Vacancy {
  id: number;
  user_id: number;
  is_saved: boolean;
  title: string;
  position: string | null;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  candidates_needed: number | null;
  deadline: string | null;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  description: string;
  requirements: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface VacancyInput {
  title: string;
  position: string | null;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  candidates_needed: number | null;
  deadline: string | null;
  experience_level: string | null;
  description: string;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
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
