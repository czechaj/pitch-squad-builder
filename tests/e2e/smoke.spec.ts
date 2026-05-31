import { expect, test } from "@playwright/test";

test("admin page smoke renders and flow actions are available", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Admin Akisi" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ilk Admin Hesabi Olustur" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin Girisi" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Davetli Girisi" })).toBeVisible();
});
