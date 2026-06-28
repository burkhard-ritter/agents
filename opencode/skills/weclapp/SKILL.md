# Weclapp API Skill

Access the Weclapp ERP system (sportident.weclapp.com) from `run_code` via the
pre-injected `WECLAPP_URL` constant. Only read operations are available — all
mutating requests are blocked by the proxy.

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

## Calling the API from `run_code`

All Weclapp access goes through `run_code`. `WECLAPP_URL` is pre-injected — do
not define it yourself. The proxy forwards GET requests to the Weclapp REST API
v2 and injects the API token transparently, so you never handle credentials.

Use this helper (copy into your code as-is):

```typescript
// Helper: GET a Weclapp API path via the local readonly proxy.
// `path` is relative to /webapp/api/v2 and must start with "/".
// Returns parsed JSON or throws on a non-2xx response.
async function weclappGet(path: string): Promise<unknown> {
  const res = await fetch(WECLAPP_URL + path.replace(/^\//, ""));
  if (!res.ok) {
    throw new Error(`Weclapp ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json();
}
```

Examples:

```typescript
await weclappGet("/party/count");
await weclappGet("/salesOrder/id/123");
await weclappGet("/article?pageSize=10&serializationVersion=2");
await weclappGet("/customer/count?filter=customerNumber = '10042'");

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
