import { expect, test } from "@playwright/test";

const coreRoutes = [
  { path: "/", heading: "notsoosleepy" },
  { path: "/about", heading: "Hands-on technical generalist" },
  { path: "/posts", heading: "Notes, fixes, and build logs" },
  {
    path: "/posts/why-im-starting-notsoosleepy",
    heading: "Why I am starting notsoosleepy blog"
  },
  { path: "/gists", heading: "Small snippets for real tasks" },
  {
    path: "/gists/curl-http-diagnostics",
    heading: "Inspect an HTTP endpoint with curl"
  },
  { path: "/projects", heading: "Case studies with useful context" },
  {
    path: "/projects/notsoosleepy-blog-platform",
    heading: "notsoosleepy blog platform"
  },
  { path: "/todo", heading: "TODO" }
] as const;

for (const { path, heading } of coreRoutes) {
  test(`${path} renders its page heading`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("footer links point to the public profiles and RSS feed", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");

  await expect(footer.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();

  await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/notsooSleepy"
  );
  await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/bart%C5%82omiej-grabarek-070733236/"
  );
  await expect(footer.getByRole("link", { name: "RSS", exact: true })).toHaveAttribute(
    "href",
    "/rss.xml"
  );
});

test("project evidence images load within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/notsoosleepy-blog-platform");

  const images = page.locator("article img");
  const imageCount = await images.count();
  expect(imageCount).toBeGreaterThanOrEqual(2);

  for (let index = 0; index < imageCount; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) =>
          element instanceof HTMLImageElement ? element.naturalWidth : 0
        )
      )
      .toBeGreaterThan(0);

    const box = await image.boundingBox();
    expect(box).not.toBeNull();
    if (box) expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
});
