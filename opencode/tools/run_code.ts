import { tool } from "@opencode-ai/plugin"
import * as fs from "fs/promises"
import * as os from "os"
import * as path from "path"
import * as crypto from "crypto"

// ─── Configuration ────────────────────────────────────────────────────────────

const DENO_BIN = "/home/burkhard/.deno/bin/deno"

/**
 * Executables the Deno sandbox is allowed to spawn via Deno.Command.
 * Empty by default — add entries here as needed, e.g. ["git", "npm"].
 */
const ALLOWED_RUN_PROGRAMS: string[] = []

const SKILLS_DIR = "/home/burkhard/.config/opencode/skills"

/**
 * Port of the Weclapp MCP server's HTTP transport.
 * When set (via WECLAPP_MCP_PORT env var), run_code gets:
 *   - --allow-net=127.0.0.1:PORT added to its Deno flags
 *   - a `const WECLAPP_MCP_URL` constant prepended to the executed code
 * Set to undefined/empty to disable Weclapp access from run_code entirely.
 */
const WECLAPP_MCP_PORT: string | undefined = process.env.WECLAPP_MCP_PORT

// ─── Tool ─────────────────────────────────────────────────────────────────────

export default tool({
  description:
    "Execute TypeScript code in a sandboxed Deno runtime. " +
    "Use this instead of bash for computation, data transformation, file parsing, " +
    "JSON/CSV manipulation, calling JSR packages, and any task that benefits from " +
    "structured code rather than shell commands. " +
    "The sandbox can read and write files within the current working directory, " +
    "and import packages from JSR (jsr:) and esm.sh. " +
    "When the Weclapp MCP server is running, the sandbox can also call the Weclapp API " +
    "via fetch() using the pre-injected WECLAPP_MCP_URL constant. " +
    "No general network access, no environment variables, no subprocesses (unless explicitly configured). " +
    "Print results to stdout — the full stdout and stderr are returned. " +
    "Prefer this tool over bash for most tasks.",
  args: {
    code: tool.schema
      .string()
      .describe(
        "TypeScript source code to execute. Must be a complete, self-contained module. " +
        "Use console.log() to output results. " +
        "Can use top-level await. " +
        "Can import from JSR with jsr: specifiers, e.g. import { parse } from 'jsr:@std/csv'. " +
        "Can import skill helpers via file:// paths under " + SKILLS_DIR + "/<skill>/mod.ts. " +
        "Can read/write files in the session working directory using Deno.readTextFile / Deno.writeTextFile. " +
        "When WECLAPP_MCP_URL is available (pre-injected constant), can call the Weclapp API — " +
        "see the weclapp skill for details."
      ),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds. Defaults to 30000 (30 seconds)."),
  },

  async execute(args, context) {
    const timeout = args.timeout ?? 30_000
    const cwd = context.directory
    const worktree = context.worktree

    // ── Write code to a temp file ──────────────────────────────────────────
    const id = crypto.randomBytes(8).toString("hex")
    const tmpFile = path.join(os.tmpdir(), `opencode_run_${id}.ts`)

    // Prepend injected constants so the code can use them without needing
    // env access or hardcoded values inside the Deno sandbox.
    const preambleLines: string[] = [
      "// === injected by run_code tool — do not edit ===",
    ]
    if (WECLAPP_MCP_PORT) {
      preambleLines.push(
        `const WECLAPP_MCP_URL = "http://127.0.0.1:${WECLAPP_MCP_PORT}/";`
      )
    }
    preambleLines.push("// === end injected constants ===", "")

    const codeWithPreamble = preambleLines.join("\n") + args.code

    try {
      await fs.writeFile(tmpFile, codeWithPreamble, "utf8")
    } catch (err) {
      throw new Error(`run_code: failed to write temp file: ${err}`)
    }

    // ── Build Deno permission flags ────────────────────────────────────────
    // Read: CWD, worktree root (may differ from CWD in git worktrees), skills dir
    const allowRead = [cwd, worktree, SKILLS_DIR]
      .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
      .join(",")

    const denoArgs = [
      "run",
      "--no-prompt",
      `--allow-read=${allowRead}`,
      `--allow-write=${cwd}`,
      // Allow importing from standard JSR/esm.sh registries (default set)
      "--allow-import",
    ]

    // Grant network access to the local Weclapp MCP HTTP server only
    if (WECLAPP_MCP_PORT) {
      denoArgs.push(`--allow-net=127.0.0.1:${WECLAPP_MCP_PORT}`)
    }

    if (ALLOWED_RUN_PROGRAMS.length > 0) {
      denoArgs.push(`--allow-run=${ALLOWED_RUN_PROGRAMS.join(",")}`)
    }

    denoArgs.push(tmpFile)

    // ── Spawn Deno ─────────────────────────────────────────────────────────
    let stdout = ""
    let stderr = ""
    let exitCode = 0
    let timedOut = false

    try {
      const proc = Bun.spawn([DENO_BIN, ...denoArgs], {
        cwd,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          // Provide a minimal, clean environment — no secrets leak through
          HOME: os.homedir(),
          PATH: process.env.PATH ?? "",
          DENO_DIR: process.env.DENO_DIR ?? path.join(os.homedir(), ".cache", "deno"),
        },
      })

      const timeoutHandle = setTimeout(() => {
        timedOut = true
        proc.kill()
      }, timeout)

      const [stdoutBuf, stderrBuf] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
      ])

      await proc.exited
      clearTimeout(timeoutHandle)

      stdout = stdoutBuf
      stderr = stderrBuf
      exitCode = proc.exitCode ?? 1
    } catch (err) {
      throw new Error(`run_code: failed to spawn Deno process: ${err}`)
    } finally {
      await fs.unlink(tmpFile).catch(() => {})
    }

    // ── Format result ──────────────────────────────────────────────────────
    if (timedOut) {
      return {
        title: `run_code: timed out after ${timeout}ms`,
        output: [
          "RESULT: TIMEOUT",
          `Execution exceeded ${timeout}ms and was killed.`,
          stderr ? `\nSTDERR:\n${stderr.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      }
    }

    const sections: string[] = []

    if (stdout.trim()) {
      sections.push(`STDOUT:\n${stdout.trim()}`)
    }
    if (stderr.trim()) {
      sections.push(`STDERR:\n${stderr.trim()}`)
    }
    sections.push(`EXIT CODE: ${exitCode}`)

    const success = exitCode === 0
    return {
      title: success ? "run_code: success" : `run_code: failed (exit ${exitCode})`,
      output: sections.join("\n\n"),
    }
  },
})
