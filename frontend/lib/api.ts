import type { Paginated, Vacancy, VacancyInput } from "@/types/vacancy";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ApiValidationError extends ApiError {
  errors: Record<string, string[]>;

  constructor(
    message: string,
    errors: Record<string, string[]>,
    status = 422,
  ) {
    super(message, status);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 422 && payload?.errors) {
      throw new ApiValidationError(
        payload.message ?? "Data yang dikirim tidak valid.",
        payload.errors as Record<string, string[]>,
      );
    }

    throw new ApiError(
      payload?.message ?? "Terjadi kesalahan pada server.",
      response.status,
    );
  }

  return payload as T;
}

export function getVacancies(params: {
  search?: string;
  page?: number;
}): Promise<Paginated<Vacancy>> {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  const suffix = query.toString();

  return request<Paginated<Vacancy>>(
    `/vacancies${suffix ? `?${suffix}` : ""}`,
  );
}

export function getVacancy(id: string | number): Promise<{ data: Vacancy }> {
  return request<{ data: Vacancy }>(`/vacancies/${id}`);
}

export function createVacancy(
  input: VacancyInput,
): Promise<{ data: Vacancy }> {
  return request<{ data: Vacancy }>("/vacancies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
