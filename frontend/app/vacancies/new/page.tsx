"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiValidationError, createVacancy } from "@/lib/api";
import {
  EMPLOYMENT_TYPES,
  type EmploymentType,
  type VacancyInput,
} from "@/types/vacancy";

interface FormState {
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string;
  salary_min: string;
  salary_max: string;
}

const initialForm: FormState = {
  title: "",
  company_name: "",
  location: "",
  employment_type: "Full-time",
  description: "",
  requirements: "",
  salary_min: "",
  salary_max: "",
};

export default function NewVacancyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

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

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    mutation.mutate({
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      location: form.location.trim(),
      employment_type: form.employment_type,
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
    });
  }

  const genericError =
    mutation.isError && !(mutation.error instanceof ApiValidationError)
      ? mutation.error.message
      : null;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          &larr; Kembali ke daftar lowongan
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Pasang Lowongan</h1>
        <p className="text-sm text-slate-600">
          Isi detail lowongan berikut agar tampil di platform Dicoding Jobs.
        </p>
      </div>

      {genericError ? (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {genericError}
        </p>
      ) : null}

      <form
        data-testid="vacancy-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 rounded-card border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Field label="Judul Lowongan" htmlFor="title" errors={errors.title}>
          <input
            id="title"
            name="title"
            data-testid="title-input"
            value={form.title}
            onChange={handleChange}
            className={inputClass(errors.title)}
            placeholder="Contoh: Backend Engineer"
          />
        </Field>

        <Field
          label="Nama Perusahaan"
          htmlFor="company_name"
          errors={errors.company_name}
        >
          <input
            id="company_name"
            name="company_name"
            data-testid="company-name-input"
            value={form.company_name}
            onChange={handleChange}
            className={inputClass(errors.company_name)}
            placeholder="Contoh: PT Teknologi Nusantara"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Lokasi" htmlFor="location" errors={errors.location}>
            <input
              id="location"
              name="location"
              data-testid="location-input"
              value={form.location}
              onChange={handleChange}
              className={inputClass(errors.location)}
              placeholder="Contoh: Jakarta"
            />
          </Field>

          <Field
            label="Tipe Pekerjaan"
            htmlFor="employment_type"
            errors={errors.employment_type}
          >
            <select
              id="employment_type"
              name="employment_type"
              data-testid="employment-type-select"
              value={form.employment_type}
              onChange={handleChange}
              className={inputClass(errors.employment_type)}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Deskripsi"
          htmlFor="description"
          errors={errors.description}
        >
          <textarea
            id="description"
            name="description"
            data-testid="description-input"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={inputClass(errors.description)}
            placeholder="Jelaskan tanggung jawab dan gambaran pekerjaan."
          />
        </Field>

        <Field
          label="Kualifikasi (opsional)"
          htmlFor="requirements"
          errors={errors.requirements}
        >
          <textarea
            id="requirements"
            name="requirements"
            data-testid="requirements-input"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            className={inputClass(errors.requirements)}
            placeholder="Sebutkan skill dan pengalaman yang dibutuhkan."
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Gaji Minimum (opsional)"
            htmlFor="salary_min"
            errors={errors.salary_min}
          >
            <input
              id="salary_min"
              name="salary_min"
              data-testid="salary-min-input"
              type="number"
              min={0}
              value={form.salary_min}
              onChange={handleChange}
              className={inputClass(errors.salary_min)}
              placeholder="5000000"
            />
          </Field>

          <Field
            label="Gaji Maksimum (opsional)"
            htmlFor="salary_max"
            errors={errors.salary_max}
          >
            <input
              id="salary_max"
              name="salary_max"
              data-testid="salary-max-input"
              type="number"
              min={0}
              value={form.salary_max}
              onChange={handleChange}
              className={inputClass(errors.salary_max)}
              placeholder="10000000"
            />
          </Field>
        </div>

        <button
          type="submit"
          data-testid="submit-button"
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Menyimpan..." : "Simpan Lowongan"}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(errors?: string[]): string {
  const base =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2";
  return errors?.length
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-200`
    : `${base} border-slate-300 focus:border-brand-500 focus:ring-brand-200`;
}
