import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../src/config/site.mjs";

const siteUrl = new URL(SITE_URL);
const timeoutMs = 15_000;
const discoveryPaths = ["/rss.xml", "/sitemap-index.xml", "/robots.txt"];
const failures = [];
const warnings = [];

if (siteUrl.protocol !== "https:") {
  failures.push(`SITE_URL must use HTTPS: ${siteUrl.href}`);
}

async function fetchUrl(url) {
  return fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "notsoosleepy-site-check/1.0" },
    signal: AbortSignal.timeout(timeoutMs)
  });
}

function extractAttributeUrls(html) {
  return [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function extractCanonical(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1]);
}

function normalizedPath(pathname) {
  return pathname === "/" ? pathname : `${pathname.replace(/\/+$/, "")}/`;
}

async function contentUrls(directory) {
  const urls = new Set();

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      for (const url of await contentUrls(path)) urls.add(url);
    } else if ([".md", ".mdx"].includes(extname(entry.name))) {
      const source = await readFile(path, "utf8");
      for (const match of source.matchAll(/https?:\/\/[^\s<>()\]]+/g)) {
        urls.add(match[0].replace(/[.,;:]$/, ""));
      }
    }
  }

  return urls;
}

async function checkRequiredUrl(path) {
  const url = new URL(path, siteUrl);

  try {
    const response = await fetchUrl(url);
    if (!response.ok) failures.push(`${url.href} returned ${response.status}`);
    return response;
  } catch (error) {
    failures.push(`${url.href} failed: ${error.message}`);
    return undefined;
  }
}

const sitemapIndexResponse = await checkRequiredUrl("/sitemap-index.xml");
const sitemapUrls = sitemapIndexResponse?.ok
  ? extractSitemapUrls(await sitemapIndexResponse.text())
  : [];
const pageUrls = new Set();

for (const sitemapUrl of sitemapUrls) {
  const response = await checkRequiredUrl(sitemapUrl);
  if (!response?.ok) continue;

  for (const pageUrl of extractSitemapUrls(await response.text())) {
    const url = new URL(pageUrl, siteUrl);
    if (url.origin === siteUrl.origin) pageUrls.add(url.href);
  }
}

if (pageUrls.size === 0) {
  failures.push("Sitemap did not expose any same-origin public pages");
}

const linkedUrls = new Set();
const checkedUrls = new Set([new URL("/sitemap-index.xml", siteUrl).href, ...sitemapUrls]);

for (const pageUrl of pageUrls) {
  const response = await checkRequiredUrl(pageUrl);
  checkedUrls.add(pageUrl);
  if (!response?.ok) continue;

  const html = await response.text();
  const canonical = extractCanonical(html);
  const expected = new URL(pageUrl);

  if (!canonical) {
    failures.push(`${expected.href} has no canonical link`);
  } else {
    const canonicalUrl = new URL(canonical);
    if (canonicalUrl.protocol !== "https:") failures.push(`${expected.href} has a non-HTTPS canonical`);
    if (canonicalUrl.origin !== siteUrl.origin || normalizedPath(canonicalUrl.pathname) !== normalizedPath(expected.pathname)) {
      failures.push(`${expected.href} has unexpected canonical ${canonicalUrl.href}`);
    }
  }

  for (const value of extractAttributeUrls(html)) {
    if (value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) continue;
    const linkedUrl = new URL(value, expected);
    linkedUrl.hash = "";
    linkedUrls.add(linkedUrl.href);
  }
}

for (const path of discoveryPaths.filter((path) => path !== "/sitemap-index.xml")) {
  const url = new URL(path, siteUrl);
  await checkRequiredUrl(url);
  checkedUrls.add(url.href);
}
for (const url of await contentUrls(fileURLToPath(new URL("../src/content", import.meta.url)))) {
  linkedUrls.add(url);
}

for (const href of [...linkedUrls].sort()) {
  if (checkedUrls.has(href)) continue;
  const url = new URL(href);

  try {
    const response = await fetchUrl(url);
    if (response.ok) continue;

    if ([401, 403, 429, 999].includes(response.status)) {
      warnings.push(`${href} returned ${response.status} to the automated checker`);
    } else {
      failures.push(`${href} returned ${response.status}`);
    }
  } catch (error) {
    failures.push(`${href} failed: ${error.message}`);
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS checked ${pageUrls.size} sitemap pages, ${discoveryPaths.length} discovery files, and ${linkedUrls.size} linked resources`);
}
