---
name: review-docs
description: Use this skill when the user asks to verify syntax correctness or check if the latest library/framework versions and APIs are being used. Triggers include "check syntax", "verify docs", "is this up to date", "latest API", "review docs", "czy używam najnowszej wersji", "sprawdź składnię", as well as any question about whether code matches current library documentation.
---

Verify the provided code or file against the official, up-to-date documentation using context7.

## Steps

1. **Identify libraries and frameworks** used in the code (imports, package.json, config files).

2. **For each identified library**, use context7 in this order:
   - Call `mcp__context7__resolve-library-id` with the library name to get its context7 ID.
   - Call `mcp__context7__query-docs` with that ID and a focused topic (e.g. "API syntax", "configuration", "hooks", "latest version").

3. **Compare the code against the retrieved docs** and report on:
   - **Syntax correctness** — does the usage match the current API? (method signatures, option names, import paths)
   - **Deprecated APIs** — is anything flagged as deprecated or removed in the current version?
   - **Outdated patterns** — are there newer, recommended alternatives for what the code does?
   - **Version gaps** — if a version is pinned in package.json, note whether a significantly newer major version exists.

## Output format

For each library reviewed, output a section:

### `<library-name>`
- **Docs version checked:** (version context7 returned)
- **Syntax issues:** list any mismatches, or "none found"
- **Deprecated usage:** list deprecated calls/patterns, or "none found"
- **Outdated patterns:** list better alternatives available in current version, or "none found"
- **Verdict:** ✅ Up to date / ⚠️ Minor issues / ❌ Significant issues

End with a **Summary** section: overall assessment and the single most important change to make.

## Rules
- Always fetch docs via context7 — do not rely on training data for library-specific syntax.
- If context7 cannot resolve a library, say so explicitly and skip that library.
- Focus only on what the provided code actually uses — do not audit the entire API surface.
- Do not suggest unrelated refactors; scope findings strictly to syntax and version currency.
