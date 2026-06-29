# notsoosleepy-site

Public build log and technical portfolio for DevOps, homelab work, debugging notes, and practical daily tinkering.

## Requirements

- Node.js 22.12.0 or newer
- npm 9.6.5 or newer

## Commands

```sh
npm install
npm run dev
npm run build
npx playwright install chromium
npm run test:e2e
```

## Structure

- `src/content/posts` - short notes, writeups, and TIL entries
- `src/content/gists` - searchable, copyable code snippets with brief context
- `src/content/projects` - project case studies with tools, failures, and lessons
- `src/pages` - site routes
- `src/styles/global.css` - shared visual system
