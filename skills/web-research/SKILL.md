---
name: web-research
description: Research and look up information on the web, retrieve documentation, and fetch web content. Search using Kagi and fetch readable content from URLs.
allowed-tools: Bash, Read
---

# Web Research Skill

Research and look up information on the web, retrieve documentation, and fetch web content.

## When to Use

Use this skill when you need to:
- Search the web for information, documentation, or answers
- Fetch and read content from specific URLs
- Look up technical documentation
- Research topics in depth
- Find current information not in your training data
- Verify facts or gather additional context

## Available Tools

### search
Search the web using the [Kagi Search API](https://help.kagi.com/kagi/api/search.html) and get results with links.

**Requires:** the `KAGI_API_TOKEN` environment variable (a Kagi API key from https://kagi.com/api/keys). If it is not set, the tool exits with instructions.

**Usage:** `search <query> [num_results]`
- `query`: The search query (required)
- `num_results`: Number of results to return (optional, default: 5)

**Example:**
```bash
./tools/search "python async await tutorial" 10
./tools/search "rust ownership system"
```

### fetch
Fetch a web page and convert it to readable Markdown format.

**Usage:** `fetch <url> [max_length]`
- `url`: The URL to fetch (required)
- `max_length`: Maximum content length in characters (optional, default: 10000)

**Example:**
```bash
./tools/fetch "https://docs.python.org/3/library/asyncio.html"
./tools/fetch "https://example.com/article" 5000
```

## Workflow Examples

### Quick fact lookup:
1. Use `search` to find relevant sources
2. Use `fetch` on the most promising link to read the full content

### In-depth research:
1. Use `search` with a broader query to get overview
2. `fetch` multiple relevant URLs
3. Refine search queries based on initial findings
4. `fetch` specific documentation pages

### Technical documentation:
1. Search for official docs or API references
2. `fetch` the documentation pages
3. Extract code examples and explanations

## Notes

- **Runtime:** Both tools are TypeScript scripts that run with [Deno](https://deno.com). Deno must be installed and on `PATH`. On first run, `jsr:@b-fuze/deno-dom` is downloaded and cached automatically — no manual install needed.
- **Cross-platform:** Tools work on Windows, Linux, and macOS without any additional dependencies (no curl, pandoc, lynx, or w3m required).
- **Search backend:** Kagi Search API v1 (`POST https://kagi.com/api/v1/search`, Bearer auth). It requires a token in `KAGI_API_TOKEN`, created at <https://kagi.com/api/keys>. The Search API is billed per query from API credits, **separately** from a Kagi web subscription — a web plan alone does not grant API access.
- Each `search` call costs API credits, so prefer one well-formed query over many redundant ones, and use `fetch` to read promising results in depth.
- The tool reports actionable errors for a missing/invalid token (401), missing API access or credits (403), and rate limiting (429).
- Web pages are converted to Markdown for easier reading
- Long pages are truncated to avoid overwhelming output
- Some websites may block automated requests or require JavaScript (SPAs)
