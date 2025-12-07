// @ts-check
import { test, expect } from "@playwright/test";

test("log canvas present", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.locator('#log').click();
  await page.locator('log-content').press('f');

  await expect(page.locator('log-content')).toContainText('line 0');
  await page.locator('log-content').press('ArrowUp');
});

