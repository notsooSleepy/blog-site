import { expect, test } from "@playwright/test";
import { SITE_URL } from "../../src/config/site";

const productionOrigin = new URL(SITE_URL).origin;
const xmlContentType = /^(application|text)\/(rss\+)?xml\b/;

test("publishes an RSS feed with absolute post links", async ({ request }) => {
  const response = await request.get("/rss.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(xmlContentType);
  expect(body).toContain("<title>notsoosleepy</title>");
  expect(body).toContain(`<link>${productionOrigin}/posts/`);
});

test("advertises the generated sitemap in robots.txt", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/plain");
  await expect(response.text()).resolves.toContain(
    `Sitemap: ${productionOrigin}/sitemap-index.xml`
  );
});

test("generates a sitemap containing public routes", async ({ request }) => {
  const indexResponse = await request.get("/sitemap-index.xml");
  const sitemapResponse = await request.get("/sitemap-0.xml");
  const sitemap = await sitemapResponse.text();

  expect(indexResponse.ok()).toBe(true);
  expect(indexResponse.headers()["content-type"]).toMatch(xmlContentType);
  expect(sitemapResponse.ok()).toBe(true);
  expect(sitemap).toContain(`<loc>${productionOrigin}/</loc>`);
  expect(sitemap).toContain(`<loc>${productionOrigin}/posts/</loc>`);
});
