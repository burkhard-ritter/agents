---
name: web-research
description: Research and look up information on the web, retrieve documentation, and fetch web content. Search using DuckDuckGo and fetch readable content from URLs.
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
Search the web using DuckDuckGo and get summarized results with links.

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

- Search results are fetched from DuckDuckGo (no API key required)
- Web pages are converted to Markdown for easier reading
- Long pages are truncated to avoid overwhelming output
- Some websites may block automated requests or require JavaScript
- For best results with documentation, use `fetch` directly on known doc URLs
