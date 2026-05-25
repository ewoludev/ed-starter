---
name: generate-mock-data
description: Generate realistic mock data as a JSON array for a given schema or type. Use when the user asks to "generate mock data", "wygeneruj dane testowe", "fake data", "dane testowe", "fill with test data", or references generating records for a type or schema.
---

Generate realistic mock data based on `$ARGUMENTS`.

## Parsing $ARGUMENTS

Parse in order:
- **Count** — first token if it's a number (default: 10)
- **Schema/type** — remaining text, e.g. `Flight`, `User`, `Order`, or a free-form description
- **Output path** — if a `.json` file path is present in $ARGUMENTS, write output there instead of stdout

Examples:
- `20 Flight` → 20 Flight records
- `Flight 5 data/test.json` → 5 Flight records written to `data/test.json`
- `50 User { name: string, age: number, email: string }` → 50 User records matching the inline schema

## Steps

1. **Resolve the schema**: if the type name matches a type in `types/index.ts`, read that file first and honor the exact union values (e.g. `Airline`, `FlightStatus`, `Terminal`).
2. **Generate N records** with realistic, varied values:
   - IDs: sequential strings like `"FL001"`, `"USR042"`
   - Times: realistic `"HH:MM"` strings spread across the day
   - Names/cities: real-world values (Warsaw, Berlin, Paris, London, Amsterdam…)
   - Enums: use only the values defined in the union type, distributed naturally (not all the same)
   - Optional fields: include in ~40% of records
3. **Output**: print a JSON array to the conversation. If a `.json` output path was given in $ARGUMENTS, write the file using the Write tool.

## Rules

- Never invent enum values — always use the exact literals from the type definition.
- Vary the data — do not repeat the same value for every record.
- If no schema is recognizable, ask the user to clarify before generating.
- Do not modify `data/flights.seed.json` (project seed — read-only by convention).
