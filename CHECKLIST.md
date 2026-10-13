# Checklist Kesesuaian — Dicoding Jobs Technical Exercise

Basis: syarat pada email technical exercise (Backend Laravel 40 poin, Frontend + API 20 poin, UI/Styling 20 poin, Testing 40 poin, submission).

Status:
- ✅ Memenuhi
- ⚠️ Sebagian / perlu verifikasi manual
- ❌ Belum memenuhi

Terakhir diperiksa: backend `php artisan test` (33 passed), frontend `npm run lint` & `tsc --noEmit` (passed), Playwright E2E 8/8 passed.

## 1. User Stories

- [x] ✅ **Recruiter dapat membuat lowongan baru** — `POST /api/vacancies` (autentikasi + role recruiter), form frontend `/vacancies/new`, E2E "recruiter dapat login lalu membuat lowongan baru" lulus.
- [x] ✅ **Job seeker dapat mencari lowongan berdasarkan title** — `GET /api/vacancies?search=`, input debounced 300 ms di UI, E2E "mencari lowongan berdasarkan title" lulus.
- [x] ✅ Pengunjung publik juga bisa melihat & mencari (di luar syarat minimum, bonus).

## 2. Backend (Laravel) — 40 pts

### Fitur Wajib

- [x] ✅ **Create Vacancy** — `VacancyController@store`, `StoreVacancyRequest`, respons `201 { data }`.
  - Bukti: `backend/app/Http/Controllers/Api/VacancyController.php`, `backend/app/Http/Requests/StoreVacancyRequest.php`.
- [x] ✅ **List Vacancies** — `VacancyController@index`, paginasi 10/halaman, terbaru dulu, mendukung `?search=` dan `?page=`.
  - Bukti: `backend/routes/api.php`, `Vacancy::scopeSearchByTitle`.
- [x] ✅ **Detail Vacancy** — `VacancyController@show`, `404` JSON bila tidak ada.
  - Bukti: test `it shows a vacancy`, `it returns 404 for missing vacancy`.

### Fitur Opsional

- [x] ✅ **Update Vacancy** — `PUT/PATCH /api/vacancies/{id}`, hanya pemilik (403 jika bukan), `sometimes` untuk partial update.
- [x] ✅ **Delete Vacancy** — `DELETE /api/vacancies/{id}`, `204 No Content`, hanya pemilik.

### Praktik & Kualitas

- [x] ✅ **Laravel best practices** — Form Request, API Resource (`VacancyResource`), Policy (`VacancyPolicy`), Enum (`EmploymentType`), Eloquent scope (`searchByTitle`), CORS dibatasi ke origin frontend, respons JSON dipaksa untuk `api/*`.
- [x] ✅ **Database schema** — migrasi `vacancies` (dan `applications`), factory & seeder siap; MySQL/SQLite didukung melalui `.env`.
- [x] ✅ **Basic request validation** — required, max length, enum, `gte:salary_min`, `sometimes` pada update. Lulus uji 422.

Catatan: List memakai paginasi (10 per halaman), sehingga tidak mengembalikan "semua" lowongan dalam satu respons jika data >10. Ini disengaja & terdokumentasi; pencarian tetap berjalan per halaman.

## 3. Frontend (Next.js) + Integrasi API — 20 pts

- [x] ✅ **Fetch vacancy data dari backend Laravel** — `lib/api.ts` (`getVacancies`, `getVacancy`) memanggil `${NEXT_PUBLIC_API_URL}`.
- [x] ✅ **Job search by title** — `SearchBar` + halaman utama + `useDebouncedValue` 300 ms.
- [x] ✅ **TanStack Query (bobot maksimal)** — `QueryProvider`, `useQuery` dengan `queryKey: ["vacancies", search, page]`.
- [x] ✅ **Reusable Job Card** — `components/JobCard.tsx` dipakai ulang di halaman utama.
- [x] ⚠️ **Desain mengikuti Figma dengan presisi** — Token warna/radius/font diletakkan di `frontend/app/globals.css` (`@theme`) agar mudah disesuaikan; referensi Figma diletakkan di `frontend/public/ui figma/`. Perlu verifikasi manual visual side-by-side karena penyesuaian token final belum dilakukan (README juga mencatat ini).

## 4. UI & Styling — 20 pts

- [x] ✅ Styling memakai Tailwind CSS + komponen reusable (`JobCard`, `SearchBar`, `Header`, `AuthProvider`).
- [x] ✅ Status loading / error / empty state tersedia (skeleton, error-state, empty-state).
- [x] ⚠️ Kecocokan visual (spacing, warna brand, tipografi) terhadap Figma belum diverifikasi otomatis; bandingkan manual dengan screenshot di `frontend/public/ui figma/`.

## 5. Testing — 40 pts

### Backend (Laravel)

- [x] ✅ **Unit Test** — `tests/Unit/VacancyTest.php`: scope `searchByTitle` (partial, case-insensitive, empty), validasi `StoreVacancyRequest` (title, employment type, salary).
- [x] ✅ **Integration Test** — `tests/Feature/VacancyApiTest.php`, `AuthTest.php`, `ApplicationTest.php`: endpoint berinteraksi DB dan memvalidasi struktur/respons JSON. Hasil: **33 passed, 129 assertions**.

### Frontend (Next.js)

- [x] ✅ **E2E Playwright** — `e2e/vacancies.spec.ts` mencakup:
  - pengguna membuka daftar lowongan (`vacancy-list` + `job-card`),
  - pencarian berdasarkan title,
  - membuka detail lowongan dari kartu pertama.
  - Hasil run terakhir: **8 passed** (semua skenario wajib lulus).
- [x] ✅ `playwright.config.ts` otomatis menjalankan `npm run dev`; backend harus dijalankan & di-seed sebelumnya (dokumentasi lengkap di README root).

## 6. Submission — repo & dokumentasi

- [x] ✅ **README jelas + instruksi setup** — root `README.md`: menjalankan backend, frontend, MySQL opsional, akun demo, seluruh test (unit/integration/E2E), lint & typecheck.
- [ ] ⏳ **Upload ke repositori GitHub publik** — aksi pengguna: push repo dan pastikan akses publik.
- [ ] ⏳ **Kirim link via Google Form di email rekrutmen** — aksi pengguna.

## Rangkuman Poin Kritis

1. Semua fitur wajib + opsional backend (CRUD vacancy) **sudah ada** dan lulus test.
2. Search by title di backend & frontend **sudah ada** dan lulus E2E.
3. TanStack Query, reusable `JobCard`, Form Request, Policy, Enum, scope, validasi **sudah ada**.
4. Unit & integration backend + E2E Playwright wajib **semua lulus**.
5. **Satu hal yang masih perlu dituntaskan sebelum submit (bukan syarat fungsional):** verifikasi visual UI terhadap referensi Figma (token final warna/radius/font/spacing). Bandingkan manual dengan `frontend/public/ui figma/`.
6. Langkah terakhir adalah publikasi repositori GitHub dan pengiriman link (di luar kode).

Kesimpulan: dari sisi kode & test, proyek **memenuhi hampir seluruh syarat teknis** (status ⚠️ hanya pada kecocokan visual Figma yang perlu verifikasi manual). Setelah verifikasi UI & publikasi repo, siap disubmit.
