# Weclapp Endpoints: Parties (Customers, Suppliers, Contacts)

## party

The `party` resource is the base entity for all people and organisations in Weclapp.
Customers, suppliers, and contacts are all specialisations of party.

```
GET  /party
GET  /party/count
GET  /party/id/{id}
POST /party/id/{id}/createPublicPage
POST /party/id/{id}/uploadImage
GET  /party/id/{id}/downloadImage
```

Key filterable properties:
- `partyType` — enum: `PERSON`, `ORGANIZATION`
- `name`, `company`, `firstName`, `lastName`
- `customerNumber`, `supplierNumber`
- `salesChannel`, `currencyId`, `languageId`
- `responsibleUserId`
- `active`, `createdDate`, `lastModifiedDate`
- `email`, `phone`

Filter examples:
```
/party?filter=partyType = "ORGANIZATION" and active = true
/party?filter=lower(company) ~ '%sport%'
/party?filter=customerNumber in ["10001", "10002", "10003"]
/party?filter=(not contacts.firstName null) and lastModifiedDate >= "2024-01-01T00:00:00Z"
/party?filter=lower(contacts.firstName + " " + contacts.lastName) = "john smith"
```

The `party` resource covers all party types. Use `customer` for customer-specific fields.

---

## customer

The `customer` endpoint is `party` filtered to customer records — all the same paths as `party`:

```
GET  /customer
GET  /customer/count
GET  /customer/id/{id}
```

Note: There is no separate `/customer` resource in the Weclapp API — customers are queried
via `/party` with `filter=customerNumber notnull` or by using customer-specific properties.

If your weclapp instance has a distinct `/customer` endpoint, it behaves identically to `/party`
but pre-filtered to customer records.

Key customer-specific filterable properties:
- `customerNumber`
- `customerSalesChannel` / `salesChannel`
- `customerCategory`
- `customerRating`
- `responsibleUserId`
- `defaultShippingAddressId`

---

## partyRating / customerCategory / companySize / sector / legalForm

Party reference/classification tables:

```
GET  /partyRating
GET  /partyRating/count
GET  /partyRating/id/{id}

GET  /customerCategory
GET  /customerCategory/count
GET  /customerCategory/id/{id}

GET  /companySize
GET  /companySize/count
GET  /companySize/id/{id}

GET  /sector
GET  /sector/count
GET  /sector/id/{id}

GET  /legalForm
GET  /legalForm/count
GET  /legalForm/id/{id}
```

---

## user

Weclapp system users (employees/staff accounts).

```
GET  /user
GET  /user/count
GET  /user/id/{id}
GET  /user/currentUser
POST /user/id/{id}/invite
POST /user/id/{id}/softDelete
POST /user/id/{id}/deleteMfaDevice
GET  /user/id/{id}/readMfaDevices
GET  /user/id/{id}/userImage
GET  /user/id/{id}/userImageThumbnail
```

Key filterable properties:
- `active`, `email`, `firstName`, `lastName`
- `userRoleId`

---

## userRole

```
GET  /userRole
GET  /userRole/count
GET  /userRole/id/{id}
POST /userRole/disableUserRolesDuringTrial
POST /userRole/enableUserRolesDuringTrial
```

---

## personDepartment / personRole / title

Contact person reference tables:

```
GET  /personDepartment
GET  /personDepartment/count
GET  /personDepartment/id/{id}

GET  /personRole
GET  /personRole/count
GET  /personRole/id/{id}

GET  /title
GET  /title/count
GET  /title/id/{id}
```

---

## archivedEmail

Emails linked to party/order records.

```
GET  /archivedEmail
GET  /archivedEmail/count
GET  /archivedEmail/id/{id}
POST /archivedEmail/id/{id}/removeReference
```

Key filterable properties:
- `partyId`, `salesOrderId`, `ticketId`
- `subject`, `fromAddress`, `createdDate`
