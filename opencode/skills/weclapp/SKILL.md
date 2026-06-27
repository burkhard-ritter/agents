# Weclapp API Skill

Access the Weclapp ERP system (sportident.weclapp.com) via the `weclapp_get` MCP tool.
Only read operations are available — all mutating requests are blocked by the proxy.

## Two ways to call the API

### 1. Direct agent tool call (simple queries)

Call `weclapp_get` directly with a path:

```
weclapp_get({ path: "/customer?pageSize=10" })
weclapp_get({ path: "/salesOrder/id/123" })
weclapp_get({ path: "/article/count" })
```

Use this for simple, single lookups where you just need one result.

### 2. From `run_code` (pagination, aggregation, multi-step logic)

When you need to fetch many records, loop over pages, join data across resources,
or process results programmatically, use `run_code`. The constant `WECLAPP_MCP_URL`
is pre-injected — you do not need to define it.

The MCP protocol requires a JSON-RPC handshake. Use this helper pattern:

```typescript
// Helper: call weclapp_get via the local MCP HTTP server
async function weclappGet(path: string): Promise<unknown> {
  // 1. Initialize the MCP session
  const initRes = await fetch(WECLAPP_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "run_code", version: "1.0" },
      },
    }),
  })
  const initData = await initRes.json()
  const sessionId = initRes.headers.get("mcp-session-id")

  // 2. Send initialized notification
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-06-18",
  }
  if (sessionId) headers["Mcp-Session-Id"] = sessionId

  await fetch(WECLAPP_MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
  })

  // 3. Call the tool
  const res = await fetch(WECLAPP_MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "weclapp_get", arguments: { path } },
    }),
  })
  const data = await res.json()
  const text = data?.result?.content?.[0]?.text
  if (data?.result?.isError) throw new Error(`Weclapp error: ${text}`)
  return JSON.parse(text)
}

// Example: fetch all customers with pagination
async function fetchAll(resource: string, pageSize = 100): Promise<unknown[]> {
  const results: unknown[] = []
  let page = 1
  while (true) {
    const data = await weclappGet(`/${resource}?page=${page}&pageSize=${pageSize}&serializationVersion=2`) as { result: unknown[] }
    const batch = data.result ?? []
    results.push(...batch)
    if (batch.length < pageSize) break
    page++
  }
  return results
}

const customers = await fetchAll("customer")
console.log(`Total customers: ${customers.length}`)
```

## API conventions

### Base URL (handled by proxy)
`https://sportident.weclapp.com/webapp/api/v2`

All paths you provide are relative to this base.

### Common resources

| Resource | Description |
|---|---|
| `/customer` | Customers |
| `/salesOrder` | Sales orders |
| `/article` | Articles / products |
| `/party` | Parties (customers + suppliers + contacts) |
| `/contract` | Contracts |
| `/ticket` | Support tickets |
| `/shipment` | Shipments |
| `/invoice` | Invoices (outgoing) |
| `/purchaseOrder` | Purchase orders |
| `/warehouse` | Warehouses |
| `/customAttributeDefinition` | Custom attribute metadata |

Append `/count` to any resource path to get a total count:
```
/customer/count
/salesOrder/count?status-eq=OPEN
```

Fetch a specific record by ID:
```
/salesOrder/id/123
/customer/id/456
```

### Pagination

Default page size is 100, maximum is usually 1000.

```
/customer?page=1&pageSize=100
/customer?page=2&pageSize=100
```

Use `/count` first to know how many pages to expect.

### Sorting

```
/salesOrder?sort=-createdDate          # descending
/salesOrder?sort=createdDate           # ascending
/salesOrder?sort=createdDate,-amount   # multi-field
```

### Filtering

Filter parameters use the pattern `<property>-<operator>=<value>`:

```
/customer?customerNumber-eq=10042
/salesOrder?status-eq=OPEN
/salesOrder?createdDate-gt=1700000000000      # milliseconds since epoch
/salesOrder?orderDate-ge=1700000000000&orderDate-le=1710000000000
/article?articleNumber-like=ART%
/customer?name-ilike=%sport%                  # case-insensitive
/salesOrder?customerOrderNumber-null          # field is null
/customer?customerNumber-in=["10042","10043"] # in list
```

Combine multiple filters with `&` — they are AND-ed together.

For OR logic, prefix with `or-`:
```
/party?or-name-eq=Alice&or-name-eq=Bob
```

### Operators

| Operator | Meaning |
|---|---|
| `eq` | equal |
| `ne` | not equal |
| `lt` / `gt` | less / greater than |
| `le` / `ge` | less / greater or equal |
| `like` / `notlike` | SQL LIKE pattern (`%` and `_`) |
| `ilike` / `notilike` | case-insensitive LIKE |
| `null` / `notnull` | is null / is not null |
| `in` / `notin` | value in JSON array |

### Serialization notes

- Timestamps are **milliseconds since epoch** (Unix ms), not ISO strings
- Decimal numbers (prices, quantities) are returned as **strings** to preserve precision
- Use `serializationVersion=2` for the most consistent response format
- Null fields are omitted by default; add `serializeNulls` to include them

### Rate limiting

- No fixed rate limits, but requests may be queued under load (HTTP 429 after 30s queue wait)
- Implement retry with exponential backoff for 429 responses
- Prefer fewer large requests over many small ones
- Do not poll in tight loops

## Custom attributes

Custom attributes appear on entities as `customAttributes` array entries.
Their definitions (names, types, IDs) can be fetched once and reused:

```
/customAttributeDefinition
```

Filter by custom attribute ID in queries:
```
/customer?customAttribute4587-eq=SOME_VALUE
```
