// @ts-check
import { test, expect } from "@playwright/test";

test("log canvas present", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.waitForTimeout(100);
  await page.locator("#log").click();

  await expect(page.locator("log-content")).toContainText("line ");
  await expect(page.locator("#follow")).toBeChecked();

  await page.locator("log-content").press("g");
  await expect(page.locator("log-content")).toContainText("line 0");
  await expect(page.locator("#offsetEntries")).toHaveValue("0");
  await expect(page.locator("#selected")).toHaveValue("0");
  await expect(page.locator("#follow")).not.toBeChecked();

  /*
  await page.locator("log-content").press("ArrowDown");
  await expect(page.locator("log-content")).toContainText("line 0");
  await expect(page.locator("#selected")).toHaveValue("1");
*/

});
