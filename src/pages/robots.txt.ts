import type { APIRoute } from "astro";
import { SITE_URL } from "../config/site.mjs";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL(SITE_URL);
  const sitemapUrl = new URL("/sitemap-index.xml", siteUrl);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
