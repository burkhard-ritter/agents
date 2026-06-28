import { tool } from "@opencode-ai/plugin";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

// ─── Configuration ────────────────────────────────────────────────────────────

const DENO_BIN = "/home/burkhard/.deno/bin/deno";

/**
 * Executables the Deno sandbox is allowed to spawn via Deno.Command.
 * Empty by default — add entries here as needed, e.g. ["git", "npm"].
 */
const ALLOWED_RUN_PROGRAMS: string[] = [];

const SKILLS_DIR = "/home/burkhard/.config/opencode/skills";

/**
 * Path to the Weclapp readonly HTTP proxy sidecar.
 * When set, run_code spawns this proxy for the lifetime of each code block:
 *   - the proxy binds an ephemeral loopback port and prints `WECLAPP_PROXY_PORT=<n>`
 *   - run_code adds `--allow-net=127.0.0.1:<port>` to the sandbox's Deno flags
 *   - run_code prepends a `const WECLAPP_URL` constant to the executed code
 *   - the proxy is killed when the block finishes
 * The proxy holds the API token (read from ~/.weclapp/credentials) so it never
 * enters the sandbox or the model context, and forwards GET requests only.
 * Set to undefined/empty to disable Weclapp access from run_code entirely.
 */
const WECLAPP_PROXY_SCRIPT: string | undefined =
  "/home/burkhard/.config/opencode/tools/run_code/weclapp_proxy.ts";

/** Max time to wait for the proxy to announce its port before giving up. */
const PROXY_STARTUP_TIMEOUT_MS = 5_000;

/**
 * Spawn the Weclapp proxy and wait for its `WECLAPP_PROXY_PORT=<n>` line.
 * Returns the running process and the chosen port, or throws with the proxy's
 * stderr if it fails to start (e.g. missing/invalid credentials).
 */
async function startWeclappProxy(): Promise<{
  proc: Bun.Subprocess;
  port: number;
}> {
  const proc = Bun.spawn(
    [
      DENO_BIN,
      "run",
      "--no-prompt",
      "--allow-read=/home/burkhard/.weclapp/credentials",
      "--allow-net=sportident.weclapp.com,127.0.0.1",
      "--allow-env=HOME,WECLAPP_PROXY_DEBUG",
      WECLAPP_PROXY_SCRIPT!,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
      env: {
        HOME: os.homedir(),
        PATH: process.env.PATH ?? "",
        DENO_DIR:
          process.env.DENO_DIR ?? path.join(os.homedir(), ".cache", "deno"),
        ...(process.env.WECLAPP_PROXY_DEBUG
          ? { WECLAPP_PROXY_DEBUG: process.env.WECLAPP_PROXY_DEBUG }
          : {}),
      },
    },
  );

  // Read stdout until we see the port line or the stream ends / times out.
  const reader = proc.stdout.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  let port: number | undefined;
  let timedOut = false;

  const deadline = Date.now() + PROXY_STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    const timeout = new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), remaining),
    );
    const next = await Promise.race([reader.read(), timeout]);
    if ("timedOut" in next) {
      timedOut = true;
      break;
    }
    if (next.done) break;
    buffered += decoder.decode(next.value, { stream: true });
    const match = buffered.match(/WECLAPP_PROXY_PORT=(\d+)/);
    if (match) {
      port = parseInt(match[1], 10);
      break;
    }
  }
  reader.releaseLock();

  if (port === undefined) {
    // Proxy never announced a port — capture stderr to surface the reason.
    proc.kill();
    let stderr = "";
    try {
      stderr = await new Response(proc.stderr).text();
    } catch {
      // ignore
    }
    const reason = timedOut
      ? `did not announce a port within ${PROXY_STARTUP_TIMEOUT_MS}ms`
      : `exited before announcing a port`;
    throw new Error(
      `Weclapp proxy ${reason}.` +
        (stderr.trim() ? `\nProxy stderr:\n${stderr.trim()}` : ""),
    );
  }

  return { proc, port };
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

