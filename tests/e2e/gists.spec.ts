import { expect, test } from "@playwright/test";

test("filters gists across metadata, language, and code", async ({ page }) => {
  await page.goto("/gists");

  const search = page.getByRole("searchbox", { name: "Search gists" });
  const entries = page.locator("[data-gist]");

  await expect(search).toBeEnabled();
  await expect(entries).toHaveCount(5);

  await search.fill("systemd FragmentPath");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page.getByText("Debug a failing systemd service", { exact: true })).toBeVisible();
  await expect(page.locator("[data-search-status]")).toHaveText("1 gist");
  await expect(page).toHaveURL(/\?q=systemd\+FragmentPath$/);

  await search.fill("javascript console.log");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
  await expect(page.getByText("Hello world in Bash and JavaScript", { exact: true })).toBeVisible();

  await search.fill("not-a-real-gist");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(0);
  await expect(page.locator("[data-no-results]")).toBeVisible();
});

test("restores the filtered index through the detail back link", async ({ page }) => {
  await page.goto("/gists?q=docker");
  await page.getByRole("link", { name: "Inspect a failing Docker container" }).click();

  const backLink = page.getByRole("link", { name: "Back to gists" });
  await expect(backLink).toHaveAttribute("href", "/gists?q=docker");
  await backLink.click();

  await expect(page.getByRole("searchbox", { name: "Search gists" })).toHaveValue("docker");
  await expect(page.locator("[data-gist]:visible")).toHaveCount(1);
});

test("copies one code block and reports success", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4400"
  });
  await page.goto("/gists/docker-container-diagnostics");

  const copyButton = page.getByRole("button", { name: "Copy code to clipboard" }).first();
  await copyButton.click();

  await expect(copyButton).toHaveText("Copied");
  await expect(page.getByRole("status").first()).toHaveText("Code copied to clipboard");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
    'docker ps --all --filter "name=my-service"'
  );
});

test("emits metadata and exposes skip navigation", async ({ page }) => {
  await page.goto("/gists/docker-container-diagnostics");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://notsoosleepy.dev/gists/docker-container-diagnostics/"
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
