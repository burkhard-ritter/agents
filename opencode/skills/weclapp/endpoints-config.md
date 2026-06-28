# Weclapp Endpoints: System, Config & Reference Data

## customAttributeDefinition

Definitions of all custom fields (metadata for custom attributes used across entities).
Fetch once and cache — these change rarely.

```
GET  /customAttributeDefinition
GET  /customAttributeDefinition/count
GET  /customAttributeDefinition/id/{id}
GET  /customAttributeDefinition/readOrder
POST /customAttributeDefinition/updateOrder
```

Response fields include: `attributeType` (STRING, BOOLEAN, DATE, LIST, MULTISELECT_LIST, etc.),
`entityType` (which entity the attribute belongs to), `name`, `id`.

---

## document

File attachments linked to records.

```
GET  /document
GET  /document/count
GET  /document/id/{id}
GET  /document/id/{id}/download
GET  /document/id/{id}/downloadDocumentVersion
GET  /document/id/{id}/downloadDocumentVersionsZipped
POST /document/id/{id}/upload
POST /document/upload
POST /document/copy
POST /document/id/{id}/copy
```

Key filterable properties:
- `entityType`, `entityId`
- `name`, `mimeType`, `createdDate`

---

## webhook

Event webhooks configuration.

```
GET  /webhook
GET  /webhook/count
GET  /webhook/id/{id}
```

---

## externalConnection

Integrations with external platforms (e.g. shop systems, eBay).

```
GET  /externalConnection
GET  /externalConnection/count
GET  /externalConnection/id/{id}
POST /externalConnection/id/{id}/startArticleSynchronization
POST /externalConnection/id/{id}/startOrderSynchronization
POST /externalConnection/id/{id}/startEbayListingSynchronization
```

---

## mailTemplate

```
GET  /mailTemplate
GET  /mailTemplate/count
GET  /mailTemplate/id/{id}
```

---

## recordEmailingRule

Automatic email rules for records.

```
GET  /recordEmailingRule
GET  /recordEmailingRule/count
GET  /recordEmailingRule/id/{id}
```

---

## tag

User-defined tags (applied to parties, orders, etc.).

```
GET  /tag
GET  /tag/count
GET  /tag/id/{id}
```

---

## translation

UI / label translations.

```
GET  /translation
GET  /translation/count
GET  /translation/id/{id}
```

---

## propertyTranslation

```
POST /propertyTranslation/readPropertyTranslations
POST /propertyTranslation/updatePropertyTranslations
```

---

## comment

Comments on records.

```
GET  /comment
GET  /comment/count
GET  /comment/id/{id}
```

Key filterable properties:
- `entityType`, `entityId`, `userId`, `createdDate`

---

## meta

API schema introspection — useful for discovering valid filter properties.

```
GET  /meta/resources                  — list all resources
GET  /meta/queryFilterProperties      — filterable properties per resource
GET  /meta/querySortProperties        — sortable properties per resource
GET  /meta/legacyReferenceProperties
GET  /meta/validationErrorCodes
```

Use `meta/queryFilterProperties?entity=salesOrder` to discover all filterable fields
for a given resource without reading the full OpenAPI spec.

---

## system

```
GET  /system/licenses
GET  /system/permissions
GET  /system/demoTestSystemInfo
POST /system/createDemoTestSystem
```

---

## job

Background job status tracking.

```
POST /job/abort
GET  /job/status
```

---

## remotePrintJob

Print job management for physical label printers.

```
GET  /remotePrintJob
GET  /remotePrintJob/count
GET  /remotePrintJob/id/{id}
POST /remotePrintJob/createPrintJobWithDocument
```

---

## projectOrderStatusPage

Project status pages for customer-facing order tracking.

```
GET  /projectOrderStatusPage
GET  /projectOrderStatusPage/count
GET  /projectOrderStatusPage/id/{id}
```

---

## salesChannel reference

```
GET  /salesChannel/activeSalesChannels
GET  /salesChannel/salesChannelUsage
```

---

## commercialLanguage

Document languages.

```
GET  /commercialLanguage
GET  /commercialLanguage/count
GET  /commercialLanguage/id/{id}
```

---

## workScheduleProfile

Work schedule / shift profile definitions.

```
GET  /workScheduleProfile
GET  /workScheduleProfile/count
GET  /workScheduleProfile/id/{id}
```

---

## weclappOs

Weclapp OS app configurations.

```
GET  /weclappOs
GET  /weclappOs/count
GET  /weclappOs/id/{id}
```

---

## fulfillmentProvider

Third-party fulfillment providers.

```
GET  /fulfillmentProvider
GET  /fulfillmentProvider/count
GET  /fulfillmentProvider/id/{id}
```
