import { expect, test, type Page } from "@playwright/test";

/**
 * Prasyarat (lihat README):
 * 1. Backend Laravel berjalan di http://localhost:8000
 * 2. Database sudah di-seed: `php artisan migrate:fresh --seed`
 * 3. Frontend Next.js berjalan (Playwright webServer menjalankannya otomatis).
 */

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("current-user")).toBeVisible();
}

test.describe("Dicoding Jobs", () => {
  test("menampilkan daftar lowongan dengan minimal satu kartu", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("vacancy-list")).toBeVisible();
    await expect(page.getByTestId("job-card").first()).toBeVisible();
  });

  test("mencari lowongan berdasarkan title", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByTestId("search-input");
    await searchInput.fill("Backend");

    await expect
      .poll(async () => {
        const titles = await page
          .getByTestId("vacancy-title")
          .allTextContents();

        return (
          titles.length > 0 &&
          titles.every((title) => /backend/i.test(title))
        );
      })
      .toBe(true);
  });

  test("menampilkan empty state saat pencarian tidak menemukan hasil", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("search-input").fill("zzz-tidak-ada-lowongan");

    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("job-card")).toHaveCount(0);
  });

  test("membuka detail lowongan dari kartu pertama", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.getByTestId("job-card").first();
    await expect(firstCard).toBeVisible();

    const href = await firstCard.getAttribute("href");
    const cardTitle = (
      await firstCard.getByTestId("vacancy-title").innerText()
    ).trim();

    expect(href).toMatch(/^\/vacancies\/\d+$/);

    await firstCard.click();

    await expect(page).toHaveURL(/\/vacancies\/\d+$/);
    await expect(page.getByTestId("vacancy-title")).toHaveText(cardTitle);
  });

  test("pengunjung diarahkan untuk login saat mengakses halaman pasang lowongan", async ({
    page,
  }) => {
    await page.goto("/vacancies/new");

    await expect(page.getByTestId("login-required")).toBeVisible();
    await expect(page.getByTestId("title-input")).toHaveCount(0);
  });

  test("recruiter dapat login lalu membuat lowongan baru", async ({ page }) => {
    const uniqueTitle = `QA Engineer ${Date.now()}`;

    await login(page, "recruiter@dicoding.jobs", "password");

    await page.goto("/vacancies/new");

    await page.getByTestId("title-input").fill(uniqueTitle);
    await page.getByTestId("company-name-input").fill("PT Quality Nusantara");
    await page.getByTestId("location-select").selectOption("Jakarta");
    await page.getByRole("radio", { name: "Full-time" }).check();
    await page
      .getByTestId("description-input")
      .fill("Menjaga kualitas produk melalui pengujian otomatis.");

    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(/\/vacancies\/\d+$/);
    await expect(page.getByTestId("vacancy-title")).toHaveText(uniqueTitle);
  });

  test("job seeker dapat daftar, melamar, lalu melihat lamarannya", async ({
    page,
  }) => {
    const uniqueEmail = `seeker-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByTestId("register-role").selectOption("job_seeker");
    await page.getByTestId("register-name").fill("QA Seeker");
    await page.getByTestId("register-email").fill(uniqueEmail);
    await page.getByTestId("register-password").fill("Password123");
    await page
      .getByTestId("register-password-confirmation")
      .fill("Password123");
    await page.getByTestId("register-submit").click();

    await expect(page.getByTestId("current-user")).toBeVisible();

    await page.goto("/");
    const firstCard = page.getByTestId("job-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    await expect(page).toHaveURL(/\/vacancies\/\d+$/);
    await page.getByTestId("apply-button").click();
    await expect(page.getByTestId("apply-status")).toBeVisible();

    await page.goto("/my-applications");
    await expect(page.getByTestId("application-list")).toBeVisible();
    await expect(page.getByTestId("application-card").first()).toBeVisible();
  });

  test("job seeker tidak dapat mengakses halaman pasang lowongan", async ({
    page,
  }) => {
    await login(page, "seeker@dicoding.jobs", "password");

    await page.goto("/vacancies/new");

    await expect(page.getByTestId("title-input")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Akses ditolak" }),
    ).toBeVisible();
  });
});
