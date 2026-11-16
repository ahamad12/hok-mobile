---
date: 2026-09-05
description: "socket.io-client's Socket<ListenEvents,...> on()/off() type the listener through ReservedOrUserListener → FallbackToUntypedListener."
tags: [memory]
source: mcp-capture
origin: "tapt-api"
session: "2026-09-05T14:06:06.618Z"
scope: platform
projects: []
platforms: ["socket.io", "typescript"]
aliases: ["socket.io typed on() can't bind a generic event key — cast the registration args, not the handler"]
confidence: verified
---

> Migrated from the obsidian-mind vault (`memories/2026/09/2026-09-05 socket.io typed on() can't bind a generic event key — cast.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# socket.io typed on() can't bind a generic event key — cast the registration args, not the handler

socket.io-client's Socket<ListenEvents,...> on()/off() type the listener through ReservedOrUserListener → FallbackToUntypedListener. When the event key passed is a GENERIC type variable (e.g. `function useSocketEvent<K extends keyof E>(event: K, cb)`), the conditional `K extends EventNames<...> ? ... : never` is a deferred conditional type and `[T] extends [never]` never resolves, so the listener parameter becomes an opaque deferred conditional that NO concrete function is assignable to — even `(...args: any[]) => void`. The library's own comment says this is a hack for TypeScript #41778. Consequence: the "clean" no-cast version fails tsc with TS2345 (verified). The correct pattern is to keep per-event payload typing flowing to callers via `Parameters<Events[K]>[0]`, cast the handler once to the exact untyped fallback (`as never` on the on/off args is the practical minimum), and confine the cast to the single registration boundary. Never sprinkle `as any` throughout; the boundary cast is honest because it corresponds to the library degrading the type itself, not to a shortcut.

## How this is known

Tested three no-cast variants against socket.io-client@4.8.3 + component-emitter lib/cjs/index.d.ts FallbackToUntypedListener (line 58, comments cite TS #41778); all failed tsc with TS2345. Boundary-cast version compiles with tsc --noEmit clean.

## Why this reaches everywhere

Any TypeScript project using socket.io-client's typed event emitter with generic helper functions hits this; it is a property of the library's generated types, not of this codebase.
