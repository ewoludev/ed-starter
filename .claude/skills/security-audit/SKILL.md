---
name: security-audit
description: Audit code for security vulnerabilities. Use when the user asks for "security audit", "audit bezpieczeństwa", "znajdź luki", "sprawdź bezpieczeństwo", "find vulnerabilities", or a security review of a file or the whole project.
---

Audit the codebase (or a specific file from `$ARGUMENTS`) for security vulnerabilities.

## Scope

Default scope (no $ARGUMENTS): read all of:
- `app/api/**/*.ts` — API route handlers
- `lib/*.ts` — server-side utilities (file I/O, middleware)
- `components/**/*.tsx` — client components that handle user input

Narrow scope: if `$ARGUMENTS` contains a file path, audit only that file.

## Checks

Work through each category in order. Only report issues that exist in the code you actually read.

1. **Input validation** — are `req.json()` payloads validated/typed before use? Look for missing schema validation (e.g. no Zod, no runtime type guards) on POST/PATCH bodies.
2. **Path traversal** — does `lib/flights.ts` or any file I/O use a user-supplied value as a filename or path segment?
3. **Injection** — does any data flow from a request body into `fs.writeFileSync`, `exec`, `eval`, or template strings used as shell commands?
4. **Auth / authz** — are mutation endpoints (POST, PATCH, DELETE) protected by authentication or authorization checks?
5. **Information disclosure** — do `catch` blocks or error responses expose stack traces, internal file paths, or raw error messages to the client?
6. **Dependency vulnerabilities** — scan `package.json` for packages with known CVEs or significantly outdated majors; note them as Info-level findings.
7. **XSS** — do any React components use `dangerouslySetInnerHTML` with unsanitized user-supplied data?

## Output format

For each finding:

```
[SEVERITY] file:line
Description of the issue.
Recommendation: specific, targeted fix (one or two sentences).
```

Severity levels: **Critical** · **High** · **Medium** · **Low** · **Info**

End with a summary table:

| Severity | Count |
|----------|-------|
| Critical | N |
| High     | N |
| Medium   | N |
| Low      | N |
| Info     | N |

If no issues are found, state "No issues found." and stop.

## Rules

- Read the actual source files before reporting — do not assume vulnerabilities exist.
- Report only real code paths, not hypothetical ones.
- Do not suggest architectural rewrites; give targeted, actionable fixes scoped to the existing code.
- Do not report issues already mitigated by the framework (e.g. Next.js automatic header sanitization).
