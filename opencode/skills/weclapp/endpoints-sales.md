# Weclapp Endpoints: Sales

## salesOrder

Core sales document. Very rich — 32 paths.

```
GET  /salesOrder                          list
GET  /salesOrder/count                    count
GET  /salesOrder/id/{id}                  get by id
GET  /salesOrder/defaultValuesForCreate   default field values for new order
```

Key action paths (GET unless noted):
```
POST /salesOrder/id/{id}/createSalesInvoice
POST /salesOrder/id/{id}/createShipment
POST /salesOrder/id/{id}/createPurchaseOrder
POST /salesOrder/id/{id}/createPurchaseOrderRequest
POST /salesOrder/id/{id}/createProductionOrders
POST /salesOrder/id/{id}/createCustomerReturn
POST /salesOrder/id/{id}/createDropshipping
POST /salesOrder/id/{id}/createPerformanceRecord
POST /salesOrder/id/{id}/createAdvancePaymentRequest
POST /salesOrder/id/{id}/createPartPaymentInvoice
POST /salesOrder/id/{id}/createPrepaymentFinalInvoice
POST /salesOrder/id/{id}/createReturnLabels
POST /salesOrder/id/{id}/createShippingLabels
POST /salesOrder/id/{id}/cancelOrManuallyClose
POST /salesOrder/id/{id}/manuallyClose
POST /salesOrder/id/{id}/calculateSalesPrices
POST /salesOrder/id/{id}/recalculateCosts
POST /salesOrder/id/{id}/updatePrices
POST /salesOrder/id/{id}/resetTaxes
GET  /salesOrder/id/{id}/downloadLatestOrderConfirmationPdf
POST /salesOrder/id/{id}/printLabel
```

Key filterable properties:
- `status` — enum: `OPEN`, `IN_PROGRESS`, `SHIPPED`, `INVOICED`, `CANCELLED`
- `customerId`, `customerNumber`
- `orderDate`, `createdDate`, `lastModifiedDate` — ms since epoch in responses, ISO-8601 in filters
- `salesChannel`
- `responsibleUserId`
- `externalOrderNumber`, `customerOrderNumber`

---

## quotation

```
GET  /quotation
GET  /quotation/count
GET  /quotation/id/{id}
```

Key action paths:
```
POST /quotation/id/{id}/accept
POST /quotation/id/{id}/inquire
POST /quotation/id/{id}/createNewVersion
POST /quotation/id/{id}/createPurchaseOrderRequest
POST /quotation/id/{id}/downloadLatestQuotationPdf
POST /quotation/id/{id}/createQuotationPdf
POST /quotation/id/{id}/calculateSalesPrices
POST /quotation/id/{id}/updatePrices
POST /quotation/id/{id}/resetTaxes
POST /quotation/id/{id}/recalculateCosts
```

Key filterable properties:
- `status` — enum: `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`
- `customerId`, `createdDate`, `expirationDate`
- `responsibleUserId`, `salesChannel`

---

## salesInvoice

```
GET  /salesInvoice
GET  /salesInvoice/count
GET  /salesInvoice/id/{id}
```

Key action paths:
```
POST /salesInvoice/id/{id}/cancel
POST /salesInvoice/id/{id}/createCreditNote
POST /salesInvoice/id/{id}/addSalesOrders
POST /salesInvoice/id/{id}/downloadLatestSalesInvoicePdf
POST /salesInvoice/id/{id}/calculateSalesPrices
POST /salesInvoice/id/{id}/updatePrices
POST /salesInvoice/id/{id}/resetTaxes
POST /salesInvoice/id/{id}/recalculateCosts
```

Key filterable properties:
- `status` — enum: `DRAFT`, `SENT`, `PAID`, `CANCELLED`
- `customerId`, `invoiceDate`, `dueDate`, `createdDate`
- `salesChannel`, `responsibleUserId`

---

## salesOpenItem

Outstanding receivables.

```
GET  /salesOpenItem
GET  /salesOpenItem/count
GET  /salesOpenItem/id/{id}
POST /salesOpenItem/id/{id}/createPaymentApplication
POST /salesOpenItem/id/{id}/updatePaymentState
```

Key filterable properties:
- `customerId`, `dueDate`, `openAmount`, `currency`

---

## blanketSalesOrder

```
GET  /blanketSalesOrder
GET  /blanketSalesOrder/count
GET  /blanketSalesOrder/id/{id}
POST /blanketSalesOrder/id/{id}/generateReleases
POST /blanketSalesOrder/id/{id}/updateStatus
GET  /blanketSalesOrder/id/{id}/downloadLatestBlanketSalesOrderPdf
```

---

## opportunity

CRM sales opportunities / deals.

```
GET  /opportunity
GET  /opportunity/count
GET  /opportunity/id/{id}
POST /opportunity/id/{id}/linkQuotation
```

Key filterable properties:
- `status`, `customerId`, `responsibleUserId`
- `expectedClosingDate`, `probability`, `value`
- `salesStageId`

---

## campaign / campaignParticipant

Marketing campaigns.

```
GET  /campaign
GET  /campaign/count
GET  /campaign/id/{id}

GET  /campaignParticipant
GET  /campaignParticipant/count
GET  /campaignParticipant/id/{id}
```

---

## salesStage / salesTeam / salesChannel

Reference data for sales:

```
GET  /salesStage
GET  /salesStage/count
GET  /salesStage/id/{id}

GET  /salesTeam
GET  /salesTeam/count
GET  /salesTeam/id/{id}

GET  /salesChannel/activeSalesChannels
GET  /salesChannel/salesChannelUsage
```

---

## region

Sales regions with responsible person assignment.

```
GET  /region
GET  /region/count
GET  /region/id/{id}
POST /region/id/{id}/resetResponsiblePerson
```
