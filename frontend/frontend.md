# PERAN
Kamu adalah senior frontend engineer. Bangun frontend "Dicoding Jobs" dengan Next.js di folder `frontend/` pada monorepo yang backend Laravel-nya (`backend/`) SUDAH selesai. Kerjakan bertahap, jalankan lint, build, dan test di setiap tahap, dan jangan menyatakan selesai sebelum semuanya hijau. Jangan mengubah isi `backend/` kecuali aku minta; bila ada ketidakcocokan API, laporkan dan usulkan perbaikan.

# KONTEKS
Dua user story: (1) Recruiter membuat lowongan baru; (2) Job Seeker mencari lowongan berdasarkan title. Penilaian frontend: integrasi API + pencarian (20 poin, TanStack Query dianjurkan), UI dan styling (20 poin, harus mengikuti desain Figma sedekat mungkin, wajib ada komponen JobCard reusable), E2E Playwright (bagian dari 40 poin testing).

# TECH STACK (WAJIB)
Next.js (App Router, TypeScript), Tailwind CSS, TanStack Query, font Inter (`next/font`), Playwright untuk E2E.

# LANGKAH 0: PELAJARI BACKEND DULU
Sebelum menulis kode frontend:
1. Baca `backend/routes/api.php`, `VacancyController`, `VacancyResource`, `StoreVacancyRequest`, dan migration `vacancies`.
2. Jalankan backend (`php artisan migrate --seed && php artisan serve`) lalu panggil `GET /api/vacancies`, `GET /api/vacancies?search=android`, `GET /api/vacancies/{id}`, dan `POST /api/vacancies` dengan data tidak valid. Catat bentuk JSON sebenarnya (pembungkus `data`, struktur paginasi `links` dan `meta`, nama field, format tanggal, format error 422).
3. Bentuk `types/vacancy.ts` dari respons NYATA itu. Kontrak yang kuharapkan (verifikasi, jangan diasumsikan): field `id, title, position, company_name, business_sector, employee_range, location, is_remote, employment_type, min_experience, candidates_needed, active_until, description, responsibilities, requirements, salary_min, salary_max, show_salary, created_at`; nilai tetap `position` (Back-End Developer, Front-End Developer, iOS Developer, Android Developer, Multi-Platform Developer), `employment_type` (Full-Time, Part-Time, Kontrak, Intern), `min_experience` (Kurang dari 1 tahun, 1-3 tahun, 4-5 tahun, 6-10 tahun, Lebih dari 10 tahun). Bila nama field atau nilai di backend berbeda, ikuti backend dan sesuaikan form serta tampilan.
4. Jika ada field di Figma yang tidak ada di backend (atau sebaliknya), tampilkan daftar perbedaannya kepadaku sebelum lanjut, lalu pilih default paling masuk akal.

# TAHAP 1: SETUP
1. `npx create-next-app@latest frontend --typescript --tailwind --app --eslint`; pasang `@tanstack/react-query`.
2. `.env.example`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`; salin ke `.env.local`.
3. Aset gambar ada di `frontend/public/images/`: `hero-photo.jpg` (foto hero), `company-logo.png` (logo kartu, navy), `footer-logo.png`. Pakai apa adanya, jangan digambar ulang.
4. Struktur: `lib/api.ts` (getVacancies, getVacancy, createVacancy; tangani 422 menjadi error per field dan error jaringan), `lib/format.ts` (tanggal Indonesia, Rupiah), `types/vacancy.ts`, `components/` (`QueryProvider`, `Navbar`, `Hero`, `Footer`, `JobCard`, `SearchBar`, `VacancyForm`, `Badge`, `Skeleton`), `app/` (halaman).
5. Konfigurasi token desain di `tailwind.config` atau CSS variables (lihat bagian Token).

# TOKEN DESAIN (dari Figma)
- Font Inter. Body 16/22, kecil 14/20, ekstra kecil 12/17. Judul: H1 40/56, H4 24/34, H5 20/28, H6 16/22 (semibold). Letter-spacing sedikit negatif (sekitar -1% pada 16px, -2% pada 40px).
- Navy `#2d3e50` (brand, tombol utama; hover `#1f3044`; disabled opasitas 60%).
- Biru `#3b82f6` (link, label, teks badge), border badge `#60a5fa`, latar badge `#eff6ff`.
- Teks: utama `#18181b`, isi `#3f3f46`, sekunder `#52525b`, hint `#a1a1aa`, footer `#71717a`.
- Latar dan garis: border `#e4e4e7`, permukaan `#f4f4f5`, tombol sekunder `#fafafa`, hero `#18181b`.
- Danger: teks `#e11d48`, latar tombol hapus `#fecdd3`.
- Radius: kartu 4px, input dan tombol 2px, badge pil 32px.

