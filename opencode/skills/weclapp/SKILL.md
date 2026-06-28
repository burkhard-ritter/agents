# Weclapp API Skill

Access the Weclapp ERP system (sportident.weclapp.com) via the `weclapp_get` MCP tool.
Only read operations are available — all mutating requests are blocked by the proxy.

## Endpoint reference

Endpoint details are split into domain-specific files in this directory.
Load the relevant one before working with a domain — do not load all of them at once.

| File                      | Domain                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `endpoints-sales.md`      | salesOrder, quotation, salesInvoice, salesOpenItem, blanketSalesOrder, opportunity                                                                                 |
| `endpoints-purchasing.md` | purchaseOrder, purchaseInvoice, purchaseOpenItem, purchaseOrderRequest, purchaseRequisition, blanketPurchaseOrder, incomingGoods                                   |
| `endpoints-articles.md`   | article, articleCategory, articlePrice, articleAccountingCode, unit, manufacturer, variantArticle                                                                  |
| `endpoints-warehouse.md`  | warehouse, warehouseStock, warehouseStockMovement, storageLocation, storagePlace, shelf, shipment, pick, transportationOrder, batchNumber, serialNumber, inventory |
| `endpoints-finance.md`    | accountingTransaction, bankAccount, bankTransaction, cashAccount, ledgerAccount, paymentMethod, paymentRun, tax, termOfPayment, financialYear                      |
| `endpoints-crm.md`        | ticket, task, timeRecord, performanceRecord, serviceQuota, crmEvent, calendar, notification, reminder                                                              |
| `endpoints-parties.md`    | party, customer, user, contact — the party/customer/supplier/contact hierarchy                                                                                     |
| `endpoints-config.md`     | All small reference/lookup tables (shipmentMethod, shippingCarrier, currency, customAttributeDefinition, legalForm, etc.)                                          |

---

## Two ways to call the API

### 1. Direct agent tool call (simple, single queries)

Call `weclapp_get` directly:

```
weclapp_get({ path: "/customer?pageSize=10&serializationVersion=2" })
weclapp_get({ path: "/salesOrder/id/123" })
weclapp_get({ path: "/article/count" })
weclapp_get({ path: "/customer/count?filter=customerNumber = '10042'" })
```

### 2. From `run_code` (pagination, aggregation, multi-step logic)

Use `run_code` when you need to fetch many records, paginate, or process results.
`WECLAPP_MCP_URL` is pre-injected — do not define it yourself.

Use this helper (copy into your code as-is):

```typescript
// Helper: call weclapp_get via the local MCP HTTP server
// Returns parsed JSON or throws on error.
async function weclappGet(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-06-18",
  };

  // Initialize session
  const initRes = await fetch(WECLAPP_MCP_URL, {
    method: "POST",
    headers,
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
  });
  const sessionId = initRes.headers.get("mcp-session-id");
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  // Discard init response body
  await initRes.text();

  // Call the tool
  const res = await fetch(WECLAPP_MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "weclapp_get", arguments: { path } },
    }),
  });
  const body = await res.text();
  // Parse SSE envelope: find `data:` line
  const dataLine = body.split("\n").find((l) => l.startsWith("data:"));
  if (!dataLine) throw new Error(`No SSE data in response for ${path}`);
  const json = JSON.parse(dataLine.slice(5).trim());
  const text = json?.result?.content?.[0]?.text;
  if (json?.result?.isError)
    throw new Error(`Weclapp API error on ${path}: ${text}`);
  return JSON.parse(text ?? "null");
}

// Helper: fetch all pages of a resource
async function fetchAll(
  resource: string,
  extraParams = "",
): Promise<unknown[]> {
  const results: unknown[] = [];
  let page = 1;
  const pageSize = 100;
  while (true) {
    const sep = resource.includes("?") ? "&" : "?";
    const data = (await weclappGet(
      `${resource}${sep}page=${page}&pageSize=${pageSize}&serializationVersion=2${extraParams ? "&" + extraParams : ""}`,
    )) as { result: unknown[] };
    const batch = data.result ?? [];
    results.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }
  return results;
}
```

---

## API conventions

### Base URL (injected by proxy)

`https://sportident.weclapp.com/webapp/api/v2`

### URL patterns

