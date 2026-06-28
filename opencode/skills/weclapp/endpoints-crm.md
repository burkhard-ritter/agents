# Weclapp Endpoints: CRM, Support & Service

## ticket

Customer support / helpdesk tickets.

```
GET  /ticket
GET  /ticket/count
GET  /ticket/id/{id}
POST /ticket/id/{id}/createPerformanceRecord
POST /ticket/id/{id}/createPublicPage
POST /ticket/id/{id}/disablePublicPage
POST /ticket/id/{id}/linkSalesOrder
POST /ticket/id/{id}/unlinkSalesOrder
```

Key filterable properties:
- `status` — enum: `OPEN`, `IN_PROGRESS`, `WAITING`, `CLOSED`
- `ticketTypeId`, `ticketCategoryId`, `ticketChannelId`, `ticketPriorityId`
- `customerId`, `responsibleUserId`, `assignedUserId`
- `subject`, `createdDate`, `lastModifiedDate`, `dueDate`

---

## ticket reference tables

All follow `GET /<resource>`, `GET /<resource>/count`, `GET /<resource>/id/{id}`:

- `ticketCategory` — ticket categories
- `ticketChannel` — e.g. email, phone, chat
- `ticketStatus` — custom status definitions
- `ticketType` — ticket types
- `ticketPriority` — priority levels
- `ticketFaq` — FAQ entries
- `ticketAssignmentRule` — auto-assignment rules
- `ticketServiceLevelAgreement` — SLA definitions
- `ticketPoolingGroup` — ticket pools / queues

---

## task / taskList / taskTemplate

```
GET  /task
GET  /task/count
GET  /task/id/{id}
POST /task/fromTemplate
POST /task/id/{id}/createPerformanceRecord
POST /task/id/{id}/updateBillingData

GET  /taskList
GET  /taskList/count
GET  /taskList/id/{id}

GET  /taskTemplate
GET  /taskTemplate/count
GET  /taskTemplate/id/{id}
```

Key filterable properties for task:
- `status`, `assignedUserId`, `responsibleUserId`
- `dueDate`, `startDate`, `createdDate`
- `customerId`, `salesOrderId`, `ticketId`

---

## timeRecord

Time tracking entries.

```
GET  /timeRecord
GET  /timeRecord/count
GET  /timeRecord/id/{id}
```

Key filterable properties:
- `userId`, `date`, `taskId`, `ticketId`, `salesOrderId`
- `billable`, `billed`, `duration` (in minutes)
- `createdDate`, `lastModifiedDate`

---

## performanceRecord

Service performance records / project billing records.

```
GET  /performanceRecord
GET  /performanceRecord/count
GET  /performanceRecord/id/{id}
POST /performanceRecord/id/{id}/createInvoice
POST /performanceRecord/id/{id}/addToPerformanceRecord
POST /performanceRecord/id/{id}/recalculateQuantities
POST /performanceRecord/id/{id}/performServiceQuotaAssignmentForTimeRecords
POST /performanceRecord/id/{id}/downloadLatestPerformanceRecordPdf
POST /performanceRecord/id/{id}/uploadSignature
POST /performanceRecord/id/{id}/downloadSignature
POST /performanceRecord/id/{id}/removeSignature
POST /performanceRecord/startConfiguredMassPerformanceRecordCreation
```

---

## serviceQuota

Service entitlements / prepaid service packages.

```
GET  /serviceQuota
GET  /serviceQuota/count
GET  /serviceQuota/id/{id}
POST /serviceQuota/id/{id}/open
POST /serviceQuota/id/{id}/close
POST /serviceQuota/id/{id}/createPerformanceRecord
```

---

## crmEvent / crmEventCategory / crmCallCategory

CRM activity log entries (calls, meetings, notes).

```
GET  /crmEvent
GET  /crmEvent/count
GET  /crmEvent/id/{id}

GET  /crmEventCategory
GET  /crmEventCategory/count
GET  /crmEventCategory/id/{id}

GET  /crmCallCategory
GET  /crmCallCategory/count
GET  /crmCallCategory/id/{id}
```

Key filterable properties for crmEvent:
- `partyId`, `userId`, `crmEventCategoryId`
- `startDate`, `endDate`, `createdDate`
- `eventType`

---

## calendar / calendarEvent

```
GET  /calendar
GET  /calendar/count
GET  /calendar/id/{id}
POST /calendar/id/{id}/deleteCalendarAndMoveEvents
POST /calendar/id/{id}/importiCal

GET  /calendarEvent
GET  /calendarEvent/count
GET  /calendarEvent/id/{id}
```

---

## notification

In-app notifications.

```
GET  /notification
GET  /notification/count
GET  /notification/id/{id}
POST /notification/id/{id}/markRead
```

---

## reminder

```
GET  /reminder
GET  /reminder/count
GET  /reminder/id/{id}
```

---

## leadRating / leadSource

CRM lead qualification reference data:

```
GET  /leadRating
GET  /leadRating/count
GET  /leadRating/id/{id}

GET  /leadSource
GET  /leadSource/count
GET  /leadSource/id/{id}
```

---

## opportunityTopic / opportunityWinLossReason / customerLeadLossReason / customerTopic

CRM reference tables — all follow standard 3-path pattern.

---

## attendance

Employee time clock (log on/off).

```
GET  /attendance
GET  /attendance/count
GET  /attendance/id/{id}
GET  /attendance/currentAttendance
POST /attendance/logOn
POST /attendance/logOff
```

---

## productionOrder

Manufacturing orders.

```
GET  /productionOrder
GET  /productionOrder/count
GET  /productionOrder/id/{id}
POST /productionOrder/fastProductionBooking
POST /productionOrder/id/{id}/createPickingList
POST /productionOrder/id/{id}/createPickingOrder
GET  /productionOrder/id/{id}/downloadLatestProductionOrderPdf
```

Key filterable properties:
- `status`, `articleId`, `warehouseId`
- `plannedStartDate`, `plannedEndDate`, `createdDate`

---

## productionWorkSchedule / productionWorkScheduleAssignment

```
GET  /productionWorkSchedule
GET  /productionWorkSchedule/count
GET  /productionWorkSchedule/id/{id}

GET  /productionWorkScheduleAssignment
GET  /productionWorkScheduleAssignment/count
GET  /productionWorkScheduleAssignment/id/{id}
```
