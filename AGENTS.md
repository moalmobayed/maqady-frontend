<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines

## Project context

- This is the Maqady cinema reservation frontend, built with Next.js App Router, React, and TypeScript.
- Application code lives in `src/`; follow the existing component and styling patterns.

## AI reference documents

- Product requirements and acceptance criteria: `ai/spec.md`.
- Page-specific entrypoints and routes: `ai/index.md` and its page folders. Keep canonical requirements in `ai/spec.md` to avoid duplication.
- Implementation strategy and proposed structure: `ai/plan.md`.
- Implementation checklist: `ai/task.md`. Mark an item complete only after implementation and verification.
- Treat unresolved items in these documents as decisions to confirm, not as approved requirements.

## Development and validation

- Use `npm run lint` for linting and `npm run build` for production-build validation.
- Before changing Next.js APIs, read the relevant guide in `node_modules/next/dist/docs/` as required above.
