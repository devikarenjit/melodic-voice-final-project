import { test, expect } from "@playwright/test";

test("critical user flow: Dashboard to AI Stories", async ({ page }) => {
  await page.goto("https://melodic-voice-final-project.vercel.app/dashboard", {
    waitUntil: "networkidle",
  });

  // Dashboard should load
  await expect(page).toHaveURL(/\/dashboard/);

  // Dashboard contains the AI Stories activity
  await expect(
    page.getByText("AI Stories", { exact: true }).first()
  ).toBeVisible();

  // Open AI Stories
  await page.getByText("AI Stories", { exact: true }).first().click();

  // AI Stories page should load
  await expect(page).toHaveURL(/\/ai-stories/);

  // Confirm the page content
  await expect(
    page.getByRole("heading", { name: "AI Stories" })
  ).toBeVisible();
});