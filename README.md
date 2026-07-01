# notsoosleepy-site

Public build log and technical portfolio for homelab work, infrastructure notes, debugging, and practical daily tinkering.

## Requirements

- Node.js 22.12.0 or newer
- npm 10.8.2 or newer

Set `SITE_URL` to the final production origin when building for deployment. If omitted, the
current Workers domain is used.

## Commands

```sh
npm install
npm run dev
npm run build
npx playwright install chromium
npm run test:e2e
npm run check:site
```

`npm run check:site` validates the deployed routes, discovery files, canonical URLs,
assets, footer profiles, and external links. Set `SITE_URL` to check another deployment.

## Structure

- `src/content/posts` - short notes, writeups, and TIL entries
- `src/content/gists` - searchable, copyable code snippets with brief context
- `src/content/projects` - project case studies with tools, failures, and lessons
- `src/pages` - site routes
- `src/styles/global.css` - shared visual system
- `templates/technical-fix.md` - structure for investigated and verified fixes
- `templates/build-log.md` - structure for experiments, decisions, and outcomes