# TAHAP 2: LAYAR (lebar desain 1440px, konten dipusatkan; buat responsif untuk mobile)
- **Navbar (semua halaman)**: tinggi 70px, putih, garis bawah 1px `#e4e4e7`. Kiri: ikon logo 28px + teks "Jobs" (Medium 20px, navy), padding kiri 60px. Menu "Lowongan Kerja" dan "Dashboard" (16px, jarak 32px), garis aktif 20x4px di bawah menu yang aktif.
- **Daftar `/`**: Hero tinggi 262px latar `#18181b`: label "Dicoding Jobs" (20px semibold biru), judul H1 40px putih "Temukan lowongan yang cocok untuk kamu" dengan foto berbentuk pil (203x61px, radius 32px, `hero-photo.jpg`) disisipkan sebaris judul. Di bawahnya konten putih selebar 730px: judul "Daftar Pekerjaan Terbaru" (24px semibold) dan kolom pencarian 346x44px di kanan (border 1px, radius 4px, ikon cari 20px, placeholder "Pekerjaan apa yang sedang kamu cari?" 14px). Daftar kartu dengan jarak 24px.
- **JobCard** (reusable, menerima satu `Vacancy` lewat props): 730x128px, border 1px `#e4e4e7`, radius 4px, padding 16px. Kiri: logo 96x96px radius 4px. Tengah: judul 16px semibold; baris 1: ikon gedung + nama perusahaan, lalu tipe pekerjaan; baris 2: ikon lokasi + kota, lalu ikon tas + pengalaman (12px, `#18181b`). Kanan, rata kanan 12px `#52525b`: "Dibuat pada 15 Desember 2023" dan "Lamar sebelum 30 Desember 2023" (format tanggal Indonesia dari `created_at` dan `active_until`). Seluruh kartu adalah tautan ke detail.
- **Hasil pencarian**: tata letak sama dengan daftar; judul bagian menjadi "Hasil Pencarian" dan kolom pencarian berisi kata kunci. Tanpa hasil: state kosong "Lowongan tidak ditemukan".
- **Detail `/vacancies/[id]`**: latar putih. Kepala: logo 96px, judul 24px semibold, "Sektor Bisnis: Technology" (14px semibold `#52525b`), baris info 12px `#3f3f46` (ikon gedung + perusahaan, ikon lokasi + kota, ikon pengguna + jumlah karyawan). Badge pil tipe pekerjaan (latar `#eff6ff`, border `#60a5fa`, teks `#3b82f6` 14px semibold). Bagian selebar 730px, jarak 32px: "Job Description", "Responsibilities", "Requirements" (judul 20px semibold, isi 16px dengan baris baru dipertahankan, sembunyikan bagian yang kosong), lalu "Informasi Tambahan" berisi "Pengalaman bekerja" dan "Kandidat yang dibutuhkan" (judul 16px semibold, nilai 16px). ID tidak ada: tampilkan halaman not found.
- **Buat lowongan `/vacancies/new`**: hero seperti daftar dengan judul "Buat lowongan pekerjaan" dan subteks "Dicoding Jobs menghubungkan industri dengan talenta yang tepat. Mencari tim baru tidak harus melelahkan dan boros biaya." Form selebar 600px, jarak antar field 32px, label 16px, input tinggi 48px (border 1px, radius 2px, placeholder `#52525b`), hint 14px `#52525b`. Field berurutan (sesuaikan dengan field backend hasil Langkah 0):
  1. Judul lowongan * (placeholder "Masukkan judul lowongan", hint "Contoh: Android Native Developer")
  2. Posisi * (dropdown "Pilih posisi yang dicari")
  3. Tipe pekerjaan * (radio: Full-Time, Part-Time, Kontrak, Intern)
  4. Kandidat yang dibutuhkan * (angka; placeholder "Masukkan jumlah kandidat yang dibutuhkan"; hint "Silakan isi jumlah kandidat yang dibutuhkan untuk lowongan ini.")
  5. Aktif hingga * (tanggal; hint "Lowongan akan aktif hingga tanggal yang Anda pilih pukul 23:59:59")
  6. Lokasi * (dropdown "Pilih lokasi": Bandung, Jakarta, Yogyakarta, Surabaya) + checkbox "Bisa remote"
  7. Deskripsi * (area teks; tautan biru "Gunakan contoh template" mengisi templat berisi judul "Deskripsi Pekerjaan" dengan isi "Sebagai [Posisi Lowongan], Anda akan berpartisipasi dalam proses pembangunan aplikasi yang sedang dibangun dalam perusahaan [Nama Perusahaan]. Anda juga diharapkan mampu bekerja dalam tim." dan judul "Tanggung Jawab" dengan isi "Membuat atau memodifikasi program yang sudah ada. Bertanggung jawab dalam mengelola program."; hint "Anda bisa mengubah templat yang telah disediakan di atas.")
  8. Tanggung jawab dan Persyaratan (dua area teks opsional, gaya sama; hanya jika backend punya kolomnya)
  9. Rentang gaji per bulan * (dua input Minimum dan Maksimum dengan tanda "-"; hint 'Anda tidak perlu mengisi kolom "Maksimum" jika yang dimasukkan adalah gaji pokok.'; toggle "Tampilkan gaji" dengan hint "Gaji akan ditampilkan di lowongan pekerjaan dan dapat dilihat oleh kandidat.")
  10. Minimum pengalaman bekerja * (radio: Kurang dari 1 tahun, 1-3 tahun, 4-5 tahun, 6-10 tahun, Lebih dari 10 tahun)
  Tombol: "Buat lowongan" (utama, 160x40px, navy, teks putih 16px) dan "Batal" (sekunder, 78x40px, latar `#fafafa`, border `#e4e4e7`). Validasi sisi klien untuk field wajib; tampilkan error 422 dari backend per field; setelah sukses arahkan ke halaman detail lowongan baru.
