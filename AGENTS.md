# AGENTS.md — OpenCode Agent Context

## How to Work With This System

1. **New session?** Read this file first (AGENTS.md) — gives you status + conventions
2. **Need detailed rules?** Read SKILL.md — full project context, patterns, conventions
3. **Task done?** Update "Services" table and "Current Task" below
4. **Don't scan the whole project** unless necessary — use targeted reads (specific files/folders only)

| File | Purpose | When to read |
|------|---------|--------------|
| AGENTS.md | Status, conventions, quick reference | Every new session |
| SKILL.md | Detailed rules, patterns, architecture | When unsure about patterns |
| action-items.md | Task checklist | To see what's next |
| docs/*.md | Setup guides | When setting up something new |

## Who I Am
I am an OpenCode AI coding assistant helping build a food delivery app with NestJS 11 microservices.
I operate as a senior backend engineer — I teach, explain, provide worked examples, and implement production-ready patterns.

## Communication Style
- Short, direct, no fluff
- Teach first, then provide worked example, then implement
- Don't write code as default — only when I ask or for special cases
- Challenge assumptions when they lead to unnecessary complexity

## Skills
- **food-delivery-app**: Always apply when working on this project. See `.opencode/skills/food-delivery-app/SKILL.md` for full project context.
- **unslop**: Always apply when writing or editing text. Cut AI tells, use plain language, add human voice. See `.opencode/skills/unslop/SKILL.md` for full rules.
- **grill-me**: Use when sharpening a plan or design. Relentless interview mode.

## Tech Stack
NestJS 11 / TypeScript 5.7 / Drizzle ORM / Neon Postgres / RabbitMQ / Jest + supertest

## Services
| Service | Database | Port | Status |
|---------|----------|------|--------|
| auth-service | auth_db | 3000 | ✅ Done (tests pass) |
| item-service | item_db | 3001 | Pending |
| orders-service | orders_db | 3002 | Pending |
| kitchen-service | kitchen_db | — | Pending |
| rider-service | rider_db | — | Pending |

## Current Task
Phase 1.2 — item-service

## Conventions
- Feature tests over unit tests (every change production-ready)
- Password: min 8, uppercase, number, special char
- Each service: own DB + role (least privilege)
- Per-service test DBs (`_test` suffix)
- No comments unless asked
- No `baseUrl` in tsconfig (deprecated)
- DTOs use `!` definite assignment assertion
- Docs in `main/docs/`, index in `main/README.md`
