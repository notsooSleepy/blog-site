import { expect, test } from "@playwright/test";
import { SITE_URL } from "../../src/config/site.mjs";

const productionOrigin = new URL(SITE_URL).origin;

test("filters gists across metadata, language, and code", async ({ page }) => {
  await page.goto("/gists");

  const search = page.getByRole("searchbox", { name: "Search gists" });
  const entries = page.locator("[data-gist]");

  await expect(search).toBeEnabled();
  await expect(entries.first()).toBeVisible();

  await search.fill("dolphin kbuildsycoca6");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "dolphin Arch repair" })).toBeVisible();
  await expect(page.locator("[data-search-status]")).toHaveText("1 gist");
  await expect(page).toHaveURL(/\?q=dolphin\+kbuildsycoca6$/);

  await search.fill("curl time_total");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Inspect an HTTP endpoint with curl" })).toBeVisible();

  await search.fill("not-a-real-gist");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(0);
  await expect(page.locator("[data-no-results]")).toBeVisible();
});

test("restores the filtered index through the detail back link", async ({ page }) => {
  await page.goto("/gists?q=dolphin");
  await page.getByRole("link", { name: "dolphin Arch repair" }).click();

  const backLink = page.getByRole("link", { name: "Back to gists" });
  await expect(backLink).toHaveAttribute("href", "/gists?q=dolphin");
  await backLink.click();

  await expect(page.getByRole("searchbox", { name: "Search gists" })).toHaveValue("dolphin");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
});

test("copies one code block and reports success", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4400"
  });
  await page.goto("/gists/curl-http-diagnostics");

  const copyButton = page.getByRole("button", {
    name: "Copy bash code from Follow redirects and show headers"
  });
  await copyButton.click();

  await expect(copyButton).toHaveText("Copied");
  await expect(page.getByRole("status").first()).toHaveText("Code copied to clipboard");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
    "curl --include --location"
  );
});

test("emits metadata and exposes skip navigation", async ({ page }) => {
  await page.goto("/gists/curl-http-diagnostics");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${productionOrigin}/gists/curl-http-diagnostics/`
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
