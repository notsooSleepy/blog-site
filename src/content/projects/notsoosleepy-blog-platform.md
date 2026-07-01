---
title: "notsoosleepy blog platform"
description: "A static technical portfolio built around searchable notes, evidence-backed project writeups, and automated deployment checks."
date: 2026-07-01
status: "active"
tools: ["astro", "typescript", "playwright", "cloudflare"]
---

## Outcome

notsoosleepy is my public technical notebook and portfolio. It gives short fixes,
longer posts, project case studies, and unfinished work distinct places while keeping
all content in one version-controlled repository.

The deployed site is available at
[blog-site.runcorx.workers.dev](https://blog-site.runcorx.workers.dev), and the source
is public on [GitHub](https://github.com/notsooSleepy/blog-site).

## Architecture

The site uses Astro's static output. Markdown and JSON content pass through typed
content collections, then route templates turn those entries into static pages.

```text
Markdown and JSON
        |
Astro content collections
        |
Static pages, RSS, sitemap, and robots.txt
        |
Cloudflare Workers static assets
```

The main pieces are:

- Astro content collections for posts, gists, projects, and the public TODO list.
- Shared layouts and cards for consistent navigation, metadata, and presentation.
- Small client-side enhancements for gist search, tag filtering, copy controls, and
  card interaction.
- Playwright coverage for routes, accessibility-critical navigation, gist workflows,
  discovery files, and metadata.
- A production checker for HTTPS routes, canonical URLs, assets, and external links.

## Constraints

- The site should remain useful without a database or server-side application state.
- Content must be writable as plain Markdown and reviewable through Git history.
- JavaScript should enhance workflows without hiding the underlying content.
- Deployment should remain inexpensive and require little maintenance.
- Canonical URLs must work with the current Workers domain and a future custom domain.

## Implementation

Astro builds the repository into static HTML. Dynamic-looking routes such as project
and post details are generated from content entries during the build. The configured
`SITE_URL` is shared by Astro, RSS, robots, tests, and production validation so one
domain change updates every generated URL.

The gist index required the most interaction work. Each entry keeps a native link for
normal browser behavior while code, references, and copy controls remain independently
interactive. Tags become search buttons when JavaScript is available and remain plain
labels when it is not.

The deployment pipeline produces more than pages:

- `/rss.xml` publishes posts.
- `/sitemap-index.xml` and `/robots.txt` expose public routes to crawlers.
- Canonical, Open Graph, and Twitter metadata are generated through the shared layout.
- `npm run check:site` validates the live deployment and linked resources.

## Decisions and tradeoffs

### Static output instead of a CMS

Static output removes database maintenance and reduces the production attack surface.
The tradeoff is that every content change requires a build and deployment. For a
single-author technical site, that is acceptable and keeps the source of truth in Git.

### Structured collections instead of unrestricted Markdown

Content schemas catch missing titles, dates, tags, statuses, and tool lists during the
build. They add some ceremony, but prevent partially defined entries from reaching
production.

### Progressive enhancement for gists

Search, copy controls, and clickable tags use JavaScript, but gist content and title
links work without it. This is more complex than making every card one large anchor,
because code selection and nested controls must retain native behavior.

### A configurable canonical origin

The Workers URL is the default origin, while `SITE_URL` can replace it during a build.
Tests use the same configuration, avoiding assertions that silently validate a stale
domain.

## Problems encountered

### XML content types differed between servers

The preview server returned generated XML as `text/xml`, while the initial test expected
only `application/xml`. The assertion now accepts valid RSS and XML media types instead
of coupling the test to one server implementation.

### Deployment tests initially hardcoded the production domain

The first discovery and metadata tests embedded the Workers URL. That contradicted the
documented `SITE_URL` override. Moving the origin into shared configuration made custom
domain builds testable.

### Clickable gist cards conflicted with code controls

A JavaScript click handler made cards navigable but lost native link behavior. The final
implementation uses a stretched native link for the card surface and places selectable
prose, code, tags, copy buttons, and references in their own interaction layer.

## Evidence

The local verification command performs Astro diagnostics, a production build, and the
browser suite:

```text
Result (23 files):
- 0 errors
- 0 warnings
- 0 hints

19 passed
```

The production checker currently verifies nine pages, three discovery files, generated
assets, canonical HTTPS URLs, profile links, and Markdown references:

```text
PASS checked 9 pages, 3 discovery files, and 25 linked resources
```

LinkedIn rejects automated requests with its non-standard `999` response, so that known
bot restriction is reported as a warning rather than a broken link.

## Current limitations

- Social metadata does not yet include a custom preview image.
- The content library is still small and includes an introductory seeded post that needs
  replacement or expansion.
- Production validation is available as a command but is not yet a required CI check.

## Next

The next useful work is replacing the remaining seeded content, adding evidence-rich
homelab case studies, and promoting production validation into the deployment workflow.
