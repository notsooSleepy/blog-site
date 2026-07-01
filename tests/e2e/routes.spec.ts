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
    path: "/projects/homelab-documentation-system",
    heading: "Homelab documentation system"
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

  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/notsooSleepy"
  );
  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/bart%C5%82omiej-grabarek-070733236/"
  );
  await expect(page.getByRole("link", { name: "RSS", exact: true })).toHaveAttribute(
    "href",
    "/rss.xml"
  );
});
