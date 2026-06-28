# Weclapp Endpoints: Warehouse & Logistics

## warehouse

```
GET  /warehouse
GET  /warehouse/count
GET  /warehouse/id/{id}
POST /warehouse/id/{id}/activate
POST /warehouse/id/{id}/deactivate
```

---

## warehouseStock

Current stock levels per article/warehouse/storage location.

```
GET  /warehouseStock
GET  /warehouseStock/count
GET  /warehouseStock/id/{id}
```

Key filterable properties:
- `articleId`, `warehouseId`, `storageLocationId`
- `quantity`, `reservedQuantity`, `availableQuantity`
- `batchNumberId`, `serialNumberId`

---

## warehouseStockMovement

Stock movement history and booking actions.

```
GET  /warehouseStockMovement
GET  /warehouseStockMovement/count
GET  /warehouseStockMovement/id/{id}
POST /warehouseStockMovement/bookDirectStockTransfer
POST /warehouseStockMovement/bookIncomingMovement
POST /warehouseStockMovement/bookOutgoingMovement
POST /warehouseStockMovement/bookFromLoadingEquipmentPlace
POST /warehouseStockMovement/bookToLoadingEquipmentPlace
POST /warehouseStockMovement/bookOntoInternalTransportReference
```

Key filterable properties:
- `articleId`, `warehouseId`, `storageLocationId`
- `movementDate`, `movementType`, `quantity`

---

## storageLocation

Warehouse areas / zones.

```
GET  /storageLocation
GET  /storageLocation/count
GET  /storageLocation/id/{id}
POST /storageLocation/id/{id}/activate
POST /storageLocation/id/{id}/deactivate
```

---

## storagePlace / storagePlaceBlockingReason / storagePlaceSize / shelf

Individual storage bins/places.

```
GET  /storagePlace
GET  /storagePlace/count
GET  /storagePlace/id/{id}

GET  /storagePlaceBlockingReason
GET  /storagePlaceBlockingReason/count
GET  /storagePlaceBlockingReason/id/{id}

GET  /storagePlaceSize
GET  /storagePlaceSize/count
GET  /storagePlaceSize/id/{id}

GET  /shelf
GET  /shelf/count
GET  /shelf/id/{id}
POST /shelf/id/{id}/activate
POST /shelf/id/{id}/deactivate
```

---

## shipment

Outbound deliveries (created from sales orders).

```
GET  /shipment
GET  /shipment/count
GET  /shipment/id/{id}
```

Key action paths:
```
POST /shipment/id/{id}/createSalesInvoice
POST /shipment/id/{id}/createPickingList
POST /shipment/id/{id}/createPickingOrder
POST /shipment/id/{id}/createShippingLabels
POST /shipment/id/{id}/createShippingLabelPdf
POST /shipment/id/{id}/createReturnLabels
POST /shipment/id/{id}/printLabel
GET  /shipment/id/{id}/downloadLatestDeliveryNotePdf
GET  /shipment/id/{id}/downloadLatestPickingListPdf
GET  /shipment/id/{id}/downloadLatestShippingLabelPdf
```

Key filterable properties:
- `status` — enum: `OPEN`, `PICKING_IN_PROGRESS`, `PACKED`, `SHIPPED`, `DELIVERED`
- `salesOrderId`, `customerId`, `warehouseId`
- `shipmentDate`, `trackingNumber`, `shippingCarrierId`
- `createdDate`, `lastModifiedDate`

---

## shipmentMethod / shippingCarrier / shipmentReturnAssessment / shipmentReturnError / shipmentReturnReason / shipmentReturnRectification

Reference tables for shipments — all follow pattern:
```
GET  /<resource>
GET  /<resource>/count
GET  /<resource>/id/{id}
```

---

## pick / pickCheckReason

Warehouse picking tasks.

```
GET  /pick
GET  /pick/count
GET  /pick/id/{id}

GET  /pickCheckReason
GET  /pickCheckReason/count
GET  /pickCheckReason/id/{id}
```

---

## transportationOrder

Internal warehouse transport tasks.

```
GET  /transportationOrder
GET  /transportationOrder/count
GET  /transportationOrder/id/{id}
POST /transportationOrder/id/{id}/createPick
POST /transportationOrder/id/{id}/addPicks
POST /transportationOrder/id/{id}/pickPick
POST /transportationOrder/id/{id}/createPickingList
POST /transportationOrder/id/{id}/createTransportationOrderFromUnpickedRecords
GET  /transportationOrder/id/{id}/internalTransportReferencesForPickUp
POST /transportationOrder/id/{id}/putDownInternalTransportReference
```

---

## internalTransportReference

Loading equipment / transport units in the warehouse.

```
GET  /internalTransportReference
GET  /internalTransportReference/count
GET  /internalTransportReference/id/{id}
POST /internalTransportReference/id/{id}/createLabel
GET  /internalTransportReference/id/{id}/downloadLatestLabel
```

---

## loadingEquipmentIdentifier

```
GET  /loadingEquipmentIdentifier
GET  /loadingEquipmentIdentifier/count
GET  /loadingEquipmentIdentifier/id/{id}
```

---

## batchNumber / serialNumber

Batch and serial number tracking.

```
GET  /batchNumber
GET  /batchNumber/count
GET  /batchNumber/id/{id}

GET  /serialNumber
GET  /serialNumber/count
GET  /serialNumber/id/{id}
```

Key filterable properties:
- `articleId`, `batchNumber`/`serialNumber`
- `expirationDate`, `productionDate`

---

## inventory / inventoryGroup / inventoryItem / inventoryTransportReference

Physical inventory count management.

```
GET  /inventory
GET  /inventory/count
GET  /inventory/id/{id}
POST /inventory/create
POST /inventory/id/{id}/bookInventory

GET  /inventoryGroup
GET  /inventoryGroup/count
GET  /inventoryGroup/id/{id}

GET  /inventoryItem
GET  /inventoryItem/count
GET  /inventoryItem/id/{id}

GET  /inventoryTransportReference
GET  /inventoryTransportReference/count
GET  /inventoryTransportReference/id/{id}
```
