# tapt-mobile — TAPT Mobile App

> Expo / React Native client for the TAPT shop management platform. Shares API contracts with `../tapt-api` (`packages/api`).

## Where design decisions live

Design rationale lives **in this repo**, indexed by graphify (migrated from the retired `om` vault 2026-11-16):

- `docs/knowledge/work-log/`: what past sessions changed and why (auth, role-aware tab bar, UI revamps); backend changes such as delivery check-in and `/shops/my` live in `../tapt-api/docs/knowledge/work-log/`
- `docs/knowledge/lessons/`: durable single-fact lessons (e.g. react-native-dotenv under jest)
- `docs/knowledge/reference/`: socket.io client foundation
- `docs/auth-plan.md`
- `docs/adr/` + `GLOSSARY.md`: new decisions and vocabulary (created lazily by `/domain-modeling`)
- Backend rationale lives in `../tapt-api/docs/knowledge/`.

**Query the graph first.** When `graphify-out/` exists, start with `graphify query "<question>"` / `graphify explain "<node>"` (or `/graphify`), then read only the files it points at. After code changes run `graphify update .`.

**Say what came back** before implementing: name the recorded decisions the work rests on, anything that argues against it, or "nothing recorded on this".

## Recording what you learn

- **Durable lesson**: `docs/knowledge/lessons/YYYY-MM-DD-<slug>.md` with `confidence:` frontmatter.
- **Decision**: ADR in `docs/adr/`.
- **What happened here**: `docs/knowledge/work-log/`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown under `.scratch/<feature>/` (no remote tracker). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
