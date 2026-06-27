# Code Mode (run_code)

Use the `run_code` tool to execute TypeScript code in a sandboxed Deno runtime.
Prefer `run_code` over shell commands for the vast majority of tasks.

## When to use run_code

- Data transformation, filtering, aggregation
- Parsing and generating JSON, CSV, YAML, or any structured format
- File reading, writing, or batch renaming within the project
- Mathematical computation or string processing
- Calling well-known packages from JSR (e.g. `@std/csv`, `@std/path`, `@std/fs`)
- Any multi-step logic that would be cleaner as code than as shell pipelines
- Prototyping or verifying an algorithm before writing it into the codebase

## When NOT to use run_code

- Installing packages or running build tools (`npm install`, `tsc`, etc.) — these require shell access which is disabled
- Git operations — use the dedicated git tools instead
- Tasks that are a single, trivial file read or write — use the built-in `read`/`write`/`edit` tools directly

## Sandbox constraints

The Deno process runs with a restricted permission set:

| Permission | Granted |
|---|---|
| Read files | Only within the session working directory and skills directory |
| Write files | Only within the session working directory |
| Network | Blocked (except package imports from JSR/esm.sh at import time) |
| Environment variables | Blocked |
| Subprocesses | Blocked (unless explicitly configured) |
| FFI | Blocked |

If your code tries to access something outside these constraints, Deno will throw a `PermissionDenied` error visible in STDERR.

## Importing packages

Use `jsr:` specifiers for packages from the JSR registry. No `deno.json` or import map is needed:

```typescript
import { parse } from "jsr:@std/csv"
import { join } from "jsr:@std/path"
import { exists } from "jsr:@std/fs"
```

The first run of a new package will fetch and cache it. Subsequent runs are instant.

You can also use `npm:` specifiers for npm packages, though JSR equivalents are preferred:

```typescript
import _ from "npm:lodash"
```

## Importing skill helpers

Code-mode skills live at `/home/burkhard/.config/opencode/skills/<skill-name>/mod.ts`.
Import them via `file://` URLs:

```typescript
import { myHelper } from "file:///home/burkhard/.config/opencode/skills/example/mod.ts"
```

Each skill's `SKILL.md` documents what it exports and when to use it.

## Output

- Use `console.log()` to produce output — everything written to stdout is captured and returned.
- `console.error()` writes to stderr, which is also captured and shown separately.
- The tool returns stdout, stderr, and exit code.
- A non-zero exit code signals failure; the agent should read stderr to understand why.

## Code style

- Top-level `await` is supported — no need to wrap in an async IIFE.
- Write complete, self-contained modules — all imports at the top.
- Be explicit: log intermediate results if the computation has multiple steps.
- Handle errors with try/catch and log meaningful messages.

## Examples

### Read and summarise a JSON file

```typescript
const raw = await Deno.readTextFile("./data/orders.json")
const orders = JSON.parse(raw)
console.log(`Total orders: ${orders.length}`)
const total = orders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0)
console.log(`Total value: ${total}`)
```

### Parse a CSV file using JSR

```typescript
import { parse } from "jsr:@std/csv"

const raw = await Deno.readTextFile("./data/report.csv")
const rows = parse(raw, { skipFirstRow: true })
console.log(`Rows: ${rows.length}`)
console.log(JSON.stringify(rows.slice(0, 3), null, 2))
```

### Write a transformed file

```typescript
import { parse } from "jsr:@std/csv"
import { stringify } from "jsr:@std/csv"

const raw = await Deno.readTextFile("./input.csv")
const rows = parse(raw, { skipFirstRow: true }) as Record<string, string>[]

const filtered = rows.filter(r => Number(r.amount) > 100)
const out = stringify(filtered, { columns: Object.keys(rows[0]) })

await Deno.writeTextFile("./output.csv", out)
console.log(`Wrote ${filtered.length} rows`)
```
