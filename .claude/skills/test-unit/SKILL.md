---
name: test-unit
description: Use this skill when the user asks to generate, write, or add unit tests in Vitest for TypeScript/JavaScript code — either pasted directly or specified by a file path. Triggers include "write tests", "generate tests", "add unit tests", "cover with tests", "Vitest tests", as well as any request to cover a specific function, module, or file with tests.
---

Generate unit tests using Vitest for the specified code or file.

Requirements:
- Import from vitest: describe, it, expect, vi
- Test both the happy path and edge cases
- Mock external dependencies using vi.mock()
- Test names should be in Polish and descriptive
- At least 3 tests for each public function

Place the test file next to the source file with a .test.ts suffix.