- **Footer (semua halaman)**: latar putih, logo `footer-logo.png` 138x34px dan alamat "Dicoding Space, Jl. Batik Kumeli No.50, Sukaluyu, Kec. Cibeunying Kaler, Kota Bandung Jawa Barat 40123" (18px `#71717a`).
- **Dashboard `/dashboard` (opsional, kerjakan terakhir)**: latar `#f4f4f5`, sidebar kiri, judul "Lowongan Saya", tombol utama tambah lowongan, kartu 831x142px radius 8px dengan tombol Edit dan Hapus (danger `#fecdd3`); hubungkan ke endpoint update dan delete bila backend menyediakannya.

# TAHAP 3: PERILAKU DAN INTEGRASI API
- Daftar: `useQuery` dengan queryKey `['vacancies', search, page]`, parameter `?search=` dan `?page=`, debounce pencarian 300 ms, simpan kata kunci di query string URL (`/?search=...`) agar bisa dibagikan dan di-refresh. Tampilkan skeleton saat loading, state kosong, state error dengan tombol coba lagi, dan paginasi sederhana sesuai struktur paginasi backend.
- Detail: `useQuery(['vacancy', id])`. Buat: `useMutation`, lalu invalidasi `['vacancies']`.
- Tambahkan `data-testid`: `search-input`, `vacancy-list`, `job-card`, `vacancy-title`, `empty-state`, `vacancy-form`, `submit-button`.
- Aksesibel: label terhubung ke input, fokus terlihat, kontras cukup, ikon dekoratif `aria-hidden`.
- Jangan menebak detail visual yang tidak ada di spesifikasi ini; bila ragu, tanyakan.

# TAHAP 4: E2E PLAYWRIGHT (WAJIB)
1. `npm init playwright@latest` (TypeScript, folder `e2e`) dan `npx playwright install chromium`. `playwright.config.ts`: `baseURL http://localhost:3000` dan `webServer` yang menjalankan `npm run dev`.
2. `e2e/vacancies.spec.ts` dengan tiga skenario wajib:
   - User membuka halaman daftar: `vacancy-list` tampil dan minimal satu `job-card`.
   - User mencari berdasarkan title (pakai kata yang ada di seeder, misalnya "Android"): semua kartu yang tampil memuat kata itu; pencarian tanpa hasil menampilkan `empty-state`.
   - User melihat detail: klik kartu pertama, URL menjadi `/vacancies/<id>`, judul detail sama dengan judul di kartu.
   Tambahan: isi form buat lowongan lalu pastikan terlihat di halaman detail.
3. Assertion auto-wait, tanpa `waitForTimeout`. Data berasal dari backend nyata yang sudah di-seed (`php artisan migrate:fresh --seed`); tulis prasyaratnya di README.

# TAHAP 5: README (BAGIAN FRONTEND) DAN VERIFIKASI
Tambahkan ke `README.md` di root: cara menjalankan frontend (`cd frontend`, `npm install`, salin `.env.example` ke `.env.local`, `npm run dev`), cara menjalankan E2E (`npx playwright test`, dengan backend menyala dan ter-seed), struktur folder frontend, dan keputusan desain (termasuk field yang berbeda dari Figma). Lalu verifikasi: `npm run lint`, `npm run build`, `npx playwright test` semuanya hijau, dan bandingkan tiap layar dengan spesifikasi di atas.

# ATURAN KERJA
- Kerjakan per tahap; jalankan lint, build, dan test sampai hijau sebelum lanjut.
- Commit kecil dengan pesan jelas (`feat:`, `test:`, `docs:`).
- Tanpa hardcode URL; semua lewat env. Jangan commit `.env.local`.
- Jangan menambah fitur di luar lingkup (tanpa login).
- Bila ada hal ambigu, pilih default paling masuk akal, catat di README, dan beri tahu aku.

# DEFINISI SELESAI
- [ ] Daftar, pencarian title, detail, dan form buat lowongan berjalan terhadap backend nyata
- [ ] `JobCard` reusable; semua layar sesuai spesifikasi Figma di atas
- [ ] Error validasi 422 tampil per field di form
- [ ] `npm run lint` dan `npm run build` lulus
- [ ] `npx playwright test` hijau (list, search, detail)
- [ ] README bagian frontend lengkap dan sudah diuji dari clone baru
- [ ] Tidak ada `.env.local` atau secret ter-commit

Di akhir, laporkan: ringkasan yang dibuat, hasil lint, build, dan test, perbedaan antara Figma dan backend yang kamu temukan, serta hal yang belum bisa dipastikan.