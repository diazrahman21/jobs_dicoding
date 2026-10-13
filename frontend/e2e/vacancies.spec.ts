import { expect, test } from "@playwright/test";

/**
 * Prasyarat (lihat README):
 * 1. Backend Laravel berjalan di http://localhost:8000
 * 2. Database sudah di-seed: `php artisan migrate:fresh --seed`
 * 3. Frontend Next.js berjalan (Playwright webServer menjalankannya otomatis).
 */

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

  test("membuat lowongan baru lalu melihatnya di halaman detail", async ({
    page,
  }) => {
    const uniqueTitle = `QA Engineer ${Date.now()}`;

    await page.goto("/vacancies/new");

    await page.getByTestId("title-input").fill(uniqueTitle);
    await page.getByTestId("company-name-input").fill("PT Quality Nusantara");
    await page.getByTestId("location-input").fill("Jakarta");
    await page.getByTestId("employment-type-select").selectOption("Full-time");
    await page
      .getByTestId("description-input")
      .fill("Menjaga kualitas produk melalui pengujian otomatis.");

    await page.getByTestId("submit-button").click();

    await expect(page).toHaveURL(/\/vacancies\/\d+$/);
    await expect(page.getByTestId("vacancy-title")).toHaveText(uniqueTitle);
  });
});
