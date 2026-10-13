# Dicoding Jobs

Sistem lowongan kerja sederhana untuk memenuhi technical exercise Dicoding. Terdiri dari
dua aplikasi dalam satu monorepo:

- **backend/** — RESTful API (Laravel 12, PHP 8.2+)
- **frontend/** — Antarmuka web (Next.js 16 App Router, TypeScript, Tailwind CSS, TanStack Query)

Fitur yang didukung:

1. **Recruiter** dapat membuat lowongan baru agar tampil di platform.
2. **Job Seeker** dapat mencari lowongan berdasarkan judul (title).

---

## Tech Stack

| Layer     | Teknologi                                                        |
| --------- | ---------------------------------------------------------------- |
| Backend   | Laravel 12 (PHP 8.2+), RESTful API                                |
| Frontend  | Next.js 16 (App Router, TypeScript), Tailwind CSS, TanStack Query |
| Database  | SQLite (development & test). MySQL juga didukung (lihat bawah)    |
| Test      | PHPUnit (unit + feature/integration), Playwright (E2E)            |

---

## Prasyarat

- PHP **8.2+** dengan ekstensi `pdo_sqlite`, `mbstring`, `openssl`, `curl`
- Composer **2.x**
- Node.js **20+** (disarankan 22/24) dan npm
- Git

> Database default proyek ini adalah **SQLite** agar bisa dijalankan tanpa server database
> tambahan. File database dibuat otomatis di `backend/database/database.sqlite`.
> Untuk memakai **MySQL**, lihat bagian [Menggunakan MySQL](#menggunakan-mysql-opsional).

---

## Menjalankan Backend

```bash
cd backend
composer install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Backend berjalan di `http://localhost:8000`. Cek cepat:

```bash
curl "http://localhost:8000/api/vacancies?search=Backend"
```

### Menggunakan MySQL (opsional)

1. Buat database, misalnya `dicoding_jobs`.
2. Sesuaikan `backend/.env`:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dicoding_jobs
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. Jalankan `php artisan migrate:fresh --seed`.

---

## Menjalankan Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

`NEXT_PUBLIC_API_URL` menentukan alamat API backend (default `http://localhost:8000/api`).

---

## Menjalankan Semua Test

### 1. Backend — unit & integration (PHPUnit)

Test memakai SQLite **in-memory** (lihat `backend/phpunit.xml`), tidak mengganggu database dev.

```bash
cd backend
php artisan test
```

Hasil yang diharapkan: semua test **hijau** (unit scope/validasi + feature API CRUD & search).

### 2. E2E (Playwright)

**Prasyarat:** backend harus **berjalan** dan **sudah di-seed** dengan data nyata.

```bash
# Terminal 1 — backend harus hidup dan ter-seed
cd backend
php artisan migrate:fresh --seed
php artisan serve

# Terminal 2 — jalankan E2E (Playwright otomatis menyalakan `npm run dev`)
cd frontend
npm install
npx playwright install chromium   # sekali saja
npx playwright test
```

Playwright akan otomatis menjalankan `npm run dev` (dikonfigurasi di `frontend/playwright.config.ts`).
Jika frontend sudah berjalan di port 3000, server tersebut akan dipakai ulang.

Menjalankan satu file / mode UI:

```bash
npx playwright test e2e/vacancies.spec.ts
npx playwright test --ui
```

### 3. Lint & typecheck frontend

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

---

## API Endpoints

Base URL: `http://localhost:8000/api`

| Method   | Endpoint              | Deskripsi                                    |
| -------- | --------------------- | -------------------------------------------- |
| `GET`    | `/vacancies`          | Daftar lowongan (terbaru dulu, 10/halaman)   |
| `GET`    | `/vacancies?search=`  | Filter daftar berdasarkan judul (title)      |
| `GET`    | `/vacancies?page=2`   | Paginasi                                     |
| `POST`   | `/vacancies`          | Membuat lowongan (201)                       |
| `GET`    | `/vacancies/{id}`     | Detail lowongan (404 JSON bila tidak ada)    |
| `PUT`    | `/vacancies/{id}`     | Update lowongan                              |
| `PATCH`  | `/vacancies/{id}`     | Update sebagian lowongan                     |
| `DELETE` | `/vacancies/{id}`     | Hapus lowongan (204)                         |

### Contoh: daftar + paginasi

```bash
curl "http://localhost:8000/api/vacancies?search=Backend&page=1"
```

```json
{
  "data": [
    {
      "id": 1,
      "title": "Backend Engineer",
      "company_name": "PT Teknologi Nusantara",
      "location": "Jakarta",
      "employment_type": "Full-time",
      "salary_min": 8000000,
      "salary_max": 15000000,
      "description": "...",
      "requirements": "...",
      "created_at": "2026-10-13T01:00:00.000000Z",
      "updated_at": "2026-10-13T01:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/vacancies?search=Backend&page=1",
    "last": "http://localhost:8000/api/vacancies?search=Backend&page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 10,
    "to": 1,
    "total": 1
  }
}
```

### Contoh: membuat lowongan

```bash
curl -X POST "http://localhost:8000/api/vacancies" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Backend Engineer",
    "company_name": "PT Teknologi Nusantara",
    "location": "Jakarta",
    "employment_type": "Full-time",
    "description": "Membangun layanan backend.",
    "requirements": "PHP, Laravel, MySQL.",
    "salary_min": 5000000,
    "salary_max": 10000000
  }'
```

Respons: **201 Created** berisi `{ "data": { ... } }`.

### Contoh: error validasi (422)

```json
{
  "message": "The title field is required. (and 1 more error)",
  "errors": {
    "title": ["The title field is required."],
    "salary_max": ["The salary max field must be greater than or equal to salary min."]
  }
}
```

### Nilai `employment_type` yang valid

`Full-time`, `Part-time`, `Contract`, `Internship`, `Freelance`
(didefinisikan sekali di `app/Enums/EmploymentType.php` dan dipakai ulang oleh validasi).

---

## Keputusan Desain

- **Enum `EmploymentType`** mendefinisikan daftar tipe kerja di satu tempat, lalu dipakai di
  validasi (`Rule::enum`) sehingga tidak ada duplikasi daftar nilai.
- **`scopeSearchByTitle`** di model `Vacancy` menjadi satu-satunya tempat logika pencarian.
  Term di-`trim`; bila kosong, query mengembalikan semua data. Controller tetap tipis.
- **Form Request** (`StoreVacancyRequest` / `UpdateVacancyRequest`) memisahkan validasi dari
  controller. Update memakai `sometimes` agar mendukung partial update.
- **`VacancyResource`** menstabilkan bentuk JSON (mis. `employment_type` selalu string) dan
  paginasi mengikuti format bawaan Laravel (`data` + `links` + `meta`).
- **Error JSON tanpa header `Accept`**: `bootstrap/app.php` memaksa respons JSON untuk request
  `api/*` melalui `shouldRenderJsonWhen`, sehingga 404/422 selalu berupa JSON.
- **CORS** dibatasi ke `api/*` dengan origin dari env `FRONTEND_URL` (default
  `http://localhost:3000`), bukan `*`.
- **Database**: SQLite dipakai untuk kemudahan menjalankan proyek; test memakai SQLite
  in-memory. MySQL didukung lewat konfigurasi `.env`.
- **Frontend**: TanStack Query mengelola cache & state server (`queryKey: ['vacancies', search, page]`),
  pencarian di-debounce 300 ms, dan error 422 dari API dipetakan ke error per kolom pada form.
- **`cacheComponents` dinonaktifkan** di `next.config.ts`. Fitur tersebut (aktif secara default
  di create-next-app versi ini) memprerender Client Component dan memicu error "current time"
  saat TanStack Query dijalankan. Menonaktifkannya membuat client-side fetching stabil. Ini bisa
  ditinjau ulang bila nanti memakai pola hydration/server data.
- **Design token placeholder**: karena referensi Figma belum tersedia, warna/radius/font
  diletakkan sebagai token di `frontend/app/globals.css` (`@theme`) sehingga mudah diganti
  dari satu tempat tanpa menyentuh komponen.
- **Tanpa autentikasi** sesuai lingkup (hanya dua user story).

---

## Struktur Folder

```
dicoding-jobs/
├── backend/                       # Laravel 12
│   ├── app/
│   │   ├── Enums/EmploymentType.php
│   │   ├── Http/
│   │   │   ├── Controllers/Api/VacancyController.php
│   │   │   ├── Requests/{Store,Update}VacancyRequest.php
│   │   │   └── Resources/VacancyResource.php
│   │   └── Models/Vacancy.php
│   ├── config/cors.php
│   ├── database/
│   │   ├── factories/VacancyFactory.php
│   │   ├── migrations/*_create_vacancies_table.php
│   │   └── seeders/{Database,Vacancy}Seeder.php
│   ├── routes/api.php
│   └── tests/
│       ├── Feature/VacancyApiTest.php
│       └── Unit/VacancyTest.php
├── frontend/                      # Next.js 16
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # daftar + pencarian
│   │   └── vacancies/
│   │       ├── [id]/page.tsx      # detail
│   │       └── new/page.tsx       # form buat lowongan
│   ├── components/{JobCard,SearchBar,QueryProvider}.tsx
│   ├── lib/{api,format,useDebouncedValue}.ts
│   ├── types/vacancy.ts
│   ├── e2e/vacancies.spec.ts
│   └── playwright.config.ts
├── .gitignore
└── README.md
```

---

## Catatan Lingkungan (yang belum bisa dipastikan)

- **Desain visual Figma**: referensi Figma belum diterima saat pengerjaan, sehingga UI memakai
  token warna/radius/spacing netral yang siap diganti. Detail visual (warna brand final, bentuk
  kartu, tipografi) perlu disesuaikan lagi setelah referensi tersedia.
- **MySQL** tidak dijalankan di lingkungan build; alur default memakai SQLite. Konfigurasi MySQL
  sudah disiapkan dan didokumentasikan.
