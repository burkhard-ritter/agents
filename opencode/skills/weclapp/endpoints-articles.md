# Weclapp Endpoints: Articles & Products

## article

Core product/article catalogue.

```
GET    /article
GET    /article/count
GET    /article/id/{id}
DELETE /article/id/{id}
```

Key action paths:
```
POST /article/id/{id}/changeUnit
POST /article/id/{id}/createDatasheetPdf
POST /article/id/{id}/createLabelPdf
POST /article/id/{id}/uploadArticleImage
GET  /article/id/{id}/downloadArticleImage
GET  /article/id/{id}/downloadMainArticleImage
GET  /article/id/{id}/packagingUnitStructure
```

Key filterable properties:
- `articleNumber` — use `~` for prefix/pattern matching: `articleNumber ~ 'ART%'`
- `name`, `description`
- `active` — boolean
- `articleType` — enum: `STORABLE_ARTICLE`, `SERVICE_ARTICLE`, `SHIPPING_COST_ARTICLE`
- `articleCategoryId`, `unitId`, `manufacturerId`
- `eanCode`, `manufacturerPartNumber`
- `createdDate`, `lastModifiedDate`
- `minStockQuantity`, `targetStockQuantity`

Response contains `articlePrices` array — use property predicates to filter by sales channel:
```
/article?filter=articlePrices[salesChannel = "NET1"].price < 100
```

Use `additionalProperties=currentSalesPrice` to get current computed prices:
```
/article?additionalProperties=currentSalesPrice&properties=id,articleNumber,name
```

---

## articleCategory

Hierarchical product categories.

```
GET  /articleCategory
GET  /articleCategory/count
GET  /articleCategory/id/{id}
POST /articleCategory/id/{id}/uploadImage
GET  /articleCategory/id/{id}/downloadImage
```

Key filterable properties:
- `name`, `parentCategoryId`, `active`

---

## articlePrice

Individual price records (detached from article for bulk queries).

```
GET  /articlePrice
GET  /articlePrice/count
GET  /articlePrice/id/{id}
```

Key filterable properties:
- `articleId`, `salesChannel`, `currencyId`
- `startDate`, `endDate`, `quantity`
- `unitPrice`

---

## articleAccountingCode / articleCategoryClassification / articleItemGroup / articleRating / articleStatus / articleSupplySource

Small article reference tables — all follow the same pattern:
```
GET  /<resource>
GET  /<resource>/count
GET  /<resource>/id/{id}
```

---

## variantArticle / variantArticleAttribute / variantArticleVariant

Product variants (e.g. sizes, colours).

```
GET  /variantArticle
GET  /variantArticle/count
GET  /variantArticle/id/{id}

GET  /variantArticleAttribute
GET  /variantArticleAttribute/count
GET  /variantArticleAttribute/id/{id}

GET  /variantArticleVariant
GET  /variantArticleVariant/count
GET  /variantArticleVariant/id/{id}
```

---

## unit

Units of measure.

```
GET  /unit
GET  /unit/count
GET  /unit/id/{id}
```

---

## manufacturer

```
GET  /manufacturer
GET  /manufacturer/count
GET  /manufacturer/id/{id}
```

---

## customsTariffNumber

HS/customs tariff codes.

```
GET  /customsTariffNumber
GET  /customsTariffNumber/count
GET  /customsTariffNumber/id/{id}
```