| Operation | Path                      |
| --------- | ------------------------- |
| List      | `GET /<resource>`         |
| Count     | `GET /<resource>/count`   |
| Get by ID | `GET /<resource>/id/<id>` |

### Pagination

Default page size is 100, max is usually 1000. Use `page` + `pageSize`:

```
/salesOrder?page=1&pageSize=100
/salesOrder?page=2&pageSize=100
```

Get total count first: `GET /salesOrder/count`

### Filtering — use filter expressions

Always use the `filter` query parameter with filter expressions. Do not use the old
`<property>-<operator>=<value>` style parameters.

```
/customer?filter=customerNumber = '10042'
/salesOrder?filter=status = "OPEN"
/salesOrder?filter=createdDate >= "2024-01-01T00:00:00Z" and status != "CANCELLED"
/article?filter=articleNumber ~ 'ART%'
/customer?filter=lower(company) ~ '%sport%'
/salesOrder?filter=customerId = 123 and orderDate >= "2024-01-01T00:00:00Z"
```

Multiple `filter` parameters are ANDed together:

```
/customer?filter=status = "ACTIVE"&filter=createdDate >= "2024-01-01T00:00:00Z"
```

#### Filter expression operators

| Operator             | Types          | Notes                                           |
| -------------------- | -------------- | ----------------------------------------------- |
| `=`                  | all            | equals                                          |
| `!=`                 | all            | not equals                                      |
| `<`, `>`, `<=`, `>=` | number, date   | comparison                                      |
| `~`                  | string         | pattern match — `%` = any chars, `_` = one char |
| `in`                 | all            | `status in ["OPEN", "IN_PROGRESS"]`             |
| `contains`           | collections    | `tags contains "important"`                     |
| `null`               | all            | `internalNote null` (is null)                   |
| `empty`              | collections    | `tags empty`                                    |
| `and`, `or`, `not`   | boolean        | logical                                         |
| `+`, `-`, `*`, `/`   | number, string | arithmetic / string concat                      |

#### Functions

- `lower(str)` — lowercase
- `trim(str)` — strip whitespace
- `length(str)` — string length

#### Conditional (ternary)

```
(status = "OPEN") ? 1 : 2
```

#### Type coercion for date properties

String literals are parsed as ISO-8601 when compared to date fields:

```
createdDate >= "2024-01-01T00:00:00Z"
createdDate >= "2024-10-13T10:39:12+02:00"
```

Integer literals are interpreted as milliseconds since epoch.

#### Property predicates (filter nested lists)

```
values[locale = "de"].text = "Lieferung"
articlePrices[salesChannel = "NET1"].price < 100
contacts[firstName = "Alice"].lastName = "Smith"
```

### Sorting — use orderBy expressions

Always use the `orderBy` parameter. Do not use the old `sort` parameter.

```
/salesOrder?orderBy=createdDate desc
/customer?orderBy=lastName asc, firstName asc
/article?orderBy=length(trim(articleNumber)) desc, articleNumber
```

Note: `sort` and `orderBy` cannot be combined — use only one per request.

### Selecting specific properties

Use `properties` to reduce response size:

```
/customer?properties=id,customerNumber,company,contacts.id,contacts.lastName
```

Use `includeReferencedEntities` to fetch related entities in one request:

```
/article?includeReferencedEntities=unitId,articleCategoryId&properties=id,name,unitId
```

### Serialization notes

- Timestamps are **milliseconds since epoch** (integers), not ISO strings in responses
- Decimal numbers (prices, quantities) are returned as **strings** to preserve precision
- Use `serializationVersion=2` for the most consistent response format
- Null fields are omitted by default; add `serializeNulls` to include them

### Rate limiting

- No hard rate limits, but queued under load; HTTP 429 after 30s queue wait
- Implement retry with exponential backoff for 429 responses
- Prefer fewer, larger requests with filters over many small requests
- Use `filter` to avoid fetching unnecessary records

### Custom attributes

Custom attribute definitions (names, IDs, types):

```
/customAttributeDefinition?serializationVersion=2
```

Filter by custom attribute in queries:

```
/customer?filter=customAttribute4587 = "SOME_VALUE"
/customer?filter=customAttribute3387.value = "OPTION1"
/customer?filter=customAttribute4587.entityReferences.entityId = 1234
```
