---
date: 2026-09-15
description: "react-native-dotenv inlines EXPO_PUBLIC_* values at babel-transform time, reading process.env when each file is first transformed."
tags: [memory]
source: mcp-capture
origin: "tapt-mobile"
session: "2026-09-14T23:03:25.084Z"
scope: project
projects: ["tapt-mobile"]
aliases: ["react-native-dotenv values can't be set from jest setupFiles — mock the config module instead"]
confidence: verified
---

> Migrated from the obsidian-mind vault (`memories/2026/09/2026-09-15 react-native-dotenv values can't be set from jest.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# react-native-dotenv values can't be set from jest setupFiles — mock the config module instead

react-native-dotenv inlines EXPO_PUBLIC_* values at babel-transform time, reading process.env when each file is first transformed. A jest setupFiles module that assigns process.env runs too late: the plugin instance initialises during transformation of the setup file itself, before its body executes — and babel-jest's transform cache key does not include env, so the bad (undefined) inline persists across runs until the cache is cleared. Robust fix: never depend on env-at-transform in tests; instead jest.mock() the central config module (e.g. '@/config/Environment') with a factory, which is hoisted and immune to transform timing and caching.