export default tool({
  description:
    "Execute TypeScript code in a sandboxed Deno runtime. " +
    "Use this instead of bash for computation, data transformation, file parsing, " +
    "JSON/CSV manipulation, calling JSR packages, and any task that benefits from " +
    "structured code rather than shell commands. " +
    "The sandbox can read and write files within the current working directory, " +
    "and import packages from JSR (jsr:) and esm.sh. " +
    "When the Weclapp proxy is configured, the sandbox can also call the Weclapp API " +
    "via fetch() using the pre-injected WECLAPP_URL constant. " +
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
          "Can import skill helpers via file:// paths under " +
          SKILLS_DIR +
          "/<skill>/mod.ts. " +
          "Can read/write files in the session working directory using Deno.readTextFile / Deno.writeTextFile. " +
          "When WECLAPP_URL is available (pre-injected constant), can call the Weclapp API — " +
          "see the weclapp skill for details.",
      ),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds. Defaults to 30000 (30 seconds)."),
  },

  async execute(args, context) {
    const timeout = args.timeout ?? 30_000;
    const cwd = context.directory;
    const worktree = context.worktree;

    // ── Start the Weclapp proxy (per-block lifetime) ───────────────────────
    // Spawned before the sandbox so we know its ephemeral port; killed in the
    // finally block below. If credentials are missing/invalid the proxy fails
    // to announce a port and we surface its stderr instead of running silently.
    let proxyProc: Bun.Subprocess | undefined;
    let weclappUrl: string | undefined;
    if (WECLAPP_PROXY_SCRIPT) {
      try {
        const started = await startWeclappProxy();
        proxyProc = started.proc;
        weclappUrl = `http://127.0.0.1:${started.port}/`;
      } catch (err) {
        return {
          title: "run_code: Weclapp proxy failed to start",
          output: `RESULT: PROXY_ERROR\n${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }

    try {
      // ── Write code to a temp file ────────────────────────────────────────
      const id = crypto.randomBytes(8).toString("hex");
      const tmpFile = path.join(os.tmpdir(), `opencode_run_${id}.ts`);

      // Prepend injected constants so the code can use them without needing
      // env access or hardcoded values inside the Deno sandbox.
      const preambleLines: string[] = [
        "// === injected by run_code tool — do not edit ===",
      ];
      if (weclappUrl) {
        preambleLines.push(`const WECLAPP_URL = "${weclappUrl}";`);
      }
      preambleLines.push("// === end injected constants ===", "");

      const codeWithPreamble = preambleLines.join("\n") + args.code;

      try {
        await fs.writeFile(tmpFile, codeWithPreamble, "utf8");
      } catch (err) {
        throw new Error(`run_code: failed to write temp file: ${err}`);
      }

      // ── Build Deno permission flags ──────────────────────────────────────
      // Read: CWD, worktree root (may differ from CWD in git worktrees), skills dir
      const allowRead = [cwd, worktree, SKILLS_DIR]
        .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
        .join(",");

      const denoArgs = [
        "run",
        "--no-prompt",
        `--allow-read=${allowRead}`,
        `--allow-write=${cwd}`,
        // Allow importing from standard JSR/esm.sh registries (default set)
        "--allow-import",
      ];

      // Grant network access to the local Weclapp proxy only
      if (proxyProc && weclappUrl) {
        const proxyPort = new URL(weclappUrl).port;
        denoArgs.push(`--allow-net=127.0.0.1:${proxyPort}`);
      }

      if (ALLOWED_RUN_PROGRAMS.length > 0) {
        denoArgs.push(`--allow-run=${ALLOWED_RUN_PROGRAMS.join(",")}`);
      }

      denoArgs.push(tmpFile);

      // ── Spawn Deno ───────────────────────────────────────────────────────
      let stdout = "";
      let stderr = "";
      let exitCode = 0;
      let timedOut = false;

      try {
        const proc = Bun.spawn([DENO_BIN, ...denoArgs], {
          cwd,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            // Provide a minimal, clean environment — no secrets leak through
            HOME: os.homedir(),
            PATH: process.env.PATH ?? "",
            DENO_DIR:
              process.env.DENO_DIR ?? path.join(os.homedir(), ".cache", "deno"),
          },
        });

        const timeoutHandle = setTimeout(() => {
          timedOut = true;
          proc.kill();
        }, timeout);

        const [stdoutBuf, stderrBuf] = await Promise.all([
          new Response(proc.stdout).text(),
          new Response(proc.stderr).text(),
        ]);

        await proc.exited;
        clearTimeout(timeoutHandle);

        stdout = stdoutBuf;
        stderr = stderrBuf;
        exitCode = proc.exitCode ?? 1;
      } catch (err) {
        throw new Error(`run_code: failed to spawn Deno process: ${err}`);
      } finally {
        await fs.unlink(tmpFile).catch(() => {});
      }

      // ── Format result ────────────────────────────────────────────────────
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
        };
      }

      const sections: string[] = [];

      if (stdout.trim()) {
        sections.push(`STDOUT:\n${stdout.trim()}`);
      }
      if (stderr.trim()) {
        sections.push(`STDERR:\n${stderr.trim()}`);
      }
      sections.push(`EXIT CODE: ${exitCode}`);

      const success = exitCode === 0;
      return {
        title: success
          ? "run_code: success"
          : `run_code: failed (exit ${exitCode})`,
        output: sections.join("\n\n"),
      };
    } finally {
      // Tear down the per-block Weclapp proxy.
      proxyProc?.kill();
    }
  },
});
