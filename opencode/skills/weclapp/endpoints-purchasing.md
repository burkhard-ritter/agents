# Weclapp Endpoints: Purchasing

## purchaseOrder

```
GET  /purchaseOrder
GET  /purchaseOrder/count
GET  /purchaseOrder/id/{id}
```

Key action paths:
```
POST /purchaseOrder/id/{id}/createIncomingGoods
POST /purchaseOrder/id/{id}/createPurchaseInvoice
POST /purchaseOrder/id/{id}/createSupplierReturn
POST /purchaseOrder/id/{id}/createProductionOrders
POST /purchaseOrder/id/{id}/createCancellationSlipPdf
POST /purchaseOrder/id/{id}/createDropshippingDeliveryNotePdf
POST /purchaseOrder/id/{id}/cancelDropshippingShipments
POST /purchaseOrder/id/{id}/processDropshipping
POST /purchaseOrder/id/{id}/manuallyClose
POST /purchaseOrder/id/{id}/resetTaxes
POST /purchaseOrder/id/{id}/printLabel
GET  /purchaseOrder/id/{id}/downloadLatestPurchaseOrderPdf
GET  /purchaseOrder/id/{id}/downloadLatestCancellationSlipPdf
GET  /purchaseOrder/id/{id}/downloadLatestDropshippingDeliveryNotePdf
```

Key filterable properties:
- `status` — enum: `OPEN`, `ORDER_ENTRY_IN_PROGRESS`, `SENT`, `PARTIALLY_DELIVERED`, `DELIVERED`, `INVOICED`, `CANCELLED`
- `supplierId`, `createdDate`, `orderDate`
- `responsibleUserId`, `warehouseId`

---

## purchaseInvoice

```
GET  /purchaseInvoice
GET  /purchaseInvoice/count
GET  /purchaseInvoice/id/{id}
```

Key action paths:
```
POST /purchaseInvoice/id/{id}/cancel
POST /purchaseInvoice/id/{id}/createCreditNote
POST /purchaseInvoice/id/{id}/convertPurchaseInvoiceToCreditNote
POST /purchaseInvoice/id/{id}/resetTaxes
POST /purchaseInvoice/id/{id}/printLabel
GET  /purchaseInvoice/id/{id}/downloadLatestPurchaseInvoiceDocument
POST /purchaseInvoice/startInvoiceDocumentProcessing/multipartUpload
```

Key filterable properties:
- `status`, `supplierId`, `invoiceDate`, `dueDate`, `createdDate`

---

## purchaseOpenItem

Outstanding payables.

```
GET  /purchaseOpenItem
GET  /purchaseOpenItem/count
GET  /purchaseOpenItem/id/{id}
POST /purchaseOpenItem/id/{id}/createPaymentApplication
POST /purchaseOpenItem/id/{id}/updatePaymentState
```

---

## purchaseOrderRequest

Internal procurement requests / RFQs.

```
GET  /purchaseOrderRequest
GET  /purchaseOrderRequest/count
GET  /purchaseOrderRequest/id/{id}
POST /purchaseOrderRequest/id/{id}/createPurchaseOrder
POST /purchaseOrderRequest/id/{id}/createBlanketPurchaseOrder
POST /purchaseOrderRequest/id/{id}/exportItemsAsCsv
POST /purchaseOrderRequest/id/{id}/pushPurchasePrices
```

---

## purchaseRequisition

Material requirements / replenishment requests.

```
GET  /purchaseRequisition
GET  /purchaseRequisition/count
GET  /purchaseRequisition/id/{id}
POST /purchaseRequisition/id/{id}/addToPurchaseOrder
POST /purchaseRequisition/id/{id}/addToInternalShipment
POST /purchaseRequisition/id/{id}/createProductionOrder
POST /purchaseRequisition/deleteAllRequisitions
POST /purchaseRequisition/startMaterialPlanningRun
```

---

## blanketPurchaseOrder

```
GET  /blanketPurchaseOrder
GET  /blanketPurchaseOrder/count
GET  /blanketPurchaseOrder/id/{id}
POST /blanketPurchaseOrder/id/{id}/generateReleases
GET  /blanketPurchaseOrder/id/{id}/downloadLatestBlanketPurchaseOrderPdf
```

---

## incomingGoods

Goods receipts (created from purchase orders).

```
GET  /incomingGoods
GET  /incomingGoods/count
GET  /incomingGoods/id/{id}
```

Key action paths:
```
POST /incomingGoods/id/{id}/addPurchaseOrders
POST /incomingGoods/id/{id}/createPurchaseInvoice
POST /incomingGoods/id/{id}/createCreditNote
POST /incomingGoods/id/{id}/createSupplierReturn
POST /incomingGoods/id/{id}/createCompensationShipment
POST /incomingGoods/id/{id}/createReturnLabels
GET  /incomingGoods/id/{id}/incomingBookings
POST /incomingGoods/id/{id}/updateIncomingBookings
```

Key filterable properties:
- `status`, `supplierId`, `warehouseId`, `purchaseOrderId`
- `createdDate`, `bookingDate`
