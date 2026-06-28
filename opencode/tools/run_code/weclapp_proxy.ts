/**
 * Weclapp readonly HTTP proxy (sidecar for the run_code tool)
 *
 * A thin read-only proxy to the Weclapp REST API v2. Spawned by ../run_code.ts
 * for the lifetime of a single run_code block, then killed. Holds the API token
 * (read from ~/.weclapp/credentials) so it never enters the sandbox or the model
 * context, and forwards GET requests only — all mutating verbs are rejected.
 *
 * Transport: plain HTTP (no MCP, no JSON-RPC, no SSE). The sandbox calls
 *   GET http://127.0.0.1:<port>/<weclapp-path><query>
 * and receives the upstream JSON body verbatim with the upstream status code.
 *
 * Lifecycle / port:
 *   Binds 127.0.0.1:0 (ephemeral port chosen by the OS) and prints the chosen
 *   port to stdout as a single parseable line:  WECLAPP_PROXY_PORT=<n>
 *   The parent (run_code.ts) reads that line, injects WECLAPP_URL into the
 *   sandbox, scopes --allow-net to that port, then kills this process when done.
 *
 * Permissions required (Deno), set by the parent when spawning:
 *   --allow-read=~/.weclapp/credentials
 *   --allow-net=sportident.weclapp.com,127.0.0.1
 *   --allow-env=HOME,WECLAPP_PROXY_DEBUG
 *
 * Future consent gate: the GET-only rejection branch (HTTP 405) is the single
 * point where an out-of-band approval flow for mutations would be added.
 */

// ── Debug logging ─────────────────────────────────────────────────────────────
// Set WECLAPP_PROXY_DEBUG=1 to enable. Always writes to stderr; stdout carries
// only the port handshake line and must stay clean.

const DEBUG = Deno.env.get("WECLAPP_PROXY_DEBUG") === "1";
function debug(msg: string, extra?: Record<string, unknown>): void {
  if (!DEBUG) return;
  const ts = new Date().toISOString();
  const suffix = extra ? " " + JSON.stringify(extra) : "";
  console.error(`[weclapp-proxy] ${ts} ${msg}${suffix}`);
}

// ── Credentials ───────────────────────────────────────────────────────────────
// Read synchronously at startup. If this fails the process exits non-zero with a
// message on stderr, which run_code.ts surfaces in its result.

const home = Deno.env.get("HOME");
if (!home) {
  console.error("[weclapp-proxy] FATAL: HOME environment variable is not set");
  Deno.exit(1);
}

const credsPath = `${home}/.weclapp/credentials`;
debug("reading credentials", { path: credsPath });
let credsRaw: string;
try {
  credsRaw = await Deno.readTextFile(credsPath);
  debug("credentials file read", { bytes: credsRaw.length });
} catch (e) {
  console.error(
    `[weclapp-proxy] FATAL: cannot read credentials file at ${credsPath}: ${e}`,
  );
  Deno.exit(1);
}

const apiToken = credsRaw
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.startsWith("api_token"))
  .at(0)
  ?.split("=", 2)[1]
  ?.trim();

if (!apiToken) {
  console.error(
    `[weclapp-proxy] FATAL: api_token not found in ${credsPath}. ` +
      `Expected a line like: api_token = <your-token>`,
  );
  Deno.exit(1);
}

// Narrowed: token is definitely a string past this point.
const token: string = apiToken;
debug("api_token loaded", {
  prefix: token.slice(0, 4) + "…",
  length: token.length,
});

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = "https://sportident.weclapp.com/webapp/api/v2";

// ── Request handler ───────────────────────────────────────────────────────────

async function handle(req: Request): Promise<Response> {
  const inbound = new URL(req.url);
  debug("request", { method: req.method, path: inbound.pathname });

  // Readonly enforcement — the single future-consent hook.
  if (req.method !== "GET") {
    debug("rejected non-GET", { method: req.method });
    return new Response(
      `Method ${req.method} not allowed. This proxy is read-only; only GET is permitted.`,
      { status: 405, headers: { "Content-Type": "text/plain", Allow: "GET" } },
    );
  }

  // Path traversal guard.
  if (inbound.pathname.includes("..")) {
    debug("rejected path traversal", { path: inbound.pathname });
    return new Response("Error: path must not contain '..'", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Map inbound path + query → upstream Weclapp URL. The inbound pathname always
  // begins with "/", which is exactly the relative API path Weclapp expects.
  const upstreamUrl = `${BASE_URL}${inbound.pathname}${inbound.search}`;
  debug("→ upstream GET", { url: upstreamUrl });

  let upstream: Response;
  const t0 = Date.now();
  try {
    upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        AuthenticationToken: token,
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "opencode-weclapp-proxy/1.0",
      },
    });
  } catch (e) {
    debug("upstream network error", { url: upstreamUrl, error: String(e) });
    return new Response(`Network error contacting Weclapp: ${e}`, {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const body = await upstream.text();
  debug("← upstream", {
    status: upstream.status,
    ms: Date.now() - t0,
    bytes: body.length,
  });

  // Pass the upstream status and JSON body through verbatim.
  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}

// ── Serve on an ephemeral loopback port ───────────────────────────────────────

const server = Deno.serve(
  { port: 0, hostname: "127.0.0.1", onListen: () => {} },
  handle,
);

// Announce the chosen port to the parent on stdout (single parseable line).
const { port } = server.addr as Deno.NetAddr;
console.log(`WECLAPP_PROXY_PORT=${port}`);
debug("listening", { port });
