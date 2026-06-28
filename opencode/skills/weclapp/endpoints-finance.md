# Weclapp Endpoints: Finance & Accounting

## accountingTransaction

Journal entries / postings.

```
GET  /accountingTransaction
GET  /accountingTransaction/count
GET  /accountingTransaction/id/{id}
POST /accountingTransaction/batchBooking
```

Key filterable properties:
- `ledgerAccountId`, `createdDate`, `postingDate`
- `amount`, `currencyId`

---

## bankAccount / bankTransaction

```
GET  /bankAccount
GET  /bankAccount/count
GET  /bankAccount/id/{id}

GET  /bankTransaction
GET  /bankTransaction/count
GET  /bankTransaction/id/{id}
```

Key filterable properties for bankTransaction:
- `bankAccountId`, `transactionDate`, `amount`
- `status` — enum: `OPEN`, `ASSIGNED`, `CLEARED`

---

## cashAccount / cashAccountSheet / cashAccountTransaction

Cash register management.

```
GET  /cashAccount
GET  /cashAccount/count
GET  /cashAccount/id/{id}

GET  /cashAccountSheet
GET  /cashAccountSheet/count
GET  /cashAccountSheet/id/{id}

GET  /cashAccountTransaction
GET  /cashAccountTransaction/count
GET  /cashAccountTransaction/id/{id}
```

---

## ledgerAccount

Chart of accounts.

```
GET  /ledgerAccount
GET  /ledgerAccount/count
GET  /ledgerAccount/id/{id}
```

Key filterable properties:
- `accountNumber`, `name`, `type`
- `active`

---

## paymentMethod / paymentRun / paymentRunItem

```
GET  /paymentMethod
GET  /paymentMethod/count
GET  /paymentMethod/id/{id}

GET  /paymentRun
GET  /paymentRun/count
GET  /paymentRun/id/{id}

GET  /paymentRunItem
GET  /paymentRunItem/count
GET  /paymentRunItem/id/{id}
```

---

## tax / taxDeterminationRule

```
GET  /tax
GET  /tax/count
GET  /tax/id/{id}
GET  /tax/findSalesTax          (query params: salesChannelId, articleId, customerId, ...)
GET  /tax/findPurchaseTax
POST /tax/configureSalesTaxes
POST /tax/configurePurchaseTaxes
POST /tax/resetSystemTaxes
```

---

## termOfPayment

Payment terms.

```
GET  /termOfPayment
GET  /termOfPayment/count
GET  /termOfPayment/id/{id}
```

---

## financialYear

```
GET  /financialYear
GET  /financialYear/count
GET  /financialYear/id/{id}
POST /financialYear/id/{id}/generatePeriods
```

---

## numberRange / numberRangeValue

Document number sequences.

```
GET  /numberRange
GET  /numberRange/count
GET  /numberRange/id/{id}
GET  /numberRange/missingNumberRanges

GET  /numberRangeValue
GET  /numberRangeValue/count
GET  /numberRangeValue/id/{id}
```

---

## rebate

```
GET  /rebate
GET  /rebate/count
GET  /rebate/id/{id}
```

---

## personalAccountingCode

Debtor/creditor account codes.

```
GET  /personalAccountingCode
GET  /personalAccountingCode/count
GET  /personalAccountingCode/id/{id}
```

---

## articleAccountingCode

Article-level accounting assignments.

```
GET  /articleAccountingCode
GET  /articleAccountingCode/count
GET  /articleAccountingCode/id/{id}
```

---

## sepaDirectDebitMandate

SEPA direct debit authorisations.

```
GET  /sepaDirectDebitMandate
GET  /sepaDirectDebitMandate/count
GET  /sepaDirectDebitMandate/id/{id}
```

---

## costCenter / costCenterGroup / costType

Cost accounting.

```
GET  /costCenter
GET  /costCenter/count
GET  /costCenter/id/{id}

GET  /costCenterGroup
GET  /costCenterGroup/count
GET  /costCenterGroup/id/{id}

GET  /costType
GET  /costType/count
GET  /costType/id/{id}
```

---

## currency

```
GET  /currency
GET  /currency/count
GET  /currency/id/{id}
GET  /currency/companyCurrency
```

---

## priceCalculationParameter

```
GET  /priceCalculationParameter
GET  /priceCalculationParameter/count
GET  /priceCalculationParameter/id/{id}
```
