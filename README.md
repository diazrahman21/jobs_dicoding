# Dicoding Jobs

Sistem lowongan kerja sederhana untuk memenuhi technical exercise Dicoding. Terdiri dari
dua aplikasi dalam satu monorepo:

- **backend/** — RESTful API (Laravel 12, PHP 8.2+)
- **frontend/** — Antarmuka web (Next.js 16 App Router, TypeScript, Tailwind CSS, TanStack Query)

Fitur yang didukung:

1. **Recruiter** dapat mendaftar/masuk, lalu membuat, melihat, mengubah, dan menghapus lowongan miliknya (CRUD) agar tampil di platform.
2. **Job Seeker** dapat mendaftar/masuk, mencari lowongan berdasarkan judul (title), lalu **melamar** lowongan dan melihat daftar lamarannya.
3. **Pengunjung publik** dapat melihat dan mencari lowongan tanpa login.

Autentikasi memakai **Laravel Sanctum (API token)** dengan dua role: `recruiter` dan
`job_seeker`. Hanya recruiter yang membuat lowongan, dan hanya job seeker yang melamar.

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

## Akun Demo (hasil seed)

Setelah `php artisan migrate:fresh --seed`, tersedia dua akun untuk mencoba UI:

| Role       | Email                     | Password   |
| ---------- | ------------------------- | ---------- |
| Recruiter  | `recruiter@dicoding.jobs` | `password` |
| Job Seeker | `seeker@dicoding.jobs`    | `password` |

---

## Menjalankan Semua Test

### 1. Backend — unit & integration (PHPUnit)

Test memakai SQLite **in-memory** (lihat `backend/phpunit.xml`), tidak mengganggu database dev.

```bash
cd backend
php artisan test
```

Hasil yang diharapkan: semua test **hijau** (unit scope/validasi + feature API auth, role,
ownership, aplikasi, CRUD & search).

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

Endpoint **publik**:

| Method | Endpoint             | Deskripsi                                  |
| ------ | -------------------- | ------------------------------------------ |
| `POST` | `/register`          | Daftar akun (`role`: recruiter/job_seeker) |
| `POST` | `/login`             | Login, mengembalikan `{ user, token }`     |
| `GET`  | `/vacancies`         | Daftar lowongan (terbaru dulu, 10/halaman) |
| `GET`  | `/vacancies?search=` | Filter daftar berdasarkan judul (title)    |
| `GET`  | `/vacancies?page=2`  | Paginasi                                   |
| `GET`  | `/vacancies/{id}`    | Detail lowongan (404 JSON bila tidak ada)  |

Endpoint **butuh autentikasi** (header `Authorization: Bearer <token>`):

| Method   | Endpoint                              | Role         | Deskripsi                              |
| -------- | ------------------------------------- | ------------ | -------------------------------------- |
| `GET`    | `/me`                                 | semua        | Data user yang sedang login            |
| `POST`   | `/logout`                             | semua        | Cabut token aktif                      |
| `GET`    | `/vacancies/mine`                     | `recruiter`  | Daftar lowongan milik sendiri           |
| `POST`   | `/vacancies`                          | `recruiter`  | Membuat lowongan (201)                 |
| `PUT`    | `/vacancies/{id}`                     | `recruiter`  | Update lowongan miliknya sendiri       |
| `PATCH`  | `/vacancies/{id}`                     | `recruiter`  | Update sebagian lowongan miliknya      |
| `DELETE` | `/vacancies/{id}`                     | `recruiter`  | Hapus lowongan miliknya (204)          |
| `GET`    | `/applications`                       | `job_seeker` | Daftar lamaran milik user              |
| `POST`   | `/vacancies/{id}/applications`        | `job_seeker` | Melamar lowongan (201, anti-duplikat)  |

> Recruiter hanya bisa mengubah/menghapus lowongan **miliknya sendiri** (dijaga oleh
> `VacancyPolicy`, mengembalikan **403** bila bukan pemilik). Job seeker yang melamar dua kali
> mendapat **422**.

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

### Contoh: register & login

```bash
curl -X POST "http://localhost:8000/api/register" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password",
    "password_confirmation": "password",
    "role": "job_seeker"
  }'

curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{ "email": "recruiter@dicoding.jobs", "password": "password" }'
```

Respons login: `{ "user": { ... }, "token": "1|..." }`. Simpan `token` untuk request terautentikasi.

### Contoh: membuat lowongan (Recruiter)

```bash
TOKEN="<token hasil login recruiter>"

curl -X POST "http://localhost:8000/api/vacancies" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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

### Contoh: melamar lowongan (Job Seeker)

```bash
TOKEN="<token hasil login job seeker>"

curl -X POST "http://localhost:8000/api/vacancies/1/applications" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN"
```

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
- **Autentikasi Sanctum token**: login mengembalikan token API (bukan cookie/session) dan
  frontend menyimpannya di `localStorage`, lalu mengirim `Authorization: Bearer <token>` pada
  tiap request. Cocok untuk API lintas domain (frontend & backend beda port).
- **Otorisasi berbasis role**: middleware `EnsureUserHasRole` (alias `role`) membatasi route
  per role, sedangkan kepemilikan lowongan dijaga `VacancyPolicy` (hanya pemilik yang boleh
  update/delete) — 403 untuk pelanggaran otorisasi.
- **Anti-duplikat lamaran**: `ApplicationController` menolak lamaran kedua pada lowongan yang
  sama dengan 422, divalidasi di server (bukan hanya di UI).
- **Login/Register**: form menangani error 422 per kolom; komponen header menampilkan status
  login dan menu sesuai role. Halaman pasang lowongan & lamaran dilindungi di sisi klien agar
  pengunjung diarahkan login.

---

## Struktur Folder

```
dicoding-jobs/
├── backend/                       # Laravel 12
│   ├── app/
│   │   ├── Enums/{EmploymentType,UserRole}.php
│   │   ├── Http/
│   │   │   ├── Controllers/Api/{Auth,Vacancy,Application}Controller.php
│   │   │   ├── Middleware/EnsureUserHasRole.php
│   │   │   ├── Requests/{Register,Login,Store,Update}*Request.php
│   │   │   └── Resources/{Vacancy,User,Application}Resource.php
│   │   ├── Models/{User,Vacancy,Application}.php
│   │   └── Policies/VacancyPolicy.php
│   ├── config/cors.php
│   ├── bootstrap/app.php          # alias 'role' + shouldRenderJsonWhen
│   ├── database/
│   │   ├── factories/{Vacancy,Application,User}Factory.php
│   │   ├── migrations/*_{users,vacancies,applications}_table.php
│   │   └── seeders/{Database,Vacancy}Seeder.php
│   ├── routes/api.php
│   └── tests/
│       ├── Feature/{VacancyApi,Auth,Application}Test.php
│       └── Unit/VacancyTest.php
├── frontend/                      # Next.js 16
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # daftar + pencarian
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── my-applications/page.tsx
│   │   ├── my-vacancies/page.tsx     # daftar lowongan milik recruiter (CRUD)
│   │   └── vacancies/
│   │       ├── [id]/page.tsx      # detail + tombol Lamar/Edit/Hapus
│   │       ├── [id]/edit/page.tsx # form ubah lowongan (khusus recruiter)
│   │       └── new/page.tsx       # form buat lowongan (khusus recruiter)
│   ├── components/{Header,AuthProvider,JobCard,SearchBar,QueryProvider}.tsx
│   ├── lib/{api,auth,format,useDebouncedValue}.ts
│   ├── types/{vacancy,auth}.ts
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
