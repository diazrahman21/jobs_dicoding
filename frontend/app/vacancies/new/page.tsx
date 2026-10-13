"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { ApiValidationError, createVacancy } from "@/lib/api";
import {
  EXPERIENCE_LEVELS,
  POSITIONS,
  type EmploymentType,
  type VacancyInput,
} from "@/types/vacancy";

const LOCATIONS = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Medan",
  "Semarang",
  "Denpasar",
  "Makassar",
  "Remote",
];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Magang" },
  { value: "Freelance", label: "Freelance" },
];

interface FormState {
  title: string;
  position: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  candidates_needed: string;
  deadline: string;
  experience_level: string;
  description: string;
  requirements: string;
  salary_min: string;
  salary_max: string;
  show_salary: boolean;
}

const initialForm: FormState = {
  title: "",
  position: "",
  company_name: "",
  location: "",
  employment_type: "Full-time",
  candidates_needed: "",
  deadline: "",
  experience_level: "",
  description: "",
  requirements: "",
  salary_min: "",
  salary_max: "",
  show_salary: false,
};

export default function NewVacancyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [remoteFriendly, setRemoteFriendly] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: VacancyInput) => createVacancy(input),
    onSuccess: (response) => {
      router.push(`/vacancies/${response.data.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiValidationError) {
        setErrors(error.errors);
      }
    },
  });

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = event.target;
    const nextValue =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : value;

    setForm((current) => ({ ...current, [name]: nextValue }));
    clearError(name);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    mutation.mutate({
      title: form.title.trim(),
      position: form.position || null,
      company_name: form.company_name.trim(),
      location: form.location,
      employment_type: form.employment_type,
      candidates_needed: form.candidates_needed
        ? Number(form.candidates_needed)
        : null,
      deadline: form.deadline || null,
      experience_level: form.experience_level || null,
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      show_salary: form.show_salary,
    });
  }

  const genericError =
    mutation.isError && !(mutation.error instanceof ApiValidationError)
      ? mutation.error.message
      : null;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[600px] px-4 py-10">
        <div className="flex flex-col gap-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-[22px] w-40 animate-pulse rounded bg-zinc-100" />
              <div className="h-12 animate-pulse rounded-[2px] bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">
          Masuk sebagai Recruiter
        </h1>
        <p className="text-base text-zinc-600">
          Anda harus masuk dengan akun Recruiter untuk memasang lowongan.
        </p>
        <Link
          href="/login"
          data-testid="login-required"
          className="inline-flex h-10 items-center justify-center rounded-[2px] bg-brand-500 px-5 text-base text-white transition-colors hover:bg-brand-600"
        >
          Masuk
        </Link>
      </section>
    );
  }

  if (user.role !== "recruiter") {
    return (
      <section className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Akses ditolak</h1>
        <p className="text-base text-zinc-600">
          Hanya akun Recruiter yang dapat memasang lowongan.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] border border-zinc-200 bg-zinc-50 px-5 text-base text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <LeftArrowIcon className="inline-block h-4 w-4 shrink-0" />
          Kembali ke daftar lowongan
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-8 px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Buat lowongan pekerjaan
        </h1>

        {genericError ? (
          <p
            role="alert"
            className="rounded-[2px] border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {genericError}
          </p>
        ) : null}

        <form
          data-testid="vacancy-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8"
        >
          <Field
            label="Judul Lowongan"
            htmlFor="title"
            required
            error={errors.title}
            hint="Contoh: Android Native Developer"
          >
            <input
              id="title"
              name="title"
              data-testid="title-input"
              value={form.title}
              onChange={handleChange}
              className={controlClass(!!errors.title)}
              placeholder="Masukkan judul lowongan"
            />
          </Field>

          <Field
            label="Nama Perusahaan"
            htmlFor="company_name"
            required
            error={errors.company_name}
          >
            <input
              id="company_name"
              name="company_name"
              data-testid="company-name-input"
              value={form.company_name}
              onChange={handleChange}
              className={controlClass(!!errors.company_name)}
              placeholder="Contoh: PT Teknologi Nusantara"
            />
          </Field>

          <Field
            label="Posisi"
            htmlFor="position"
            required
            error={errors.position}
          >
            <SelectControl
              id="position"
              name="position"
              testId="position-select"
              value={form.position}
              onChange={handleChange}
              error={!!errors.position}
              placeholder="Pilih Posisi"
              options={POSITIONS.map((position) => ({
                value: position,
                label: position,
              }))}
            />
          </Field>

          <Field
            label="Tipe Pekerjaan"
            htmlFor="employment_type"
            required
            error={errors.employment_type}
          >
            <RadioGroup
              name="employment_type"
              value={form.employment_type}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  employment_type: value as EmploymentType,
                }))
              }
              options={EMPLOYMENT_OPTIONS}
            />
          </Field>

          <Field
            label="Jumlah Kandidat yang Dibutuhkan"
            htmlFor="candidates_needed"
            error={errors.candidates_needed}
          >
            <input
              id="candidates_needed"
              name="candidates_needed"
              data-testid="candidates-needed-input"
              type="number"
              min={1}
              value={form.candidates_needed}
              onChange={handleChange}
              className={controlClass(!!errors.candidates_needed)}
              placeholder="Masukkan jumlah kandidat yang dibutuhkan"
            />
          </Field>

          <Field
            label="Tenggat Lamaran"
            htmlFor="deadline"
            error={errors.deadline}
          >
            <div className="relative">
              <input
                id="deadline"
                name="deadline"
                data-testid="deadline-input"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className={`${controlClass(!!errors.deadline)} pr-12`}
                placeholder="dd/mm/yyyy"
              />
              <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-600" />
            </div>
          </Field>

          <Field
            label="Lokasi"
            htmlFor="location"
            required
            error={errors.location}
          >
            <SelectControl
              id="location"
              name="location"
              testId="location-select"
              value={form.location}
              onChange={handleChange}
              error={!!errors.location}
              placeholder="Pilih lokasi"
              options={LOCATIONS.map((location) => ({
                value: location,
                label: location,
              }))}
            />
            <CheckboxControl
              name="remote"
              label="Bisa Remote"
              checked={remoteFriendly}
              onChange={setRemoteFriendly}
            />
          </Field>

          <Field
            label="Deskripsi"
            htmlFor="description"
            required
            error={errors.description}
            hint="Anda bisa mengubah templat yang telah disediakan di atas."
          >
            <RichTextEditor
              description={form.description}
              requirements={form.requirements}
              onChange={handleChange}
            />
          </Field>

          <Field
            label="Kisaran Gaji"
            htmlFor="salary_min"
            error={errors.salary_min}
          >
            <div className="flex items-center gap-6">
              <CurrencyInput
                id="salary_min"
                name="salary_min"
                testId="salary-min-input"
                value={form.salary_min}
                onChange={handleChange}
                placeholder="Minimum"
              />
              <span className="text-base text-zinc-900">-</span>
              <CurrencyInput
                id="salary_max"
                name="salary_max"
                testId="salary-max-input"
                value={form.salary_max}
                onChange={handleChange}
                placeholder="Maksimum"
              />
            </div>
            <p className="text-sm leading-5 text-zinc-600">
              Anda tidak perlu mengisi kolom &quot;Maksimum&quot; jika yang
              dimasukkan adalah gaji pokok.
            </p>
            <div className="flex flex-col gap-2">
              <ToggleControl
                label="Tampilkan Gaji"
                checked={form.show_salary}
                onChange={(checked) =>
                  setForm((current) => ({ ...current, show_salary: checked }))
                }
              />
              <p className="text-sm leading-5 text-zinc-600">
                Gaji akan ditampilkan di lowongan pekerjaan dan dapat dilihat
                oleh kandidat.
              </p>
            </div>
          </Field>

          <Field
            label="Pengalaman Kerja"
            htmlFor="experience_level"
            error={errors.experience_level}
          >
            <RadioGroup
              name="experience_level"
              value={form.experience_level}
              onChange={(value) =>
                setForm((current) => ({ ...current, experience_level: value }))
              }
              options={EXPERIENCE_LEVELS.map((level) => ({
                value: level,
                label: level,
              }))}
            />
          </Field>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              data-testid="submit-button"
              disabled={mutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-[2px] bg-brand-500 px-6 text-base text-white transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Menyimpan..." : "Buat Lowongan"}
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-[2px] border border-zinc-200 bg-zinc-50 px-5 text-base text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

function controlClass(hasError: boolean): string {
  const base =
    "w-full h-12 rounded-[2px] border bg-white px-4 text-base leading-[22px] text-zinc-900 outline-none transition placeholder:text-zinc-600 focus:ring-1";
  return hasError
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-300`
    : `${base} border-zinc-200 focus:border-brand-500 focus:ring-brand-500`;
}

function Field({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-base leading-[22px] text-zinc-900"
      >
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {hint ? (
        <p className="text-sm leading-5 text-zinc-600">{hint}</p>
      ) : null}
      {error?.length ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

function SelectControl({
  id,
  name,
  testId,
  value,
  onChange,
  error,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  testId: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  error: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        data-testid={testId}
        value={value}
        onChange={onChange}
        className={`${controlClass(error)} appearance-none pr-12 ${
          value ? "text-zinc-900" : "text-zinc-600"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-600" />
    </div>
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className="flex w-fit items-center gap-2 text-base leading-6 text-zinc-700"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-300 peer-checked:border-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  checked ? "bg-brand-500" : ""
                }`}
              />
            </span>
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

function CheckboxControl({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex w-fit items-center gap-2 text-base leading-[22px] text-zinc-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-[1px] border-2 border-zinc-200 peer-checked:border-brand-500 peer-checked:bg-brand-500"
      >
        {checked ? <CheckIcon className="h-4 w-4 text-white" /> : null}
      </span>
      {label}
    </label>
  );
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex w-fit items-center gap-2 py-0.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-10 rounded-full transition-colors ${
          checked ? "bg-brand-500" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-base leading-[22px] text-zinc-600">{label}</span>
    </label>
  );
}

function CurrencyInput({
  id,
  name,
  testId,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  name: string;
  testId: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="flex h-12 flex-1 items-center overflow-hidden rounded-[2px] border border-zinc-200 bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      <span className="flex h-full w-[74px] items-center justify-center bg-zinc-100 text-base text-zinc-900">
        Rp
      </span>
      <input
        id={id}
        name={name}
        data-testid={testId}
        type="number"
        min={0}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-full w-full bg-transparent px-4 text-base text-zinc-900 outline-none placeholder:text-zinc-600"
      />
    </div>
  );
}

function RichTextEditor({
  description,
  requirements,
  onChange,
}: {
  description: string;
  requirements: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
}) {
  return (
    <div className="flex h-[379px] flex-col rounded-[2px] border border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2.5">
        <ToolbarButton label="Bold">
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton label="Italic">
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton label="Underline">
          <UnderlineIcon />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-zinc-300" />
        <ToolbarButton label="Bullet list">
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton label="Numbered list">
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton label="Link">
          <LinkIcon />
        </ToolbarButton>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-semibold leading-7 tracking-[-0.017em] text-zinc-900">
            Deskripsi Pekerjaan
          </span>
          <textarea
            id="description"
            name="description"
            data-testid="description-input"
            value={description}
            onChange={onChange}
            rows={4}
            className="w-full resize-none text-sm leading-5 text-zinc-900 outline-none placeholder:text-zinc-600"
            placeholder="Jelaskan gambaran pekerjaan ini."
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xl font-semibold leading-7 tracking-[-0.017em] text-zinc-900">
            Tanggung Jawab
          </span>
          <textarea
            id="requirements"
            name="requirements"
            data-testid="requirements-input"
            value={requirements}
            onChange={onChange}
            rows={3}
            className="w-full resize-none text-sm leading-5 text-zinc-900 outline-none placeholder:text-zinc-600"
            placeholder="Sebutkan tanggung jawab dan kualifikasi."
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-[2px] text-zinc-700 transition-colors hover:bg-zinc-100"
    >
      {children}
    </button>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BoldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M19 4h-9M14 20H5M15 4 9 20" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
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
