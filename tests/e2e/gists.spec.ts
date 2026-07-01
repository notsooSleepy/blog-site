import { expect, test } from "@playwright/test";
import { SITE_URL } from "../../src/config/site.mjs";

const productionOrigin = new URL(SITE_URL).origin;

test("filters gists across metadata, language, and code", async ({ page }) => {
  await page.goto("/gists");

  const search = page.getByRole("searchbox", { name: "Search gists" });
  const entries = page.locator("[data-gist]");

  await expect(search).toBeEnabled();
  await expect(entries.first()).toBeVisible();

  await page.getByRole("button", { name: "curl", exact: true }).click();
  await expect(search).toHaveValue("curl");
  await expect(search).toBeFocused();
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page).toHaveURL(/\?q=curl$/);

  await search.fill("dolphin kbuildsycoca6");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Dolphin Arch repair" })).toBeVisible();
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
  await page.getByRole("link", { name: "Dolphin Arch repair" }).click();

  const backLink = page.getByRole("link", { name: "Back to gists" });
  await expect(backLink).toHaveAttribute("href", "/gists?q=dolphin");
  await backLink.click();

  await expect(page.getByRole("searchbox", { name: "Search gists" })).toHaveValue("dolphin");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
});

test("uses a native card link without hijacking gist controls", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4400"
  });
  await page.goto("/gists");

  const entry = page.locator("[data-gist]", { hasText: "Inspect an HTTP endpoint with curl" });
  const copyButton = entry.getByRole("button", {
    name: "Copy bash code from Follow redirects and show headers"
  });

  await copyButton.click();
  await expect(copyButton).toHaveText("Copied");
  await expect(page).toHaveURL(/\/gists\/?$/);

  const reference = page.getByRole("link", { name: /github\.com\/prasanthrangan/ });
  await reference.evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
  });
  await reference.click();
  await expect(page).toHaveURL(/\/gists\/?$/);

  const code = entry.locator("code").first();
  const box = await code.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + 8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + Math.min(box.width - 8, 120), box.y + box.height / 2);
    await page.mouse.up();
  }
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).not.toBe("");
  await expect(page).toHaveURL(/\/gists\/?$/);

  const bodyText = entry.getByText("Add endpoint at the end");
  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  const bodyTextBox = await bodyText.boundingBox();
  expect(bodyTextBox).not.toBeNull();
  if (bodyTextBox) {
    await page.mouse.move(bodyTextBox.x + 2, bodyTextBox.y + bodyTextBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      bodyTextBox.x + Math.min(bodyTextBox.width - 2, 90),
      bodyTextBox.y + bodyTextBox.height / 2
    );
    await page.mouse.up();
  }
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toContain("Add");
  await expect(page).toHaveURL(/\/gists\/?$/);

  const openedPage = context.waitForEvent("page");
  const description = entry.getByText("Check response headers, redirects, status, and request timing");
  const descriptionBox = await description.boundingBox();
  expect(descriptionBox).not.toBeNull();
  if (descriptionBox) {
    await page.mouse.click(
      descriptionBox.x + descriptionBox.width / 2,
      descriptionBox.y + descriptionBox.height / 2,
      { button: "middle" }
    );
  }
  await expect(await openedPage).toHaveURL(/\/gists\/curl-http-diagnostics$/);
});

test("renders tags as non-interactive labels without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/gists");

  await expect(page.locator('[data-gist-tag="curl"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "curl", exact: true })).toHaveCount(0);

  await context.close();
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
