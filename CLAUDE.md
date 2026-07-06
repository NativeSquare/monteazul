# CLAUDE.md

## Verify

pnpm typecheck && pnpm lint && pnpm test

## Prerequisites

- `packages/backend/.env.local` must exist with `CONVEX_DEPLOYMENT` set (run `npx convex dev` to generate it). Schema changes require this for codegen and typecheck to pass.

## Agent skills

Run `/setup-matt-pocock-skills` before first use of `to-issues`, `triage`, or `work-next-agent-issue`.
