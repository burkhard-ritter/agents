/**
 * Weclapp MCP Server
 *
 * A thin read-only proxy to the Weclapp REST API v2.
 * Exposes a single tool `weclapp_get` that forwards GET requests to Weclapp,
 * injecting the API token transparently.
 *
 * Runs two transports simultaneously:
 *   - stdio:  consumed by OpenCode (agent tool calls)
 *   - HTTP:   consumed by run_code Deno sandboxes via fetch()
 *
 * Permissions required (Deno):
 *   --allow-read=~/.weclapp/credentials
 *   --allow-net=sportident.weclapp.com,127.0.0.1
 *   --allow-env=HOME,WECLAPP_MCP_PORT
 */

import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js"
import { WebStandardStreamableHTTPServerTransport } from "npm:@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolRequest,
} from "npm:@modelcontextprotocol/sdk/types.js"

// ── Credentials ───────────────────────────────────────────────────────────────

const home = Deno.env.get("HOME")
if (!home) throw new Error("HOME environment variable is not set")

const credsPath = `${home}/.weclapp/credentials`
let credsRaw: string
try {
  credsRaw = await Deno.readTextFile(credsPath)
} catch (e) {
  throw new Error(`Cannot read credentials file at ${credsPath}: ${e}`)
}

const apiToken = credsRaw
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.startsWith("api_token"))
  .at(0)
  ?.split("=", 2)[1]
  ?.trim()

if (!apiToken) {
  throw new Error(
    `api_token not found in ${credsPath}. ` +
    `Expected a line like: api_token = <your-token>`
  )
}

// Narrowed: apiToken is definitely a string past this point
const token: string = apiToken

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = "https://sportident.weclapp.com/webapp/api/v2"
const HTTP_PORT = parseInt(Deno.env.get("WECLAPP_MCP_PORT") ?? "9876", 10)

// ── Tool handler ──────────────────────────────────────────────────────────────

function makeServer(): Server {
  const server = new Server(
    { name: "weclapp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "weclapp_get",
        description:
          "Make a read-only GET request to the Weclapp REST API v2. " +
          "Credentials are injected automatically — do not include auth headers. " +
          "Only GET requests are permitted; all mutating operations are blocked by this server. " +
          "Returns the raw JSON response body, or an error message with the HTTP status.",
        inputSchema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description:
                "API path relative to /webapp/api/v2. Must start with '/'. " +
                "May include a query string. " +
                "Examples: '/customer', '/salesOrder/id/123', " +
                "'/article?pageSize=10&serializationVersion=2', " +
                "'/customer/count'",
            },
          },
          required: ["path"],
        },
      },
    ],
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    if (request.params.name !== "weclapp_get") {
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      }
    }

    const { path } = request.params.arguments as { path: string }

    if (typeof path !== "string" || !path.startsWith("/")) {
      return {
        content: [{ type: "text" as const, text: "Error: path must be a string starting with '/'" }],
        isError: true,
      }
    }

    if (path.includes("..")) {
      return {
        content: [{ type: "text" as const, text: "Error: path must not contain '..'" }],
        isError: true,
      }
    }

    const url = `${BASE_URL}${path}`

    let response: Response
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "AuthenticationToken": token,
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
          "User-Agent": "opencode-weclapp-mcp/1.0",
        },
      })
    } catch (e) {
      return {
        content: [{ type: "text" as const, text: `Network error: ${e}` }],
        isError: true,
      }
    }

    const body = await response.text()

    if (!response.ok) {
      return {
        content: [{
          type: "text" as const,
          text: `HTTP ${response.status} ${response.statusText}\n${body}`,
        }],
        isError: true,
      }
    }

    return {
      content: [{ type: "text" as const, text: body }],
    }
  })

  return server
}

// ── Transport 1: stdio (for OpenCode agent) ───────────────────────────────────
// Each transport needs its own Server instance.

const stdioServer = makeServer()
const stdioTransport = new StdioServerTransport()
await stdioServer.connect(stdioTransport)

// ── Transport 2: HTTP (for run_code Deno sandboxes) ───────────────────────────
// Stateless mode: no session IDs, each request is independent.
// This is correct for run_code usage where each Deno process is ephemeral.

const httpTransport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})

const httpServer = makeServer()
await httpServer.connect(httpTransport)

Deno.serve(
  { port: HTTP_PORT, hostname: "127.0.0.1" },
  (req: Request): Promise<Response> => httpTransport.handleRequest(req),
)

// Log to stderr so it doesn't pollute the stdio MCP stream
console.error(
  `[weclapp-mcp] started — stdio ready, HTTP listening on 127.0.0.1:${HTTP_PORT}`
)
