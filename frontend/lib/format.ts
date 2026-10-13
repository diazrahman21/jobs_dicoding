export function formatRupiah(value: number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
): string {
  const formattedMin = formatRupiah(min);
  const formattedMax = formatRupiah(max);

  if (formattedMin && formattedMax) {
    return `${formattedMin} - ${formattedMax}`;
  }

  if (formattedMin) {
    return `Mulai ${formattedMin}`;
  }

  if (formattedMax) {
    return `Hingga ${formattedMax}`;
  }

  return "Gaji tidak disebutkan";
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
