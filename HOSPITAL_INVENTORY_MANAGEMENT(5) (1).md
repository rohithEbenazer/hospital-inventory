# Hospital Inventory Management System — Production Specification

**Project:** SCEC Hospital Management System  
**Module:** Hospital Inventory & Supply Chain Management  
**Stack:** MERN (React + Node.js + Express + MongoDB)  
**Document Version:** 1.0  
**Status:** Production-oriented functional and technical specification

---

## 1. Purpose

The Hospital Inventory Management module manages the complete lifecycle of hospital materials:

```text
Supplier
  ↓
Purchase Request
  ↓
RFQ / Quotation
  ↓
Purchase Order
  ↓
Goods Receipt / GRN
  ↓
Quality Check
  ↓
Batch / Lot / Serial Registration
  ↓
Central Store
  ↓
Department / Sub-store
  ↓
Indent / Approval
  ↓
Issue / Transfer
  ↓
Patient / Procedure / Pharmacy / Department Consumption
  ↓
Return / Adjustment / Write-off
  ↓
Inventory Ledger
  ↓
Reports / Audit
```

The system must support medicines, medical consumables, laboratory supplies, surgical supplies, implants, equipment, linen, housekeeping materials, maintenance items, IT assets, blood-bank supplies, medical gases and general hospital stock.

---

# 2. Product Goals

## 2.1 Primary goals

- Real-time stock visibility
- Multi-store and multi-location inventory
- Batch, lot, serial-number and expiry tracking
- FEFO/FIFO stock issue rules
- Purchase and supplier management
- Department indent and approval workflow
- Goods Receipt Note (GRN)
- Stock transfer
- Stock issue and return
- Pharmacy integration
- Patient/procedure consumption tracking
- Low-stock and reorder alerts
- Expiry and recall management
- Physical stock count and reconciliation
- Inventory valuation
- Complete audit trail
- Role-based access control
- Barcode/QR scanning
- Dashboard and analytics

## 2.2 Non-goals

This module does not replace:

- Full accounting software
- Full clinical EMR
- Laboratory information system
- Radiology information system
- Biomedical device firmware
- Blood-bank regulatory software

Those systems may integrate through APIs.

---

# 3. Inventory Domains

```text
Inventory
├── Medicines
├── Medical Consumables
├── Surgical Supplies
├── Laboratory Supplies
├── Radiology Supplies
├── Implants
├── Medical Equipment
├── Spare Parts
├── Medical Gases
├── Blood Bank Supplies
├── Linen
├── Housekeeping
├── Dietary Supplies
├── IT Equipment
└── General Supplies
```

---

# 4. Inventory Classification

## 4.1 Item types

```text
MEDICINE
CONSUMABLE
SURGICAL
LAB_REAGENT
IMPLANT
EQUIPMENT
SPARE_PART
MEDICAL_GAS
BLOOD_SUPPLY
LINEN
HOUSEKEEPING
DIETARY
IT_ASSET
GENERAL
```

## 4.2 Tracking types

Each product must define one or more tracking modes:

```text
NONE
BATCH
LOT
SERIAL
BATCH_AND_EXPIRY
SERIAL_AND_WARRANTY
```

## 4.3 Stock statuses

```text
AVAILABLE
RESERVED
ALLOCATED
IN_TRANSIT
QUARANTINED
DAMAGED
EXPIRED
RECALLED
RETURNED
BLOCKED
WRITTEN_OFF
```

---

# 5. User Roles

## 5.1 System roles

| Role | Main responsibility |
|---|---|
| SUPER_ADMIN | Complete system administration |
| HOSPITAL_ADMIN | Hospital-wide configuration |
| INVENTORY_ADMIN | Inventory configuration and control |
| STORE_MANAGER | Store operations and approvals |
| STORE_KEEPER | Receiving, issuing, transfer and counting |
| PURCHASE_MANAGER | Procurement and supplier management |
| PROCUREMENT_OFFICER | RFQ, quotations and purchase orders |
| PHARMACY_MANAGER | Pharmacy inventory |
| PHARMACIST | Medicine receiving, dispensing and returns |
| DEPARTMENT_MANAGER | Department stock and indents |
| NURSE | Department requests and consumption |
| DOCTOR | Prescription and item requests |
| LAB_MANAGER | Laboratory inventory |
| OT_MANAGER | OT/surgical inventory |
| BIOMEDICAL_ENGINEER | Equipment and maintenance inventory |
| ACCOUNTS_MANAGER | Purchase invoice and financial verification |
| AUDITOR | Read-only audit and compliance access |
| REPORT_VIEWER | Read-only reports |

---

# 6. Permission Model

Use RBAC with optional resource-level permissions.

## 6.1 Permission format

```text
inventory.products.view
inventory.products.create
inventory.products.update
inventory.products.delete

inventory.stock.view
inventory.stock.issue
inventory.stock.receive
inventory.stock.adjust

inventory.indents.create
inventory.indents.approve
inventory.indents.reject

inventory.transfers.create
inventory.transfers.approve
inventory.transfers.receive

inventory.purchase.view
inventory.purchase.create
inventory.purchase.approve

inventory.grn.create
inventory.grn.approve

inventory.batches.view
inventory.batches.manage

inventory.expiry.view
inventory.expiry.manage

inventory.reports.view
inventory.reports.export

inventory.audit.view
```

## 6.2 Permission principles

- Deny by default
- Every write action requires authentication
- Approval actions require separate permission
- Sensitive operations require elevated permission
- Deletion should normally be soft deletion
- Financial changes require audit logging
- Stock adjustments above configurable limits require manager approval
- Controlled medicine transactions require enhanced audit logging

---

# 7. Application Pages

## 7.1 Main navigation

```text
Dashboard
Inventory
├── Products
├── Categories
├── Brands
├── Units
├── Stock Overview
├── Stock Ledger
├── Batches
├── Serial Numbers
├── Expiry
├── Low Stock
├── Stock Count
├── Adjustments
├── Write-offs
└── Recalls

Stores
├── Warehouses
├── Locations
├── Department Stores
├── Stock Transfers
└── Store Configuration

Procurement
├── Purchase Requests
├── RFQs
├── Quotations
├── Purchase Orders
├── Goods Receipts
├── Purchase Returns
└── Supplier Contracts

Suppliers
├── Suppliers
├── Supplier Products
├── Supplier Ratings
└── Supplier Performance

Department Requests
├── Indents
├── Pending Approvals
├── Issue Requests
└── Department Consumption

Pharmacy
├── Pharmacy Stock
├── Dispensing
├── Medicine Returns
├── Near Expiry
└── Controlled Drugs

Medical Assets
├── Equipment
├── Assignments
├── Maintenance
├── Calibration
├── Warranty
└── Disposal

Reports
├── Inventory
├── Procurement
├── Consumption
├── Expiry
├── Supplier
├── Financial
└── Audit

Administration
├── Users
├── Roles
├── Permissions
├── Approval Rules
├── Inventory Settings
└── Audit Logs
```

---

# 8. Dashboard Specification

## 8.1 Executive inventory dashboard

KPI cards:

```text
Total Stock Value
Available Stock
Reserved Stock
Low Stock Items
Out of Stock
Near Expiry
Expired
Pending Indents
Pending Purchase Orders
Pending GRNs
```

## 8.2 Charts

- Stock value by category
- Stock value by store
- Purchase trend
- Consumption trend
- Expiry trend
- Fast-moving products
- Slow-moving products
- Non-moving stock
- Department consumption
- Supplier purchase value

## 8.3 Alerts

```text
Critical:
- Expired medicines
- Recalled batches
- Out-of-stock critical items

Warning:
- Low stock
- Near expiry
- Pending GRN
- Pending approval
- Overdue purchase order

Information:
- Upcoming contract expiry
- Warranty expiry
- Scheduled stock count
```

---

# 9. Product Master

## 9.1 Product fields

```text
_id
hospitalId
sku
barcode
name
genericName
shortName
description
itemType
categoryId
subcategoryId
brandId
manufacturerId
unitId
packSize
purchaseUnit
issueUnit
conversionFactor
hsnCode
taxCode
taxRate
trackingType
requiresExpiry
requiresBatch
requiresSerial
requiresTemperature
minStock
maxStock
reorderPoint
reorderQuantity
safetyStock
leadTimeDays
storageCondition
controlledItem
criticalItem
isActive
createdBy
updatedBy
createdAt
updatedAt
```

## 9.2 Product rules

- SKU must be unique per hospital
- Barcode must be unique when provided
- Product cannot be hard-deleted after transactions exist
- Unit conversion must be validated
- Controlled items require special permissions
- Medicines must support manufacturer, batch and expiry data

---

# 10. Category Management

Fields:

```text
_id
hospitalId
name
code
parentId
description
itemType
isActive
```

Support hierarchical categories:

```text
Medicines
├── Antibiotics
├── Analgesics
├── Antihypertensives
└── Emergency Drugs

Consumables
├── Syringes
├── Gloves
├── IV Sets
└── Catheters
```

---

# 11. Unit of Measurement

Examples:

```text
Piece
Box
Pack
Bottle
Vial
Ampoule
Tablet
Capsule
Tube
Kg
Gram
Litre
Millilitre
Pair
Set
```

Support conversions:

```text
1 Box = 100 Gloves
1 Carton = 20 Boxes
1 Box = 10 Vials
```

---

# 12. Warehouse and Store Management

## 12.1 Warehouse

Fields:

```text
_id
hospitalId
code
name
type
departmentId
address
managerId
temperatureRange
isActive
```

Types:

```text
CENTRAL_STORE
PHARMACY
ICU_STORE
OT_STORE
WARD_STORE
LAB_STORE
RADIOLOGY_STORE
EMERGENCY_STORE
MAINTENANCE_STORE
LINEN_STORE
HOUSEKEEPING_STORE
IT_STORE
```

## 12.2 Locations

```text
Warehouse
 └── Zone
      └── Rack
           └── Shelf
                └── Bin
```

Example:

```text
CENTRAL-01 / A / R03 / S02 / B05
```

---

# 13. Inventory Balance

Inventory must maintain a current balance per:

```text
hospital
product
warehouse
location
batch
serialNumber
```

Fields:

```text
_id
hospitalId
productId
warehouseId
locationId
batchId
serialNumberId
availableQty
reservedQty
allocatedQty
inTransitQty
damagedQty
quarantinedQty
expiredQty
averageCost
lastCost
stockValue
updatedAt
```

Do not calculate all stock by trusting a single editable quantity field. The transaction ledger is the source of truth.

---

# 14. Inventory Transaction Ledger

Every stock movement creates an immutable transaction.

Fields:

```text
_id
transactionNumber
hospitalId
productId
warehouseId
locationId
batchId
serialNumberId
transactionType
referenceType
referenceId
quantity
unitCost
totalCost
balanceAfter
reason
performedBy
approvedBy
timestamp
metadata
```

Transaction types:

```text
OPENING_BALANCE
PURCHASE_RECEIPT
ISSUE
TRANSFER_OUT
TRANSFER_IN
SALES_RETURN
PURCHASE_RETURN
PATIENT_CONSUMPTION
PHARMACY_DISPENSE
ADJUSTMENT_IN
ADJUSTMENT_OUT
DAMAGE
EXPIRY
WRITE_OFF
RECALL
STOCK_COUNT
```

Ledger records should not be edited. Corrections create reversal transactions.

---

# 15. Batch Management

Fields:

```text
_id
hospitalId
productId
batchNumber
lotNumber
manufacturerId
manufactureDate
expiryDate
receivedDate
supplierId
purchaseOrderId
grnId
quantityReceived
currentQuantity
unitCost
mrp
storageCondition
temperatureRange
qualityStatus
recallStatus
status
```

Quality status:

```text
PENDING
APPROVED
QUARANTINED
REJECTED
```

Recall status:

```text
NORMAL
RECALLED
PARTIALLY_RECALLED
```

---

# 16. FEFO Engine

For products requiring expiry tracking:

```text
1. Ignore expired stock
2. Ignore quarantined/recalled stock
3. Select earliest valid expiry
4. Reserve from earliest expiry
5. Continue to next batch when required
6. Prevent issue beyond available quantity
```

Example:

```text
Batch A → Expiry: 2027-05 → 100 units
Batch B → Expiry: 2026-11 → 200 units
Batch C → Expiry: 2028-01 → 300 units

Request: 150

Issue:
Batch B → 150
```

---

# 17. Serial Number Management

Required for equipment and individually tracked assets.

Fields:

```text
_id
hospitalId
productId
serialNumber
batchId
status
warehouseId
locationId
assignedDepartmentId
assignedUserId
patientId
purchaseOrderId
warrantyStart
warrantyEnd
amcStart
amcEnd
lastServiceDate
nextServiceDate
```

Statuses:

```text
AVAILABLE
ASSIGNED
IN_USE
UNDER_REPAIR
UNDER_CALIBRATION
LOST
DAMAGED
DISPOSED
```

---

# 18. Procurement Workflow

```text
Department Request
        ↓
Purchase Request
        ↓
Approval
        ↓
RFQ
        ↓
Supplier Quotations
        ↓
Quotation Comparison
        ↓
Supplier Selection
        ↓
Purchase Order
        ↓
Supplier Delivery
        ↓
GRN
        ↓
Quality Check
        ↓
Inventory Update
        ↓
Invoice Verification
```

---

# 19. Purchase Request

Fields:

```text
_id
requestNumber
hospitalId
requestingDepartmentId
requestedBy
items[]
priority
reason
requiredByDate
status
approvedBy
approvedAt
createdAt
```

Statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
CONVERTED_TO_RFQ
CONVERTED_TO_PO
CANCELLED
```

---

# 20. RFQ

Fields:

```text
_id
rfqNumber
supplierIds[]
items[]
quotationDeadline
terms
status
createdBy
```

Workflow:

```text
Create RFQ
 ↓
Send to Suppliers
 ↓
Receive Quotations
 ↓
Compare
 ↓
Select Supplier
```

---

# 21. Supplier Quotation

Fields:

```text
_id
rfqId
supplierId
items[]
subtotal
tax
discount
shipping
grandTotal
deliveryDays
paymentTerms
validUntil
attachments[]
status
```

---

# 22. Purchase Order

Fields:

```text
_id
poNumber
hospitalId
supplierId
warehouseId
items[]
subtotal
discount
tax
shipping
grandTotal
currency
paymentTerms
deliveryTerms
expectedDeliveryDate
status
approvedBy
approvedAt
createdBy
```

Statuses:

```text
DRAFT
PENDING_APPROVAL
APPROVED
SENT
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
CLOSED
```

---

# 23. Goods Receipt Note (GRN)

## Workflow

```text
PO
 ↓
Delivery
 ↓
Physical Verification
 ↓
Quantity Verification
 ↓
Batch Verification
 ↓
Expiry Verification
 ↓
Quality Inspection
 ↓
GRN Approval
 ↓
Inventory Posting
```

Fields:

```text
_id
grnNumber
poId
supplierId
warehouseId
receivedDate
items[]
qualityCheck
receivedBy
verifiedBy
status
attachments[]
```

Statuses:

```text
DRAFT
RECEIVED
UNDER_INSPECTION
APPROVED
PARTIALLY_ACCEPTED
REJECTED
POSTED
```

---

# 24. Department Indent System

## Workflow

```text
Department
 ↓
Create Indent
 ↓
Manager Approval
 ↓
Store Availability Check
 ↓
Pick Items
 ↓
Issue
 ↓
Department Receives
 ↓
Stock Updated
```

Indent fields:

```text
_id
indentNumber
hospitalId
requestingDepartmentId
requesterId
sourceWarehouseId
items[]
priority
reason
requiredDate
status
approvedBy
issuedBy
receivedBy
```

Statuses:

```text
DRAFT
SUBMITTED
APPROVED
PARTIALLY_APPROVED
REJECTED
PICKING
PARTIALLY_ISSUED
ISSUED
RECEIVED
CANCELLED
```

---

# 25. Stock Issue

An issue must contain:

```text
issueNumber
sourceWarehouse
destinationDepartment
items
batchSelections
quantity
purpose
patientId (optional)
encounterId (optional)
procedureId (optional)
issuedBy
receivedBy
timestamp
```

For patient-linked consumption:

```text
Patient
 ↓
Encounter
 ↓
Procedure
 ↓
Inventory Issue
 ↓
Patient Consumption
```

---

# 26. Stock Transfer

Workflow:

```text
Warehouse A
 ↓
Transfer Request
 ↓
Approval
 ↓
Pick
 ↓
Transfer In Transit
 ↓
Warehouse B Receives
 ↓
Transfer Completed
```

Transfer statuses:

```text
DRAFT
REQUESTED
APPROVED
PICKED
IN_TRANSIT
RECEIVED
PARTIALLY_RECEIVED
REJECTED
CANCELLED
```

Stock must not be duplicated during transfer.

---

# 27. Returns

## 27.1 Department return

```text
Department
 ↓
Return Request
 ↓
Store Inspection
 ↓
Accept / Reject
 ↓
Stock Update
```

## 27.2 Purchase return

```text
Hospital
 ↓
Return to Supplier
 ↓
Supplier Confirmation
 ↓
Inventory Deduction
 ↓
Credit Note
```

Return reasons:

```text
DAMAGED
EXCESS
WRONG_ITEM
NEAR_EXPIRY
EXPIRED
RECALL
QUALITY_ISSUE
OTHER
```

---

# 28. Stock Adjustment

Adjustments require:

```text
Product
Location
Current Quantity
Actual Quantity
Variance
Reason
Evidence
Requested By
Approved By
```

Reasons:

```text
COUNT_VARIANCE
DAMAGE
LOSS
DATA_ERROR
THEFT
EXPIRY
OTHER
```

Large adjustments must trigger approval.

---

# 29. Stock Count

Support:

```text
FULL_COUNT
CYCLE_COUNT
RANDOM_COUNT
CATEGORY_COUNT
LOCATION_COUNT
```

Workflow:

```text
Create Count Session
 ↓
Freeze/Lock Scope
 ↓
Count Physically
 ↓
Enter/Scan Quantity
 ↓
Compare System vs Physical
 ↓
Variance Review
 ↓
Approval
 ↓
Adjustment
 ↓
Close Count
```

---

# 30. Expiry Management

Dashboard:

```text
Expired
Expiring within 7 days
Expiring within 30 days
Expiring within 60 days
Expiring within 90 days
```

Actions:

```text
Quarantine
Return
Transfer
Issue First
Write Off
Dispose
Recall
```

Notifications:

```text
90 days
60 days
30 days
14 days
7 days
1 day
```

Thresholds must be configurable.

---

# 31. Recall Management

Recall workflow:

```text
Recall Notice
 ↓
Identify Product
 ↓
Identify Batches
 ↓
Locate Stock
 ↓
Block Stock
 ↓
Notify Stores
 ↓
Notify Departments
 ↓
Trace Patient/Procedure Usage where applicable
 ↓
Return/Dispose
 ↓
Close Recall
```

Recall fields:

```text
recallNumber
productId
batchIds[]
reason
source
severity
affectedQuantity
affectedLocations[]
status
initiatedBy
closedBy
```

---

# 32. Pharmacy Integration

```text
Doctor Prescription
 ↓
Pharmacy
 ↓
Stock Availability
 ↓
FEFO Reservation
 ↓
Dispensing
 ↓
Inventory Deduction
 ↓
Billing
```

Pharmacy inventory should support:

- Prescription-linked dispensing
- Batch selection
- Expiry validation
- Substitute availability
- Partial dispensing
- Returns
- Controlled medicines
- Daily stock reconciliation

---

# 33. Controlled Medicine Management

Extra controls:

- Authorized roles only
- Patient linkage
- Prescription linkage
- Quantity limits
- Witness/verification when required
- Separate ledger
- No silent edits
- Mandatory reason for correction
- Manager review
- Periodic reconciliation

---

# 34. Patient Consumption

Optional but strongly recommended.

Fields:

```text
patientId
encounterId
admissionId
procedureId
departmentId
productId
batchId
quantity
unitCost
consumedBy
consumedAt
```

Use cases:

```text
Surgery
ICU
Emergency
Ward
Procedure Room
Dialysis
Laboratory
```

---

# 35. Medical Asset Management

Equipment fields:

```text
assetId
productId
serialNumber
manufacturer
model
purchaseDate
purchaseCost
supplierId
warrantyStart
warrantyEnd
amcStart
amcEnd
departmentId
locationId
assignedUserId
status
condition
lastMaintenanceDate
nextMaintenanceDate
lastCalibrationDate
nextCalibrationDate
```

Equipment lifecycle:

```text
Purchase
 ↓
Receive
 ↓
Asset Registration
 ↓
Installation
 ↓
Assignment
 ↓
Maintenance
 ↓
Calibration
 ↓
Repair
 ↓
Transfer
 ↓
Retirement
 ↓
Disposal
```

---

# 36. Biomedical Maintenance

Support:

- Preventive maintenance
- Corrective maintenance
- Breakdown tickets
- Calibration
- AMC
- Warranty
- Spare parts
- Service vendors
- Maintenance history
- Service reports

---

# 37. Medical Gas Inventory

Support:

```text
Gas Type
Cylinder ID
Serial Number
Capacity
Current Status
Pressure
Supplier
Location
Filled/Empty
Last Refill
Next Inspection
```

Statuses:

```text
FULL
PARTIAL
EMPTY
IN_USE
UNDER_INSPECTION
DAMAGED
```

---

# 38. Blood Bank Integration

If implemented within the hospital platform:

```text
Blood Unit
├── Unit ID
├── Blood Group
├── Component
├── Collection Date
├── Expiry Date
├── Storage Location
├── Status
└── Compatibility/Issue Records
```

The blood bank should be treated as a controlled subsystem with appropriate clinical and regulatory validation.

---

# 39. Inventory Alerts

Alert types:

```text
LOW_STOCK
OUT_OF_STOCK
NEAR_EXPIRY
EXPIRED
RECALLED
PENDING_INDENT
PENDING_APPROVAL
PO_DELAY
GRN_PENDING
STOCK_VARIANCE
EQUIPMENT_WARRANTY_EXPIRY
AMC_EXPIRY
CALIBRATION_DUE
```

Delivery channels:

```text
In-app
Email
SMS
Push notification
```

Notification preferences must be configurable by role.

---

# 40. Reports

## Inventory

- Current stock
- Stock valuation
- Stock ledger
- Stock movement
- Warehouse stock
- Department stock
- Reserved stock
- Damaged stock
- Quarantine stock
- Dead stock

## Consumption

- Daily consumption
- Monthly consumption
- Department consumption
- Patient consumption
- Procedure consumption
- Medicine consumption
- Fast-moving items
- Slow-moving items
- Non-moving items

## Expiry

- Expired items
- Near-expiry items
- Expiry value
- Batch-wise expiry
- Supplier-wise expiry

## Procurement

- Purchase summary
- Supplier-wise purchases
- PO status
- GRN status
- Pending deliveries
- Quotation comparison
- Price history
- Supplier performance

## Financial

- Inventory valuation
- Purchase value
- Consumption value
- Expiry loss
- Damage loss
- Write-off value
- Department-wise consumption cost

---

# 41. Inventory Valuation

Support configurable valuation methods:

```text
WEIGHTED_AVERAGE
FIFO
SPECIFIC_IDENTIFICATION
```

LIFO should only be enabled where appropriate for the organization's accounting policy and jurisdiction.

Every valuation change must be auditable.

---

# 42. Search and Filtering

Global inventory search should support:

```text
Product name
SKU
Barcode
Generic name
Brand
Batch
Lot
Serial number
Supplier
Warehouse
Location
Expiry
Category
Status
```

Filters:

```text
Date range
Department
Store
Category
Supplier
Stock status
Expiry range
Tracking type
Criticality
```

---

# 43. Barcode / QR Workflow

## Receiving

```text
Scan PO
 ↓
Scan Product
 ↓
Scan Batch/Serial
 ↓
Enter Quantity
 ↓
Verify Expiry
 ↓
GRN
```

## Issuing

```text
Scan Indent
 ↓
Scan Product
 ↓
FEFO Suggestion
 ↓
Scan Batch
 ↓
Confirm Quantity
 ↓
Issue
```

## Stock Count

```text
Scan Location
 ↓
Scan Product
 ↓
Scan Batch/Serial
 ↓
Enter Quantity
 ↓
Variance Calculation
```

---

# 44. MongoDB Collections

Recommended collections:

```text
users
roles
permissions
hospitals
departments

products
categories
subcategories
brands
manufacturers
units

warehouses
locations

inventoryBalances
inventoryTransactions
batches
serialNumbers

suppliers
supplierProducts
supplierContracts
supplierRatings

purchaseRequests
rfqs
quotations
purchaseOrders
goodsReceipts
purchaseReturns

indents
stockIssues
stockTransfers
stockReturns
stockAdjustments
stockCounts
stockCountItems

recalls
expiryAlerts

pharmacyDispensing
patientConsumptions

medicalAssets
maintenanceTickets
calibrationRecords

notifications
auditLogs
attachments
settings
```

---

# 45. Important MongoDB Indexes

## Products

```javascript
{ hospitalId: 1, sku: 1 }
{ hospitalId: 1, barcode: 1 }
{ hospitalId: 1, name: 1 }
{ hospitalId: 1, categoryId: 1 }
```

## Inventory balances

```javascript
{
  hospitalId: 1,
  productId: 1,
  warehouseId: 1,
  locationId: 1,
  batchId: 1
}
```

## Batches

```javascript
{ hospitalId: 1, productId: 1, batchNumber: 1 }
{ hospitalId: 1, expiryDate: 1 }
{ hospitalId: 1, status: 1 }
```

## Transactions

```javascript
{ hospitalId: 1, productId: 1, timestamp: -1 }
{ hospitalId: 1, warehouseId: 1, timestamp: -1 }
{ hospitalId: 1, transactionNumber: 1 }
```

---

# 46. REST API Structure

Base URL:

```text
/api/v1
```

Authentication:

```text
Authorization: Bearer <access_token>
```

---

## 46.1 Products

```http
GET    /inventory/products
GET    /inventory/products/:id
POST   /inventory/products
PATCH  /inventory/products/:id
DELETE /inventory/products/:id
GET    /inventory/products/:id/stock
GET    /inventory/products/:id/history
```

---

## 46.2 Categories

```http
GET    /inventory/categories
POST   /inventory/categories
PATCH  /inventory/categories/:id
DELETE /inventory/categories/:id
```

---

## 46.3 Warehouses

```http
GET    /inventory/warehouses
GET    /inventory/warehouses/:id
POST   /inventory/warehouses
PATCH  /inventory/warehouses/:id
DELETE /inventory/warehouses/:id
GET    /inventory/warehouses/:id/stock
```

---

## 46.4 Locations

```http
GET    /inventory/locations
POST   /inventory/locations
PATCH  /inventory/locations/:id
DELETE /inventory/locations/:id
```

---

## 46.5 Stock

```http
GET    /inventory/stock
GET    /inventory/stock/:productId
GET    /inventory/stock/low
GET    /inventory/stock/out-of-stock
GET    /inventory/stock/near-expiry
GET    /inventory/stock/expired
GET    /inventory/stock/ledger
```

---

## 46.6 Batches

```http
GET    /inventory/batches
GET    /inventory/batches/:id
POST   /inventory/batches
PATCH  /inventory/batches/:id
GET    /inventory/batches/expiring
GET    /inventory/batches/:id/history
```

---

## 46.7 Serial Numbers

```http
GET    /inventory/serials
GET    /inventory/serials/:id
POST   /inventory/serials
PATCH  /inventory/serials/:id
GET    /inventory/serials/:id/history
```

---

# 47. Procurement APIs

## Purchase Requests

```http
GET    /procurement/requests
POST   /procurement/requests
GET    /procurement/requests/:id
PATCH  /procurement/requests/:id
POST   /procurement/requests/:id/submit
POST   /procurement/requests/:id/approve
POST   /procurement/requests/:id/reject
```

## RFQ

```http
GET    /procurement/rfqs
POST   /procurement/rfqs
GET    /procurement/rfqs/:id
PATCH  /procurement/rfqs/:id
POST   /procurement/rfqs/:id/send
```

## Quotations

```http
GET    /procurement/quotations
POST   /procurement/quotations
GET    /procurement/quotations/:id
PATCH  /procurement/quotations/:id
POST   /procurement/quotations/:id/select
```

## Purchase Orders

```http
GET    /procurement/purchase-orders
POST   /procurement/purchase-orders
GET    /procurement/purchase-orders/:id
PATCH  /procurement/purchase-orders/:id
POST   /procurement/purchase-orders/:id/submit
POST   /procurement/purchase-orders/:id/approve
POST   /procurement/purchase-orders/:id/cancel
```

## GRN

```http
GET    /procurement/grns
POST   /procurement/grns
GET    /procurement/grns/:id
PATCH  /procurement/grns/:id
POST   /procurement/grns/:id/inspect
POST   /procurement/grns/:id/approve
POST   /procurement/grns/:id/post
```

---

# 48. Department APIs

## Indents

```http
GET    /inventory/indents
POST   /inventory/indents
GET    /inventory/indents/:id
PATCH  /inventory/indents/:id
POST   /inventory/indents/:id/submit
POST   /inventory/indents/:id/approve
POST   /inventory/indents/:id/reject
POST   /inventory/indents/:id/pick
POST   /inventory/indents/:id/issue
POST   /inventory/indents/:id/receive
```

## Transfers

```http
GET    /inventory/transfers
POST   /inventory/transfers
GET    /inventory/transfers/:id
POST   /inventory/transfers/:id/approve
POST   /inventory/transfers/:id/pick
POST   /inventory/transfers/:id/ship
POST   /inventory/transfers/:id/receive
```

---

# 49. Adjustment and Count APIs

```http
GET    /inventory/adjustments
POST   /inventory/adjustments
GET    /inventory/adjustments/:id
POST   /inventory/adjustments/:id/approve
POST   /inventory/adjustments/:id/reject

GET    /inventory/counts
POST   /inventory/counts
GET    /inventory/counts/:id
POST   /inventory/counts/:id/start
POST   /inventory/counts/:id/submit
POST   /inventory/counts/:id/approve
POST   /inventory/counts/:id/close
```

---

# 50. Recall APIs

```http
GET    /inventory/recalls
POST   /inventory/recalls
GET    /inventory/recalls/:id
POST   /inventory/recalls/:id/activate
POST   /inventory/recalls/:id/notify
POST   /inventory/recalls/:id/close
```

---

# 51. Reporting APIs

```http
GET /reports/inventory/summary
GET /reports/inventory/valuation
GET /reports/inventory/ledger
GET /reports/inventory/movement
GET /reports/inventory/expiry
GET /reports/inventory/consumption
GET /reports/inventory/department
GET /reports/procurement/purchases
GET /reports/procurement/suppliers
GET /reports/procurement/pending
GET /reports/inventory/fast-moving
GET /reports/inventory/slow-moving
GET /reports/inventory/non-moving
```

Support:

```text
JSON
CSV
Excel
PDF
```

---

# 52. React Application Structure

Recommended structure:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── store/
│
├── modules/
│   └── inventory/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── modules/procurement/
├── modules/pharmacy/
├── modules/assets/
├── modules/reports/
│
├── components/
│   ├── ui/
│   ├── tables/
│   ├── forms/
│   ├── charts/
│   ├── modals/
│   └── barcode/
│
├── layouts/
├── hooks/
├── services/
├── lib/
└── utils/
```

---

# 53. Inventory React Pages

```text
InventoryDashboardPage
ProductListPage
ProductCreatePage
ProductDetailsPage
ProductEditPage

StockOverviewPage
StockLedgerPage
BatchListPage
BatchDetailsPage
SerialNumberPage

LowStockPage
ExpiryPage
RecallPage

WarehouseListPage
WarehouseDetailsPage
LocationManagementPage

IndentListPage
IndentCreatePage
IndentDetailsPage
IndentApprovalPage

TransferListPage
TransferCreatePage
TransferDetailsPage

StockIssuePage
StockReturnPage
StockAdjustmentPage

StockCountListPage
StockCountCreatePage
StockCountDetailsPage

PurchaseRequestPage
RFQPage
QuotationComparisonPage
PurchaseOrderPage
GRNPage
PurchaseReturnPage

SupplierListPage
SupplierDetailsPage
SupplierPerformancePage

MedicalAssetPage
MaintenancePage
CalibrationPage

InventoryReportsPage
InventorySettingsPage
AuditLogPage
```

---

# 54. React Components

## Dashboard

```text
InventoryKpiCards
StockValueChart
ConsumptionChart
ExpiryChart
LowStockTable
RecentTransactions
PendingApprovals
CriticalAlerts
```

## Product

```text
ProductForm
ProductTable
ProductFilters
ProductDetails
ProductStockSummary
ProductTransactionHistory
BatchTable
SerialTable
```

## Stock

```text
StockTable
StockFilterBar
StockStatusBadge
StockMovementTimeline
BatchSelector
FEFOSelector
StockLedgerTable
```

## Procurement

```text
PurchaseRequestForm
PurchaseOrderForm
QuotationTable
QuotationComparison
GRNForm
GRNItemTable
SupplierSelector
```

## Indent

```text
IndentForm
IndentItemTable
IndentApprovalPanel
StockAvailabilityPanel
PickList
IssueConfirmation
ReceiveConfirmation
```

## Warehouse

```text
WarehouseForm
LocationTree
StockByLocation
TransferForm
TransferTimeline
```

---

# 55. State Management

Recommended:

```text
Redux Toolkit
RTK Query
React Hook Form
Zod
```

Example slices:

```text
authSlice
inventorySlice
warehouseSlice
procurementSlice
supplierSlice
pharmacySlice
assetSlice
notificationSlice
settingsSlice
```

RTK Query endpoints should handle server cache invalidation after mutations.

---

# 56. Form Validation

Use:

```text
React Hook Form
+
Zod
```

Validate:

- Required fields
- Quantity > 0
- Valid expiry date
- Expiry after manufacture date
- Valid batch number
- Valid serial number
- Valid warehouse
- Valid location
- Supplier
- Tax
- Price
- Approval requirements

Never rely only on frontend validation. Repeat all critical validation on the server.

---

# 57. Backend Structure

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   │   ├── inventory/
│   │   ├── procurement/
│   │   ├── pharmacy/
│   │   └── assets/
│   │
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── middleware/
│   ├── policies/
│   ├── jobs/
│   ├── events/
│   ├── utils/
│   └── app.js
```

Use a service layer for stock-changing business logic.

---

# 58. Critical Backend Services

```text
InventoryService
StockLedgerService
FEFOService
BatchService
SerialNumberService

ProcurementService
PurchaseOrderService
GRNService

IndentService
StockIssueService
StockTransferService
StockReturnService
StockAdjustmentService
StockCountService

ExpiryService
RecallService
ReorderService

InventoryValuationService
NotificationService
AuditService
ReportService
```

---

# 59. Stock Transaction Safety

Stock-changing operations must be atomic.

Example:

```text
BEGIN TRANSACTION
  Validate stock
  Lock/validate relevant inventory balance
  Create inventory transaction
  Update inventory balance
  Create audit log
COMMIT
```

If any step fails:

```text
ROLLBACK
```

Use MongoDB transactions for multi-document operations where supported by the deployment architecture.

Prevent:

- Negative stock unless explicitly configured
- Duplicate transaction posting
- Duplicate GRN posting
- Duplicate transfer receiving
- Double dispensing
- Race-condition overselling/over-issuing

Use idempotency keys for important mutation endpoints.

---

# 60. Audit Logging

Every important operation must record:

```text
userId
role
hospitalId
action
resource
resourceId
oldValues
newValues
ipAddress
userAgent
timestamp
reason
requestId
```

Examples:

```text
PRODUCT_CREATED
PRODUCT_UPDATED
STOCK_RECEIVED
STOCK_ISSUED
STOCK_TRANSFERRED
STOCK_ADJUSTED
BATCH_BLOCKED
RECALL_CREATED
PO_APPROVED
GRN_POSTED
INDENT_APPROVED
```

Audit logs should be append-only.

---

# 61. Security

Implement:

- JWT access tokens
- Refresh token rotation
- Password hashing with Argon2id or bcrypt
- RBAC
- Resource-level authorization
- Rate limiting
- Request validation
- Helmet
- CORS policy
- Secure cookies where appropriate
- Encryption in transit
- Secrets in environment variables
- Audit logging
- Session/device management
- File upload validation
- Malware scanning for uploaded documents where available

Never store passwords, tokens or sensitive credentials in logs.

---

# 62. Multi-Tenant Hospital Design

If the application supports multiple hospitals:

```text
hospitalId
```

must be present on every tenant-owned document.

Every query must be scoped by authenticated tenant.

Example:

```javascript
{
  hospitalId: req.user.hospitalId,
  _id: req.params.id
}
```

Never trust a client-provided `hospitalId`.

---

# 63. Approval Engine

Make approval rules configurable.

Example:

```text
Purchase < ₹10,000
    → Store Manager

₹10,000–₹1,00,000
    → Purchase Manager

> ₹1,00,000
    → Hospital Admin
```

Other approval rules:

- Stock adjustment
- Controlled medicines
- Write-off
- Asset disposal
- High-value equipment
- Emergency purchase

---

# 64. Reorder Engine

For every product:

```text
Average Daily Consumption
Lead Time
Safety Stock
Current Available Stock
Reserved Stock
Incoming Stock
```

Possible calculation:

```text
Reorder Point =
Average Daily Consumption × Lead Time
+ Safety Stock
```

Recommended order:

```text
Target Stock
- Available Stock
- Confirmed Incoming Stock
```

The formula must be configurable by hospital policy.

---

# 65. Demand Forecasting

Future enhancement:

```text
Historical Consumption
        ↓
Seasonality
        ↓
Department Demand
        ↓
Lead Time
        ↓
Forecast
        ↓
Recommended Purchase
```

Possible algorithms:

- Moving average
- Weighted moving average
- Exponential smoothing
- Seasonal forecasting
- ML forecasting

Forecasts must be treated as recommendations, not automatic clinical decisions.

---

# 66. Notifications

Notification document:

```text
_id
hospitalId
recipientId
type
title
message
priority
resourceType
resourceId
readAt
createdAt
```

Support:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 67. File Attachments

Documents may include:

- Supplier invoices
- Purchase quotations
- Purchase orders
- GRNs
- Delivery challans
- Quality certificates
- Drug licenses
- Contracts
- Maintenance reports
- Calibration certificates
- Recall notices

Store files outside MongoDB where appropriate and store metadata/reference in MongoDB.

---

# 68. API Response Standard

Success:

```json
{
  "success": true,
  "message": "Stock issued successfully",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Insufficient stock",
  "code": "INSUFFICIENT_STOCK",
  "errors": []
}
```

Pagination:

```text
?page=1&limit=25&sort=-createdAt
```

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 250,
    "totalPages": 10
  }
}
```

---

# 69. Error Codes

Examples:

```text
PRODUCT_NOT_FOUND
BATCH_NOT_FOUND
SERIAL_NOT_FOUND
INSUFFICIENT_STOCK
INVALID_BATCH
EXPIRED_BATCH
RECALLED_BATCH
QUARANTINED_BATCH
DUPLICATE_TRANSACTION
TRANSFER_ALREADY_RECEIVED
GRN_ALREADY_POSTED
PO_ALREADY_CLOSED
INDENT_ALREADY_ISSUED
UNAUTHORIZED_ACTION
APPROVAL_REQUIRED
INVALID_LOCATION
INVALID_UNIT_CONVERSION
```

---

# 70. Performance Requirements

Target:

- Common API response < 300 ms under normal load
- Paginated lists
- Database indexes for high-volume queries
- Avoid N+1 queries
- Server-side filtering and sorting
- Aggregation pipelines for reports
- Background jobs for heavy reports
- Redis caching where useful
- Queue-based notifications
- Lazy-loaded React modules
- Virtualized large tables

---

# 71. Background Jobs

Use a queue such as BullMQ when appropriate.

Jobs:

```text
expiryAlertJob
lowStockJob
reorderRecommendationJob
purchaseOrderReminderJob
contractExpiryJob
warrantyExpiryJob
calibrationReminderJob
reportGenerationJob
notificationJob
```

---

# 72. Testing Strategy

## Unit tests

Test:

- FEFO selection
- Reorder calculation
- Unit conversion
- Stock calculations
- Approval rules
- Inventory valuation

## Integration tests

Test:

```text
PO → GRN → Inventory
Indent → Issue → Inventory
Transfer → Receive → Inventory
Return → Inventory
Stock Count → Adjustment
Recall → Batch Blocking
```

## API tests

Every endpoint should test:

- Authentication
- Authorization
- Validation
- Success
- Failure
- Duplicate requests
- Tenant isolation

## E2E

Critical flows:

```text
Create Product
Purchase Product
Receive Product
Create Indent
Issue Stock
Transfer Stock
Dispense Medicine
Return Stock
Perform Stock Count
Handle Expiry
Create Recall
```

---

# 73. Acceptance Criteria

The module is production-ready only when:

- [ ] Products can be created and categorized
- [ ] Multiple warehouses work
- [ ] Multiple locations work
- [ ] Batch tracking works
- [ ] Expiry tracking works
- [ ] Serial tracking works
- [ ] FEFO works
- [ ] Stock ledger is immutable
- [ ] Purchase workflow works
- [ ] GRN works
- [ ] Department indents work
- [ ] Approval workflow works
- [ ] Stock issue works
- [ ] Stock transfer works
- [ ] Returns work
- [ ] Stock adjustment works
- [ ] Stock counting works
- [ ] Recall works
- [ ] Pharmacy integration works
- [ ] Patient consumption can be linked
- [ ] Low-stock alerts work
- [ ] Expiry alerts work
- [ ] Supplier management works
- [ ] Reports work
- [ ] RBAC works
- [ ] Audit logs work
- [ ] Tenant isolation works
- [ ] API validation works
- [ ] Critical mutations are atomic
- [ ] Backup/recovery is configured
- [ ] Security testing is completed
- [ ] Performance testing is completed

---

# 74. Recommended Implementation Phases

## Phase 1 — Foundation

```text
Authentication
RBAC
Hospital
Departments
Product Master
Categories
Units
Warehouses
Locations
```

## Phase 2 — Core Inventory

```text
Inventory Balance
Stock Ledger
Batch
Expiry
Serial Number
Barcode
FEFO
Stock Adjustment
```

## Phase 3 — Procurement

```text
Suppliers
Purchase Request
RFQ
Quotation
Purchase Order
GRN
Purchase Return
```

## Phase 4 — Department Operations

```text
Indents
Approvals
Stock Issue
Stock Transfer
Department Receiving
Returns
```

## Phase 5 — Pharmacy

```text
Medicine Inventory
Prescription Integration
Dispensing
Medicine Returns
Controlled Drugs
```

## Phase 6 — Advanced Hospital Inventory

```text
Patient Consumption
Implants
Blood Bank Integration
Medical Gases
Medical Assets
Maintenance
Calibration
```

## Phase 7 — Analytics

```text
Dashboard
Inventory Valuation
Consumption Analytics
Expiry Analytics
Supplier Analytics
Forecasting
```

## Phase 8 — Production Hardening

```text
Security
Audit
Performance
Testing
Backups
Monitoring
Error Tracking
Disaster Recovery
```

---

# 75. Recommended Final Navigation

```text
🏥 Hospital Inventory
│
├── Dashboard
│
├── Inventory
│   ├── Products
│   ├── Stock
│   ├── Batches
│   ├── Serial Numbers
│   ├── Expiry
│   ├── Recalls
│   ├── Stock Ledger
│   ├── Adjustments
│   └── Stock Counts
│
├── Stores
│   ├── Warehouses
│   ├── Locations
│   ├── Department Stores
│   └── Transfers
│
├── Procurement
│   ├── Purchase Requests
│   ├── RFQs
│   ├── Quotations
│   ├── Purchase Orders
│   ├── GRNs
│   └── Returns
│
├── Suppliers
│   ├── Suppliers
│   ├── Contracts
│   ├── Products
│   └── Performance
│
├── Department Operations
│   ├── Indents
│   ├── Approvals
│   ├── Issues
│   └── Consumption
│
├── Pharmacy
│   ├── Stock
│   ├── Dispensing
│   ├── Returns
│   ├── Near Expiry
│   └── Controlled Drugs
│
├── Medical Assets
│   ├── Equipment
│   ├── Maintenance
│   ├── Calibration
│   ├── Warranty
│   └── Disposal
│
├── Reports
│   ├── Inventory
│   ├── Procurement
│   ├── Consumption
│   ├── Expiry
│   ├── Suppliers
│   └── Financial
│
└── Administration
    ├── Users
    ├── Roles
    ├── Permissions
    ├── Approval Rules
    ├── Settings
    └── Audit Logs
```

---

# 76. Final Architecture Principle

The inventory system should be treated as a **hospital supply-chain platform**, not a basic CRUD module.

The central design is:

```text
                    HOSPITAL
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
      PROCUREMENT                STORES
          │                         │
      Suppliers                 Warehouse
          │                         │
         RFQ                     Location
          │                         │
     Quotations                 Inventory
          │                         │
          PO                    Batch/Serial
          │                         │
         GRN                         │
          └────────────┬────────────┘
                       ↓
                 DEPARTMENT
                       │
                    Indent
                       │
                    Approval
                       │
                  Stock Issue
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Pharmacy        Ward            OT/ICU
        │              │              │
        └──────────────┼──────────────┘
                       ↓
               Patient / Procedure
                       │
                       ↓
                 Consumption
                       │
                       ↓
                Billing / Costing
                       │
                       ↓
                Reports + Audit
```

This architecture gives SCEC a foundation for **multi-store hospital inventory, pharmacy inventory, procurement, department consumption, medical assets, traceability, expiry control, financial reporting and future automation** without having to redesign the core inventory engine later.

## 77. Definition of Done

The module should not be considered complete when the UI pages exist. It is complete when:

```text
UI
 ↓
API
 ↓
Validation
 ↓
Authorization
 ↓
Business Service
 ↓
Atomic Stock Transaction
 ↓
Ledger
 ↓
Audit Log
 ↓
Notification
 ↓
Report
```

works consistently for every inventory-changing operation.


---

# 78. Production-Level Enhancements — Mandatory

This section extends the original specification with additional requirements for a serious hospital production deployment.

## 78.1 Inventory Ledger Must Be Immutable

Inventory quantity must never be changed by directly editing historical transactions.

Use:

```text
Stock Event
    ↓
Validation
    ↓
Immutable Ledger Transaction
    ↓
Atomic Balance Update
    ↓
Audit Event
```

Corrections must create reversal/correction transactions.

Example:

```text
Original Issue: -100
Correction:     +20
Net Effect:     -80
```

Never modify the original `-100` transaction.

---

# 79. Double-Entry-Style Inventory Movement

The inventory engine should represent movement between locations as two linked sides:

```text
Central Store
    ↓ -100
Transfer
    ↓ +100
ICU Store
```

Each movement should contain:

```text
transactionGroupId
sourceWarehouseId
sourceLocationId
destinationWarehouseId
destinationLocationId
quantity
```

This prevents stock from disappearing or being duplicated during transfers.

---

# 80. Inventory Reservation Engine

The system must support reservations for future demand.

Use cases:

- Scheduled surgery
- ICU admission
- Emergency procedure
- Operating theatre
- Pharmacy prescription
- Department request
- Blood/product reservation
- High-value implant

Reservation lifecycle:

```text
REQUEST
  ↓
RESERVE
  ↓
ALLOCATE
  ↓
ISSUE
  ↓
CONSUME
```

Alternative:

```text
RESERVED
   ↓
RELEASED
```

A reservation must reduce available stock without reducing physical stock.

Formula:

```text
Available Stock =
Physical Stock
- Reserved Stock
- Blocked Stock
```

---

# 81. Emergency Inventory Workflow

Hospitals require emergency issue capability.

Workflow:

```text
Emergency Request
       ↓
Emergency Issue
       ↓
Stock Deduction
       ↓
Mandatory Reason
       ↓
Doctor/Nurse/Authorized User
       ↓
Post-Event Approval/Reconciliation
```

Emergency issue should be available only to configured roles.

Every emergency transaction must contain:

```text
emergencyReason
requester
patientId (when applicable)
encounterId (when applicable)
departmentId
issuedBy
approvedLaterBy
```

---

# 82. Critical Inventory Management

Products must support:

```text
criticalItem
criticalityLevel
criticalMinimumStock
criticalReorderPoint
emergencyReserveQty
```

Example:

```text
CRITICAL
├── Emergency medicines
├── Oxygen supplies
├── ICU consumables
├── Resuscitation supplies
└── Essential surgical materials
```

Critical items require faster alert escalation.

---

# 83. ABC + VEN Analysis

Hospital inventory should support both financial and clinical prioritization.

### ABC

```text
A = High annual consumption value
B = Medium annual consumption value
C = Low annual consumption value
```

### VEN

```text
V = Vital
E = Essential
N = Non-essential
```

Combined classification:

```text
             VEN
          V    E    N
ABC A     AV   AE   AN
    B     BV   BE   BN
    C     CV   CE   CN
```

Use this classification for:

- Procurement priority
- Safety stock
- Review frequency
- Stock counting
- Approval levels
- Emergency reserve

---

# 84. Cold-Chain Inventory

For temperature-sensitive inventory, add:

```text
storageCondition
minTemperature
maxTemperature
currentTemperature
temperatureLoggerId
lastTemperatureCheck
```

Examples:

- Vaccines
- Certain medicines
- Blood products
- Laboratory reagents

Workflow:

```text
Receive
 ↓
Temperature Verification
 ↓
Accept / Quarantine
 ↓
Storage
 ↓
Continuous Monitoring
 ↓
Temperature Excursion Alert
 ↓
Quarantine if Required
 ↓
Quality Investigation
 ↓
Release / Reject
```

Temperature excursions must be auditable.

---

# 85. Temperature Sensor Integration

Future IoT integration:

```text
Temperature Sensor
        ↓
IoT Gateway
        ↓
Backend
        ↓
Inventory Location
        ↓
Alert Engine
```

Support:

- Temperature
- Humidity
- Refrigerator/freezer status
- Door opening events
- Sensor health
- Battery status
- Offline sensor detection

---

# 86. Controlled Medicine Ledger

Controlled medicines require a dedicated transaction ledger.

Every transaction should record:

```text
productId
batchId
quantity
patientId
encounterId
prescriptionId
requesterId
issuerId
witnessId
reason
timestamp
balanceAfter
```

Controls:

- Restricted permissions
- No silent edits
- Mandatory reason
- Patient/prescription linkage when applicable
- Opening balance
- Closing balance
- Reconciliation
- Variance investigation
- Complete audit trail

---

# 87. Medical Product Master Data

Medicine/product master should support:

```text
genericName
brandName
strength
dosageForm
route
manufacturer
composition
drugClassification
storageCondition
prescriptionRequired
controlledItem
criticalItem
barcode
```

Support relationships:

```text
Product
 ├── Generic equivalent
 ├── Alternative
 ├── Substitute
 └── Different strength/form
```

Substitution must remain subject to hospital/pharmacy policy and authorized clinical workflows.

---

# 88. Budget Management

Procurement must support department budgets.

Workflow:

```text
Department Budget
      ↓
Purchase Request
      ↓
Budget Check
      ↓
Approval
      ↓
Purchase Order
      ↓
Actual Purchase
      ↓
Budget Consumption
```

Dashboard:

```text
Allocated Budget
Committed Budget
Actual Spend
Remaining Budget
Budget Utilization %
```

Support budget periods:

```text
Monthly
Quarterly
Annual
Custom
```

---

# 89. Supplier Contract & Rate Management

Supplier contracts should support:

```text
contractNumber
supplierId
startDate
endDate
paymentTerms
deliveryTerms
items[]
negotiatedPrice
minimumOrderQty
maximumOrderQty
discount
tax
sla
renewalDate
status
```

Automatic reminders:

```text
90 days before expiry
60 days
30 days
7 days
```

Rate history should be maintained for procurement analysis.

---

# 90. Supplier Performance Score

Calculate supplier performance from:

```text
Price Score
Delivery Score
Quality Score
Rejection Rate
Order Accuracy
Expiry/Batch Issues
Response Time
Contract Compliance
```

Example:

```text
Supplier Score
= Price 25%
+ Quality 25%
+ Delivery 20%
+ Accuracy 15%
+ Service 15%
```

Weights must be configurable.

---

# 91. Advanced Inventory KPIs

Dashboard should support:

```text
Inventory Turnover
Days Inventory Outstanding
Stockout Rate
Fill Rate
Order Accuracy
Expiry Loss %
Wastage %
Dead Stock Value
Average Lead Time
Supplier On-Time Delivery %
Forecast Accuracy
Carrying Cost
Inventory Value
```

---

# 92. Inventory Turnover

Example:

```text
Inventory Turnover =
Annual Consumption Cost / Average Inventory Value
```

The reporting layer should calculate this using configured accounting periods.

---

# 93. Days of Inventory

```text
Days of Inventory =
Average Inventory / Average Daily Consumption
```

Use this to identify:

- Overstock
- Understock
- Slow-moving inventory
- Potential stockouts

---

# 94. Dead Stock Management

Identify items with no movement for a configurable period.

Example:

```text
No movement > 90 days
No movement > 180 days
No movement > 365 days
```

Actions:

```text
Transfer
Return
Discount/redistribute where appropriate
Write-off
Management review
```

---

# 95. Slow-Moving Inventory

Calculate movement velocity:

```text
FAST
MEDIUM
SLOW
NON_MOVING
```

Use configurable thresholds by product category.

---

# 96. Mobile Storekeeper Application

Create a responsive PWA/mobile interface for:

```text
Barcode Scan
QR Scan
Goods Receiving
Stock Issue
Stock Transfer
Stock Count
Batch Verification
Expiry Verification
Location Scan
Photo Evidence
Signature
```

Storekeeper workflow:

```text
Open Task
 ↓
Scan Location
 ↓
Scan Product
 ↓
Scan Batch/Serial
 ↓
Enter Quantity
 ↓
Confirm
 ↓
Sync
```

---

# 97. Offline-First Operations

The mobile application should support limited offline operation for appropriate workflows.

```text
Offline Transaction
       ↓
Local Queue
       ↓
Network Restored
       ↓
Server Validation
       ↓
Conflict Detection
       ↓
Sync
```

Never silently overwrite a server transaction.

Conflicts must be presented for resolution.

---

# 98. Electronic Signatures / Confirmations

For important workflows, support:

```text
Prepared By
Verified By
Approved By
Received By
```

Where legally and operationally appropriate, integrate an electronic-signature mechanism.

Use cases:

- High-value purchase
- GRN
- Stock adjustment
- Write-off
- Controlled medicine transaction
- Asset disposal
- Stock count approval

---

# 99. Photo / Evidence Capture

Allow users to attach evidence to:

- Damaged stock
- Delivery discrepancy
- Quality rejection
- Stock variance
- Equipment damage
- Disposal
- Supplier delivery
- Recall
- Temperature excursion

Store:

```text
fileId
resourceType
resourceId
uploadedBy
uploadedAt
fileHash
storageReference
```

---

# 100. Traceability Engine

The system must support forward and backward traceability.

## Forward

```text
Supplier
 ↓
PO
 ↓
GRN
 ↓
Batch
 ↓
Warehouse
 ↓
Transfer
 ↓
Department
 ↓
Patient / Procedure
```

## Backward

```text
Patient / Procedure
 ↓
Consumed Item
 ↓
Batch
 ↓
GRN
 ↓
Supplier
 ↓
Purchase Order
```

Given a batch number, the system should be able to identify:

- Current stock
- Historical locations
- Transfers
- Issues
- Returns
- Consumption
- Recall impact

---

# 101. Recall Impact Analysis

When a batch is recalled:

```text
Recall Batch
 ↓
Find All Inventory Balances
 ↓
Block Stock
 ↓
Find All Transfers
 ↓
Find All Department Issues
 ↓
Find Patient/Procedure Consumption
 ↓
Generate Recall Impact Report
```

Output:

```text
Affected Locations
Affected Departments
Affected Quantity
Remaining Stock
Issued Quantity
Returned Quantity
Consumed Quantity
```

Clinical follow-up workflows must be handled by the appropriate hospital clinical/compliance process.

---

# 102. Inventory State Machine

Inventory status transitions must be validated.

Example:

```text
RECEIVED
   ↓
QUALITY_CHECK
   ↓
AVAILABLE
   ↓
RESERVED
   ↓
ALLOCATED
   ↓
ISSUED
   ↓
CONSUMED
```

Alternative paths:

```text
RECEIVED → QUARANTINED
AVAILABLE → DAMAGED
AVAILABLE → EXPIRED
AVAILABLE → RECALLED
AVAILABLE → RETURNED
QUARANTINED → APPROVED
QUARANTINED → REJECTED
```

The backend must reject invalid transitions.

---

# 103. Advanced Reorder Engine

Reorder calculations should consider:

```text
Average Daily Consumption
Lead Time
Safety Stock
Current Available Stock
Reserved Stock
Incoming Purchase Orders
Seasonality
Criticality
Supplier Lead Time
```

Basic formula:

```text
Reorder Point =
Average Daily Consumption × Lead Time
+ Safety Stock
```

Recommended quantity:

```text
Target Stock
- Available Stock
- Confirmed Incoming Stock
+ Reserved Demand
```

All formulas should be configurable.

---

# 104. Demand Forecasting

Forecasting module:

```text
Historical Consumption
        ↓
Data Cleaning
        ↓
Trend Analysis
        ↓
Seasonality
        ↓
Forecast
        ↓
Recommended Reorder
```

Possible methods:

```text
Moving Average
Weighted Moving Average
Exponential Smoothing
Seasonal Forecast
ML Forecasting
```

Forecast results are recommendations and must not automatically override authorized procurement controls.

---

# 105. Advanced Approval Engine

Approval rules should support:

```text
Amount
Department
Item Category
Criticality
Controlled Status
Budget
Vendor
Transaction Type
```

Example:

```text
PO < ₹10,000
 → Store Manager

₹10,000–₹1,00,000
 → Purchase Manager

> ₹1,00,000
 → Hospital Admin
```

Approval workflows must be configurable without code changes.

---

# 106. Production-Grade Stock Transaction Algorithm

Every stock-changing operation should follow:

```text
Request
 ↓
Authenticate
 ↓
Authorize
 ↓
Validate Input
 ↓
Validate State
 ↓
Validate Stock
 ↓
Validate Batch/Serial
 ↓
Apply FEFO/FIFO
 ↓
Begin Atomic Transaction
 ↓
Create Immutable Ledger Event
 ↓
Update Inventory Balance
 ↓
Update Reservation
 ↓
Create Audit Event
 ↓
Commit
 ↓
Trigger Notifications
 ↓
Update/Queue Analytics
```

If any critical step fails:

```text
ROLLBACK
```

---

# 107. Idempotency

Critical mutation APIs should support idempotency.

Examples:

```text
POST /grns/:id/post
POST /transfers/:id/receive
POST /indents/:id/issue
POST /pharmacy/dispense
```

Use:

```text
Idempotency-Key
```

to prevent duplicate transactions caused by:

- Double clicks
- Network retries
- Mobile reconnection
- Client timeouts

---

# 108. Concurrency Control

Prevent:

```text
Two users issue same stock
Two users receive same GRN
Two users receive same transfer
Two pharmacy users dispense same reservation
```

Use:

- MongoDB transactions
- Atomic updates
- Version fields where appropriate
- Idempotency keys
- Reservation locks
- Server-side validation

---

# 109. Redis Layer

Redis may be used for:

```text
Session/temporary data
Rate limiting
Distributed locks where justified
Frequently accessed configuration
Short-lived dashboard caches
Job queues
Notification queues
```

Redis must never become the authoritative inventory source.

MongoDB transaction/ledger data remains authoritative.

---

# 110. Background Job Architecture

Use a queue system such as BullMQ where appropriate.

Jobs:

```text
Expiry Alert
Low Stock Alert
Reorder Recommendation
PO Delivery Reminder
Contract Expiry
Warranty Expiry
Calibration Reminder
Report Generation
Notification Delivery
Forecast Calculation
Inventory KPI Calculation
```

Jobs must be retry-safe and idempotent.

---

# 111. Production Infrastructure

Recommended architecture:

```text
Users
  ↓
CDN / WAF
  ↓
Load Balancer
  ↓
React Application
  ↓
Node.js API
  ↓
Service Layer
  ├── MongoDB Replica Set
  ├── Redis
  ├── Queue Workers
  ├── Object Storage
  └── Notification Providers
```

---

# 112. Environments

Maintain separate:

```text
Development
Testing
Staging
Production
```

Never use production data for development unless properly anonymized and authorized.

---

# 113. CI/CD

Pipeline:

```text
Git Push
 ↓
Lint
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Security Scan
 ↓
Build
 ↓
Docker Image
 ↓
Staging Deployment
 ↓
Smoke Tests
 ↓
Production Approval
 ↓
Production Deployment
```

Use database migration/versioning strategy for schema changes.

---

# 114. Observability

Implement:

```text
Application Logs
Audit Logs
Metrics
Tracing
Health Checks
Error Monitoring
```

Monitor:

```text
API latency
Error rate
Database latency
Queue failures
Stock transaction failures
Notification failures
Authentication failures
```

Every request should have a correlation/request ID.

---

# 115. Health Endpoints

Example:

```http
GET /health
GET /health/live
GET /health/ready
```

Readiness should verify required dependencies such as database connectivity.

---

# 116. Backup and Disaster Recovery

Production must define:

```text
Backup Frequency
Retention
Recovery Point Objective (RPO)
Recovery Time Objective (RTO)
Restore Testing
Disaster Recovery Procedure
```

Backups must be encrypted and access-controlled.

A backup is not considered reliable until restore testing succeeds.

---

# 117. Data Retention

Retention periods must be configurable according to:

- Hospital policy
- Contractual requirements
- Applicable law/regulation
- Clinical record requirements
- Accounting requirements

Do not hard-code a universal retention period.

---

# 118. Privacy and Security

Implement:

```text
Least Privilege
Tenant Isolation
Encryption in Transit
Encryption at Rest where appropriate
Secure Authentication
RBAC
Audit Trails
Session Management
Rate Limiting
Input Validation
Output Encoding
Secure File Upload
Secret Management
Dependency Scanning
```

Do not expose sensitive patient information in inventory logs or URLs unnecessarily.

---

# 119. PHI Minimization

Inventory transactions should store patient identifiers only when clinically/business-required.

Prefer:

```text
patientId
encounterId
procedureId
```

rather than copying unnecessary patient demographics into every transaction.

---

# 120. API Security

Every API must validate:

```text
Authentication
Authorization
Tenant
Input
Resource ownership
State transition
```

Never rely on frontend-hidden buttons as a security mechanism.

Example:

```text
User cannot approve PO
```

must be enforced by the API even if the frontend request is manually constructed.

---

# 121. API Rate Limits

Different limits for:

```text
Authentication
Normal APIs
Search APIs
Report APIs
File uploads
Barcode endpoints
Public endpoints
```

Sensitive endpoints require stricter controls.

---

# 122. File Security

For uploaded documents:

```text
Validate MIME type
Validate extension
Limit file size
Generate safe storage name
Scan for malware where available
Store outside executable directories
Use signed URLs
Log uploads/downloads
```

Never trust the filename or MIME type supplied by the browser.

---

# 123. Audit Requirements

Audit every:

```text
Create
Update
Approve
Reject
Issue
Receive
Transfer
Return
Adjust
Write-off
Recall
Quarantine
Release
Dispense
Disposal
Permission Change
Role Change
```

Audit logs should be append-only and protected from normal users.

---

# 124. Advanced Reports

Add:

```text
ABC Analysis
VEN Analysis
ABC-VEN Matrix
Inventory Turnover
Days Inventory
Stockout Analysis
Expiry Loss
Wastage Analysis
Dead Stock
Slow Moving
Fast Moving
Supplier SLA
Purchase Price Variance
Budget vs Actual
Department Cost
Forecast Accuracy
Critical Stock CoveC:\Users\rohith ebenazer\Downloads\HOSPITAL_INVENTORY_MANAGEMENT(5) (1).mdrage
```

---

# 125. Inventory Cost Analysis

Support:

```text
Purchase Cost
Tax
Freight
Discount
Landed Cost
Average Cost
FIFO Cost
Consumption Cost
Expiry Cost
Damage Cost
Write-off Cost
```

Example:

```text
Landed Cost =
Purchase Price
+ Freight
+ Other Allocable Costs
- Discounts
```

The accounting rules should remain configurable.

---

# 126. Purchase Price Variance

Track:

```text
Previous Purchase Price
Current Purchase Price
Contract Price
Quoted Price
Actual Price
Variance
```

Alert when the current purchase price exceeds configured thresholds.

---

# 127. Department Cost Allocation

Every issue can optionally carry:

```text
departmentId
costCenterId
patientId
encounterId
procedureId
```

This enables:

```text
ICU Consumption Cost
OT Consumption Cost
Emergency Consumption Cost
Ward Consumption Cost
Laboratory Consumption Cost
```

---

# 128. Emergency Stock Pool

Create dedicated emergency stock:

```text
Emergency Store
Emergency Reserve
Critical Care Reserve
Disaster Reserve
```

Reserve quantities should not be consumed by normal requests unless authorized.

---

# 129. Disaster / Mass-Casualty Inventory

Future-ready workflow:

```text
Mass Casualty Event
 ↓
Activate Emergency Inventory Mode
 ↓
Reserve Emergency Stock
 ↓
Priority Issue
 ↓
Emergency Procurement
 ↓
Track Consumption
 ↓
Post-event Reconciliation
```

---

# 130. Inventory Forecasting Dashboard

Display:

```text
Current Stock
Projected Consumption
Projected Stockout Date
Lead Time
Expected Purchase Arrival
Projected Coverage Days
```

Example:

```text
Oxygen Mask

Current Stock:        800
Daily Consumption:     45
Coverage:              17 days
Supplier Lead Time:     7 days
Projected Stockout:    28-Aug-2026

Status: ⚠️ Purchase Recommended
```

---

# 131. Production React Improvements

Use feature-based modular architecture:

```text
src/
├── app/
├── features/
│   ├── inventory/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   │
│   ├── procurement/
│   ├── pharmacy/
│   ├── assets/
│   ├── reports/
│   └── administration/
│
├── shared/
└── layouts/
```

Use lazy loading for major modules.

---

# 132. React UX Requirements

Tables must support:

- Server-side pagination
- Sorting
- Filtering
- Column visibility
- Export
- Bulk selection
- Keyboard navigation
- Loading states
- Empty states
- Error states
- Skeleton loading
- Responsive layouts

Critical actions must have confirmation dialogs.

Destructive actions require reason where appropriate.

---

# 133. Barcode UX

A scanner action should require minimal clicks:

```text
Scan
 ↓
Identify
 ↓
Show Product/Batch
 ↓
Quantity
 ↓
Confirm
```

For repeated counting:

```text
Scan → Quantity → Auto-save → Next
```

---

# 134. Accessibility

The web application should target WCAG-aligned accessibility.

Support:

- Keyboard navigation
- Focus management
- Accessible labels
- Screen-reader semantics
- Sufficient contrast
- Error messages
- Reduced-motion preferences
- Responsive layouts

---

# 135. Internationalization

Prepare the application for:

```text
English
Tamil
Other supported hospital languages
```

Externalize:

- Labels
- Validation messages
- Notifications
- Status text
- Reports

Do not hard-code user-facing strings throughout components.

---

# 136. Localization

Support configurable:

```text
Currency
Date format
Time zone
Number format
Tax configuration
Units
Fiscal year
```

Store timestamps consistently and display them in the hospital's configured timezone.

---

# 137. Search Architecture

For normal inventory search, MongoDB indexes may be sufficient.

For very large catalogs, consider:

```text
MongoDB Search
or
Dedicated Search Engine
```

Search fields:

```text
SKU
Barcode
Product Name
Generic Name
Brand
Batch
Serial
Supplier
```

---

# 138. Bulk Import / Export

Support controlled CSV/Excel import for:

```text
Products
Opening Stock
Suppliers
Batches
Price Lists
Locations
```

Import workflow:

```text
Upload
 ↓
Validate
 ↓
Preview Errors
 ↓
User Confirmation
 ↓
Import
 ↓
Summary
 ↓
Audit Log
```

Never import directly without validation/preview.

---

# 139. Opening Stock Migration

Production deployment may require existing inventory migration.

Support:

```text
Opening Balance
Product
Batch
Serial
Expiry
Location
Quantity
Cost
```

Opening-stock import must be separately identified in the ledger.

---

# 140. Data Quality Rules

Reject or flag:

```text
Duplicate SKU
Duplicate Barcode
Invalid Batch
Past Expiry on new receipt
Negative Quantity
Invalid Unit Conversion
Unknown Supplier
Unknown Location
Duplicate Serial Number
Invalid Warehouse
Missing Required Tracking Data
```

---

# 141. Production Acceptance Criteria — Additional

The module is not production-ready unless:

- [ ] Inventory transactions are immutable
- [ ] Corrections use reversal transactions
- [ ] Transfers cannot duplicate stock
- [ ] Reservations prevent over-allocation
- [ ] FEFO is enforced where configured
- [ ] Recall blocks affected batches
- [ ] Traceability works forward and backward
- [ ] Emergency stock workflow works
- [ ] Critical stock alerts work
- [ ] Cold-chain workflow exists where required
- [ ] Controlled medicine ledger exists where required
- [ ] Supplier contracts are tracked
- [ ] Supplier performance is measurable
- [ ] Budget controls are implemented
- [ ] ABC/VEN analysis is available
- [ ] Mobile barcode workflows work
- [ ] Offline conflict handling is safe
- [ ] Idempotency protects critical APIs
- [ ] Concurrent stock operations are safe
- [ ] Audit logs are append-only
- [ ] Backups are tested
- [ ] Disaster recovery is documented
- [ ] Monitoring and alerting are configured
- [ ] Security testing is completed
- [ ] Load/performance testing is completed
- [ ] Tenant isolation is verified
- [ ] Accessibility is tested
- [ ] Localization architecture is ready
- [ ] Bulk import is validated
- [ ] Opening-stock migration is auditable

---

# 142. Final Production Architecture

The final system should follow this principle:

```text
                         HOSPITAL
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
   PROCUREMENT          INVENTORY            PHARMACY
        │                   │                   │
    Suppliers          Central Store        Dispensing
    RFQ/Quotes         Sub-Stores           Returns
    Purchase Orders    Batches              Controlled Drugs
    GRN                Serial Numbers
        │              FEFO/FIFO
        └───────────────┬───────────────────────┘
                        ↓
                  DEPARTMENT REQUESTS
                        │
                     Indents
                        │
                    Approval
                        │
                 Reservation Engine
                        │
                 Stock Issue/Transfer
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
       ICU              OT             WARDS
        │               │                │
        └───────────────┼────────────────┘
                        ↓
              PATIENT / PROCEDURE
                        │
                    Consumption
                        │
                 Cost Allocation
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
   Analytics        Accounting       Audit
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                MANAGEMENT DASHBOARD
```

The core rule is:

```text
NO DIRECT STOCK EDITING

Every inventory change must become:

Request
→ Validation
→ Authorization
→ State Transition
→ Atomic Transaction
→ Immutable Ledger
→ Balance Update
→ Audit Event
→ Notification
→ Analytics
```

This architecture should be the baseline for the SCEC implementation rather than adding inventory features as independent CRUD pages.


---

# 143. Additional Enterprise Production Requirements

The following requirements further strengthen the system for enterprise hospital deployment.

## 143.1 Hospital Interoperability Layer

The inventory module should not operate as an isolated application.

Prepare integration boundaries for:

```text
Hospital Information System
Electronic Medical Record
Electronic Health Record
Pharmacy System
Laboratory Information System
Operating Theatre System
Billing / Finance
Procurement
Asset Management
Blood Bank
Medical Gas Management
Identity Provider
```

Use versioned integration APIs and asynchronous events where appropriate.

---

# 144. HL7 / FHIR Integration Readiness

Where the hospital ecosystem requires interoperability, prepare adapters for standards such as:

```text
FHIR
HL7 v2
```

Potential resources/events:

```text
Patient
Encounter
Practitioner
Medication
MedicationRequest
MedicationDispense
Device
Procedure
SupplyDelivery
SupplyRequest
```

The inventory system should maintain internal domain models independently from external interoperability models.

Do not tightly couple MongoDB schemas directly to FHIR resources.

---

# 145. GS1 / Barcode / UDI Readiness

Support globally structured identifiers where applicable:

```text
GTIN
GS1-128
DataMatrix
UDI
Serial Number
Lot Number
Expiry Date
```

A barcode may encode:

```text
Product
Batch/Lot
Serial
Expiry
```

The parser should support configurable barcode formats rather than assuming a single barcode structure.

---

# 146. Unit-of-Measure Engine

Inventory must support different units:

```text
Piece
Box
Pack
Strip
Bottle
Vial
Ampoule
Tablet
Capsule
Litre
Millilitre
Kilogram
Gram
Meter
```

Example:

```text
1 Box = 10 Packs
1 Pack = 20 Tablets
```

Unit conversion rules must be centrally managed.

Never duplicate conversion logic across frontend components.

---

# 147. Unit Conversion Safety

Every transaction should specify its unit.

Example:

```text
Purchase: Box
Storage: Box
Issue: Tablet
```

The system converts quantities using approved conversion rules.

Conversion changes must be audited.

---

# 148. Maker-Checker Controls

High-risk transactions should use segregation of duties.

Example:

```text
User A → Creates Adjustment
User B → Approves Adjustment
```

Recommended for:

- Stock adjustment
- Write-off
- Controlled medicine reconciliation
- High-value purchase
- Supplier creation
- Product master changes
- Opening stock
- Disposal

A user should not approve their own high-risk transaction unless an explicitly configured emergency policy allows it.

---

# 149. Four-Eyes Principle

For configurable critical operations:

```text
Initiator
+
Verifier
```

Both identities should be retained permanently in the audit trail.

---

# 150. Workflow Engine

Do not hard-code every approval workflow.

Create configurable workflow definitions:

```text
Workflow
 ├── Trigger
 ├── Conditions
 ├── Steps
 ├── Approvers
 ├── Escalation
 ├── SLA
 └── Completion Rules
```

Example:

```text
Purchase Request
 ↓
Department Manager
 ↓
Procurement
 ↓
Finance
 ↓
Hospital Admin
```

Rules can vary by amount and category.

---

# 151. SLA and Escalation Engine

Track approval and operational deadlines.

Example:

```text
Purchase Request
 ↓
Pending 24h
 ↓
Reminder
 ↓
Pending 48h
 ↓
Escalate to Manager
 ↓
Pending 72h
 ↓
Escalate to Admin
```

Support configurable SLA by workflow type.

---

# 152. Notification Center

Create an in-application notification center.

Categories:

```text
Critical
Warning
Information
Approval
Task
System
```

Channels:

```text
In-App
Email
SMS
Push
WhatsApp
```

External channels must be optional and provider-configurable.

Every notification should have delivery status.

---

# 153. Notification Deduplication

The alert engine must avoid sending repeated alerts for the same unresolved condition.

Example:

```text
Low Stock Alert
 ↓
Alert Created
 ↓
Daily Reminder
 ↓
Stock Replenished
 ↓
Alert Resolved
```

Do not send thousands of identical notifications.

---

# 154. Alert Suppression / Maintenance Windows

Administrators should be able to configure temporary alert suppression for:

- Planned maintenance
- Refrigerator maintenance
- Warehouse shutdown
- System migration
- Known supplier delay

Suppression must be audited and automatically expire.

---

# 155. Product Master Governance

Product creation should use a controlled lifecycle:

```text
DRAFT
 ↓
REVIEW
 ↓
APPROVED
 ↓
ACTIVE
 ↓
SUSPENDED
 ↓
RETIRED
```

Only approved products should be usable for normal transactions.

---

# 156. Duplicate Product Detection

Before creating a new product, detect possible duplicates using:

```text
SKU
Barcode
GTIN
Generic Name
Brand
Strength
Dosage Form
Manufacturer
```

Show possible matches before allowing creation.

---

# 157. Product Versioning

Do not silently change important product master attributes.

Track:

```text
Old Value
New Value
Changed By
Changed At
Reason
Approval
```

Especially:

- Strength
- Unit
- Controlled status
- Criticality
- Storage requirements
- Barcode
- Costing configuration

---

# 158. Batch Quality Management

Batch receipt should support:

```text
Manufacturing Date
Expiry Date
Batch Number
Certificate
Quality Status
Inspection Result
Supplier
Country of Origin where required
```

Quality states:

```text
PENDING
PASSED
FAILED
QUARANTINED
RELEASED
RECALLED
```

---

# 159. Certificate Management

Allow controlled documents for:

```text
Certificate of Analysis
Quality Certificate
Calibration Certificate
Warranty
Purchase Document
Supplier Certificate
Regulatory Document
```

Documents should have:

```text
expiryDate
version
documentType
uploadedBy
verificationStatus
```

Generate alerts before document expiry.

---

# 160. Pharmacy Safety Controls

Where inventory integrates with pharmacy, support:

```text
Prescription Validation
Medication Availability
Batch Selection
Expiry Validation
Dispensing
Return
Partial Dispensing
Substitution Workflow
Controlled Drug Workflow
```

Inventory should not independently make clinical decisions.

Clinical rules should remain under authorized pharmacy/clinical workflows.

---

# 161. Near-Expiry Management

Create configurable windows:

```text
Expired
≤ 30 Days
31–60 Days
61–90 Days
> 90 Days
```

Actions:

```text
Prioritize FEFO
Transfer
Return to Supplier
Review
Quarantine
Dispose
```

Near-expiry rules should differ by product category.

---

# 162. Expiry Disposal Workflow

Expired stock must not simply be deleted.

```text
Expired
 ↓
Quarantine
 ↓
Verification
 ↓
Disposal Request
 ↓
Approval
 ↓
Disposal
 ↓
Ledger Entry
 ↓
Evidence
 ↓
Audit
```

---

# 163. Waste Classification

Track different waste reasons:

```text
Expired
Damaged
Temperature Excursion
Contaminated
Recall
Broken Packaging
Quality Failure
Overstock Disposal
Other Approved Reason
```

This enables root-cause analysis.

---

# 164. Root-Cause Analysis

For repeated stock problems, support:

```text
Problem
 ↓
Investigation
 ↓
Root Cause
 ↓
Corrective Action
 ↓
Preventive Action
 ↓
Verification
 ↓
Closure
```

Example:

```text
Repeated expiry
→ Overstock
→ Forecasting issue
→ Procurement quantity reduced
→ Monitor next 3 months
```

---

# 165. Inventory Cycle Counting Engine

Instead of relying only on annual physical inventory:

```text
A Items → Frequent Count
B Items → Medium Frequency
C Items → Lower Frequency
Critical Items → Custom Frequency
```

Cycle-count schedules should be automatically generated.

---

# 166. Blind Stock Count

For stronger inventory controls, allow blind counts.

The counter sees:

```text
Product
Location
Batch
```

but does not initially see expected quantity.

After submitting the physical count:

```text
Physical Quantity
vs
System Quantity
```

Variance is calculated.

---

# 167. Variance Investigation

If variance exceeds threshold:

```text
Count
 ↓
Variance
 ↓
Recount
 ↓
Investigation
 ↓
Approval
 ↓
Adjustment
```

Require a reason for material variances.

---

# 168. Warehouse Location Hierarchy

Support:

```text
Hospital
 └── Building
      └── Floor
           └── Department
                └── Warehouse
                     └── Zone
                          └── Rack
                               └── Shelf
                                    └── Bin
```

Each inventory balance should be location-aware.

---

# 169. Location Capacity Management

Locations may define:

```text
Maximum Quantity
Maximum Weight
Maximum Volume
Temperature Range
Hazard Classification
Restricted Product Types
```

Receiving and transfers should validate location constraints.

---

# 170. Restricted Storage

Support storage rules for:

```text
Controlled Drugs
Flammable Materials
Cold Chain
Hazardous Chemicals
Sterile Supplies
Blood Products
High-Value Items
```

A user must not issue/transfer a restricted item to an incompatible location.

---

# 171. Stock Segregation

Support separate stock buckets:

```text
Available
Reserved
Quarantine
Damaged
Expired
Recalled
Emergency Reserve
Consignment
Blocked
```

These must not be treated as interchangeable.

---

# 172. Consignment Inventory

For supplier-owned inventory:

```text
Supplier Owns Stock
        ↓
Hospital Stores Stock
        ↓
Consumption
        ↓
Supplier Liability
        ↓
Settlement
```

Track ownership separately from physical location.

---

# 173. Vendor-Managed Inventory

Optional VMI workflow:

```text
Supplier
 ↓
Monitors Approved Stock
 ↓
Sees Limited Inventory Data
 ↓
Creates Replenishment Proposal
 ↓
Hospital Approval
 ↓
Delivery
```

Supplier access must be strictly tenant- and permission-scoped.

---

# 174. Demand Collaboration

Allow departments to submit:

```text
Forecast
Expected Surgery
Expected Admission Volume
Seasonal Demand
Special Event Demand
```

Use this information as an input to forecasting and procurement.

---

# 175. Purchase Requisition Consolidation

If multiple departments request the same product:

```text
ICU Request
OT Request
Ward Request
Lab Request
       ↓
Consolidation Engine
       ↓
Combined Purchase Request
       ↓
Procurement
```

This can reduce duplicate purchasing.

---

# 176. Three-Way Matching

Procurement should support:

```text
Purchase Order
      +
Goods Receipt
      +
Supplier Invoice
      ↓
Three-Way Match
```

Detect:

```text
Quantity mismatch
Price mismatch
Tax mismatch
Missing receipt
Duplicate invoice
```

Finance approval should be triggered according to configured policy.

---

# 177. Duplicate Invoice Detection

Potential duplicate invoices can be identified using:

```text
Supplier
Invoice Number
Invoice Date
Amount
PO Number
Hash / normalized reference
```

Flag duplicates before payment processing.

---

# 178. Procurement Analytics

Dashboard:

```text
Purchase Value
Purchase Frequency
Price Trend
Supplier Spend
Contract Compliance
PO Cycle Time
GRN Cycle Time
Invoice Match Rate
Purchase Price Variance
Emergency Purchase Rate
```

---

# 179. Emergency Procurement Analytics

Track:

```text
Emergency Purchase Count
Emergency Purchase Value
Emergency Purchase Reason
Department
Product
Supplier
```

High emergency procurement frequency should generate management review.

---

# 180. Inventory Fraud Detection

Add configurable anomaly detection.

Examples:

```text
Repeated unusual adjustments
Large after-hours issues
Frequent reversals
Unexpected high consumption
Repeated emergency issues
Multiple failed approvals
Unusual controlled-drug variance
Duplicate transactions
```

These are investigation signals, not automatic accusations.

---

# 181. Segregation-of-Duties Matrix

Maintain a permission conflict matrix.

Example:

| Capability A | Capability B | Conflict |
|---|---|---|
| Create Supplier | Approve Supplier | Yes |
| Create PO | Approve Same PO | Yes |
| Create Adjustment | Approve Same Adjustment | Yes |
| Create Write-off | Approve Same Write-off | Yes |
| Count Stock | Approve Own Variance | Yes |

The system should prevent configured conflicts.

---

# 182. SSO and MFA

Enterprise deployments should support:

```text
OIDC
OAuth 2.0
SAML
```

and:

```text
MFA
Authenticator App
Email OTP where policy permits
Hardware/security key where supported
```

Hospital administrators should be able to enforce MFA for privileged users.

---

# 183. Privileged Access Management

Privileged roles should have:

```text
Shorter Sessions
MFA
Re-authentication for Critical Actions
Detailed Audit
IP/device policies where appropriate
```

Examples:

```text
System Administrator
Hospital Administrator
Security Administrator
Finance Administrator
```

---

# 184. Tenant Isolation

If supporting multiple hospitals:

```text
Tenant
 ├── Hospitals
 ├── Users
 ├── Warehouses
 ├── Inventory
 ├── Suppliers
 └── Configuration
```

Every tenant-owned document must contain:

```text
tenantId
```

Server-side authorization must verify tenant ownership.

Never trust a `tenantId` supplied by the frontend.

---

# 185. Cross-Hospital Transfers

For hospital groups:

```text
Hospital A
    ↓
Inter-Hospital Transfer
    ↓
Hospital B
```

Support:

```text
Transfer Request
Approval
Dispatch
In Transit
Receipt
Reconciliation
```

Ownership/accounting implications must be configurable.

---

# 186. API Versioning

Use versioned APIs:

```text
/api/v1/...
/api/v2/...
```

Do not introduce breaking API changes without versioning/migration planning.

---

# 187. Event Architecture

Publish domain events such as:

```text
StockReceived
StockIssued
StockTransferred
StockAdjusted
StockExpired
StockRecalled
PurchaseApproved
PurchaseReceived
ReservationCreated
ReservationReleased
```

Events can feed:

```text
Notifications
Analytics
Integrations
Audit
Forecasting
```

Events should contain stable identifiers and schema versions.

---

# 188. Outbox Pattern

For critical database-to-event consistency:

```text
MongoDB Transaction
 ├── Inventory Change
 └── Outbox Event
          ↓
      Worker
          ↓
External Event / Notification
```

This prevents inventory from being committed while the corresponding event is lost.

---

# 189. Integration Retry Strategy

External integrations must handle:

```text
Timeout
5xx
Rate Limit
Temporary Network Failure
Duplicate Response
Malformed Response
```

Use:

```text
Exponential Backoff
Retry Limits
Dead Letter Queue
Idempotency
Integration Monitoring
```

Never endlessly retry a failed transaction.

---

# 190. Contract Testing

For external APIs, add contract tests to ensure:

```text
Request schema
Response schema
Error schema
Version compatibility
Authentication
```

This is particularly important for:

- Finance
- Pharmacy
- EMR/HIS
- Supplier integrations
- Payment systems

---

# 191. Automated Testing Pyramid

Required testing layers:

```text
Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
Component Tests
    ↓
End-to-End Tests
    ↓
Performance Tests
    ↓
Security Tests
```

Critical inventory algorithms require high test coverage.

---

# 192. Inventory Invariant Tests

The test suite must verify invariants such as:

```text
Stock can never become negative unless explicitly configured.
Transfer source + destination remains balanced.
Reversal restores the expected balance.
Duplicate requests do not duplicate stock movement.
Concurrent issues cannot oversell stock.
Quarantine stock cannot be issued.
Expired stock cannot be issued.
Recalled stock cannot be issued.
Reserved stock cannot be consumed by unrelated requests.
```

---

# 193. Load Testing

Test realistic peak scenarios:

```text
Morning pharmacy rush
Emergency department surge
OT scheduled procedures
Mass admission event
Large stock count
Large report generation
Concurrent barcode scanning
```

Measure:

```text
p95 latency
p99 latency
Throughput
Error rate
Database contention
Queue latency
```

---

# 194. Performance Budgets

Define measurable targets per deployment.

Examples:

```text
Barcode lookup: fast interactive response
Stock issue: transactional response within agreed SLA
Dashboard: cached/optimized response
Large reports: asynchronous generation
```

Exact targets should be established through performance testing rather than assumed universally.

---

# 195. Security Testing

Before production:

```text
SAST
DAST
Dependency Scanning
Container Scanning
Secret Scanning
Penetration Testing
API Authorization Testing
File Upload Testing
Rate Limit Testing
Session Security Testing
```

Critical findings must be resolved or formally accepted before production.

---

# 196. Disaster Recovery Drill

Do not only configure backups.

Perform scheduled drills:

```text
Simulated Failure
 ↓
Restore
 ↓
Validate Data
 ↓
Validate Integrations
 ↓
Validate Application
 ↓
Measure RTO/RPO
 ↓
Document Findings
```

---

# 197. Database Index Governance

Indexes must be based on actual query patterns.

Important candidate indexes include:

```text
tenantId + sku
tenantId + barcode
tenantId + productId
tenantId + batchNumber
tenantId + expiryDate
tenantId + warehouseId
tenantId + locationId
tenantId + status
tenantId + createdAt
tenantId + transactionType
```

Index design must be reviewed as data volume grows.

---

# 198. Data Archiving

Large transaction histories should support archival strategy.

```text
Hot Data
 ↓
Operational Database

Historical Data
 ↓
Archive Storage
```

Archived data must remain searchable or retrievable according to hospital requirements.

Never delete audit records simply to reduce database size.

---

# 199. Data Lineage

Reports should be traceable back to source transactions.

Example:

```text
Dashboard KPI
 ↓
Report Query
 ↓
Inventory Ledger
 ↓
Stock Transaction
 ↓
Source Document
```

Users should be able to drill from a KPI to supporting records where their permissions allow it.

---

# 200. Report Reproducibility

Reports should record:

```text
Report Name
Generated At
Period
Filters
Tenant
Generated By
Data Version / Query Version where applicable
```

This helps explain why historical reports may differ after corrections.

---

# 201. Production Configuration Management

Do not hard-code hospital-specific rules.

Configuration should manage:

```text
Reorder Thresholds
Approval Limits
Criticality
ABC/VEN Rules
Expiry Windows
SLA
Notification Rules
Units
Tax
Fiscal Year
Warehouses
Roles
Workflow
```

Configuration changes must be audited.

---

# 202. Feature Flags

Use feature flags for controlled rollout:

```text
Cold Chain
Forecasting
Mobile Offline
VMI
Inter-Hospital Transfer
Advanced Recall
New Reports
```

Allow:

```text
Development
Staging
Pilot Hospital
Selected Departments
Production
```

without redeploying the entire application.

---

# 203. Pilot Rollout Strategy

Production rollout should be staged:

```text
Phase 1
Central Store

Phase 2
Pharmacy

Phase 3
Selected Departments

Phase 4
All Departments

Phase 5
Advanced Integrations
```

Monitor each phase before expansion.

---

# 204. Rollback Strategy

Every deployment must have:

```text
Application Rollback
Database Migration Rollback/Forward Fix
Feature Flag Disablement
Integration Disablement
Emergency Support Procedure
```

Do not rely on restoring the entire production database as the only rollback strategy.

---

# 205. Business Continuity

Define procedures for:

```text
Network Outage
Power Failure
Database Failure
Hospital Server Failure
External Integration Failure
Barcode Scanner Failure
Notification Provider Failure
Cybersecurity Incident
```

The hospital must know how essential inventory operations continue safely.

---

# 206. Cyber Incident Mode

If the system detects or experiences a cybersecurity incident:

```text
Incident Detection
 ↓
Containment
 ↓
Access Restriction
 ↓
Evidence Preservation
 ↓
Business Continuity
 ↓
Recovery
 ↓
Validation
 ↓
Post-Incident Review
```

Do not destroy logs during incident response.

---

# 207. Admin Control Center

Create a dedicated administration area:

```text
Users
Roles
Permissions
Departments
Hospitals
Warehouses
Locations
Units
Product Categories
Approval Rules
Workflows
Notification Rules
Integrations
Feature Flags
Audit Logs
System Health
```

---

# 208. Production Support Console

Authorized support administrators should be able to inspect:

```text
Failed Jobs
Failed Integrations
Notification Failures
Synchronization Errors
Pending Approvals
Stuck Workflows
Outbox Events
Dead Letter Queue
```

Support users must not receive unrestricted clinical access.

---

# 209. Safe Operational Tools

Administrative repair operations must be explicit.

Example:

```text
Replay Event
Retry Job
Reprocess Integration
Release Stuck Workflow
Rebuild Projection
```

Every operational action must be audited.

Avoid generic:

```text
Edit Database
```

functionality.

---

# 210. Final Enterprise-Level Checklist

Before calling the hospital inventory module production-ready:

## Inventory

- [ ] Immutable ledger
- [ ] Atomic transactions
- [ ] Reservation engine
- [ ] FEFO/FIFO
- [ ] Batch tracking
- [ ] Serial tracking
- [ ] Expiry management
- [ ] Quarantine
- [ ] Recall
- [ ] Stock adjustment
- [ ] Cycle counting
- [ ] Blind counting
- [ ] Variance workflow

## Hospital

- [ ] Department inventory
- [ ] Pharmacy integration
- [ ] OT consumption
- [ ] ICU consumption
- [ ] Patient/procedure linkage
- [ ] Emergency inventory
- [ ] Critical inventory
- [ ] Controlled medicine workflow
- [ ] Cold-chain workflow
- [ ] Medical-device/asset integration
- [ ] Blood-bank integration boundary

## Procurement

- [ ] Supplier management
- [ ] RFQ
- [ ] Purchase requisition
- [ ] Approval workflow
- [ ] PO
- [ ] GRN
- [ ] Contract management
- [ ] Rate contracts
- [ ] Supplier score
- [ ] Three-way matching
- [ ] Budget management
- [ ] Emergency procurement

## Enterprise

- [ ] Multi-hospital support
- [ ] Tenant isolation
- [ ] Inter-hospital transfers
- [ ] SSO
- [ ] MFA
- [ ] Segregation of duties
- [ ] Maker-checker
- [ ] Configurable workflow
- [ ] SLA/escalation
- [ ] Feature flags

## Integration

- [ ] REST API
- [ ] API versioning
- [ ] HL7/FHIR readiness
- [ ] GS1/UDI readiness
- [ ] Event architecture
- [ ] Outbox pattern
- [ ] Retry/dead-letter handling
- [ ] Finance integration
- [ ] HIS/EMR integration
- [ ] Pharmacy integration

## Security

- [ ] RBAC
- [ ] Least privilege
- [ ] PHI minimization
- [ ] Encryption
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Secure file handling
- [ ] Secret management
- [ ] SAST
- [ ] DAST
- [ ] Penetration testing
- [ ] Dependency scanning

## Reliability

- [ ] MongoDB replica set
- [ ] Backups
- [ ] Restore testing
- [ ] Disaster recovery
- [ ] RPO/RTO
- [ ] Health checks
- [ ] Monitoring
- [ ] Error tracking
- [ ] Queue monitoring
- [ ] Load testing
- [ ] Concurrency testing
- [ ] Offline synchronization

## UX

- [ ] Responsive web UI
- [ ] Mobile/PWA
- [ ] Barcode/QR scanning
- [ ] Keyboard support
- [ ] Accessibility
- [ ] Localization
- [ ] Tamil-ready translations
- [ ] Server-side tables
- [ ] Bulk actions
- [ ] Export
- [ ] Advanced search

---

# 211. Final Architecture Principle

The inventory module must be treated as a **transactional hospital supply-chain platform**, not simply as a product CRUD module.

The authoritative flow is:

```text
MASTER DATA
     ↓
DEMAND
     ↓
REQUEST
     ↓
APPROVAL
     ↓
PROCUREMENT
     ↓
RECEIVING
     ↓
QUALITY / QUARANTINE
     ↓
AVAILABLE STOCK
     ↓
RESERVATION
     ↓
ISSUE / TRANSFER
     ↓
PATIENT / PROCEDURE / DEPARTMENT CONSUMPTION
     ↓
COST ALLOCATION
     ↓
RECONCILIATION
     ↓
ANALYTICS
```

Every important action must have:

```text
Identity
+
Permission
+
Validation
+
State Transition
+
Atomic Transaction
+
Immutable Ledger
+
Audit Trail
+
Traceability
```

This specification should therefore be implemented as a **domain-driven, transaction-first architecture** with configurable hospital workflows rather than a collection of independent CRUD screens.


---

# 212. Final Missing Enterprise Domains and Controls

This section closes additional gaps that should be considered before implementation. These are deliberately separated from the inventory core because several require their own domain boundaries, lifecycle rules, and integrations.

# 213. Laboratory Inventory

Laboratory inventory requires specialized tracking.

Support:

```text
Reagents
Calibrators
Controls
Collection Tubes
Specimen Containers
Test Kits
Consumables
Laboratory Chemicals
```

Track:

```text
Lot Number
Expiry
Storage Temperature
Open-Vial Date
Stability Period
Manufacturer
Analyzer Compatibility
Quality Status
```

Workflow:

```text
Receive
 ↓
Quality Check
 ↓
Store
 ↓
Open
 ↓
Use
 ↓
Remaining Quantity
 ↓
Discard
```

Some laboratory products have an expiry period after opening that differs from the manufacturer expiry. Support configurable open-container stability rules.

---

# 214. Specimen Collection Supply Tracking

Link selected consumables to specimen workflows:

```text
Patient
 ↓
Encounter
 ↓
Lab Order
 ↓
Specimen Type
 ↓
Collection Kit
 ↓
Consumables
```

Examples:

```text
Blood Collection Tube
Urine Container
Swab
Transport Medium
Needle
Syringe
```

This enables department-level laboratory consumption analysis.

---

# 215. Operating Theatre Inventory

OT inventory needs procedure-based planning.

Workflow:

```text
Scheduled Surgery
 ↓
Procedure Template
 ↓
Required Supplies
 ↓
Inventory Availability
 ↓
Reservation
 ↓
OT Kit Preparation
 ↓
Issue
 ↓
Actual Consumption
 ↓
Unused Return
 ↓
Reconciliation
```

Support:

```text
Procedure Kit
Preference Card
Surgeon Preference
Standard Consumables
Optional Consumables
Implants
Emergency Items
```

---

# 216. Surgical Preference Cards

Each procedure may define expected supplies:

```text
Procedure
 ├── Standard Items
 ├── Optional Items
 ├── Surgeon-specific Items
 ├── Implant Requirements
 └── Emergency Items
```

Compare:

```text
Expected Consumption
vs
Actual Consumption
```

Use this to improve forecasting and reduce waste.

---

# 217. Ward / ICU Par-Level Management

Each department can have configurable par levels:

```text
Minimum
Par
Maximum
Emergency Reserve
```

Workflow:

```text
Department Stock
 ↓
Count
 ↓
Par Level Comparison
 ↓
Replenishment Recommendation
 ↓
Store Issue
```

---

# 218. Automated Replenishment to Departments

Support:

```text
Min/Max Replenishment
Par-Level Replenishment
Scheduled Replenishment
Demand-Based Replenishment
Emergency Replenishment
```

The system should generate replenishment tasks rather than requiring staff to manually calculate every request.

---

# 219. Nursing Station Inventory

Track frequently used nursing supplies:

```text
Syringes
Needles
Gloves
Dressings
Cannulas
IV Sets
Catheters
Disinfectants
Basic Emergency Supplies
```

Support quick barcode issue/return/count workflows.

---

# 220. Crash Cart / Emergency Trolley Management

Create dedicated crash-cart inventory.

Track:

```text
Cart ID
Location
Assigned Department
Required Items
Actual Items
Batch
Expiry
Seal Number
Last Checked
Checked By
Next Check
```

Workflow:

```text
Scheduled Check
 ↓
Scan Cart
 ↓
Scan Items
 ↓
Verify Quantity
 ↓
Verify Expiry
 ↓
Seal Cart
 ↓
Record Seal Number
 ↓
Sign Off
```

Immediate alert if a critical item is missing or expired.

---

# 221. Emergency Trolley Checklist Templates

Different departments may require different checklists.

Example:

```text
ICU Crash Cart
Emergency Department Cart
OT Emergency Cart
Ward Crash Cart
Pediatric Crash Cart
```

Templates should be configurable.

---

# 222. Drug Recall and Safety Alert Management

Support medicine/product safety notifications:

```text
Safety Alert
 ↓
Identify Product/Batch
 ↓
Block Stock
 ↓
Trace Locations
 ↓
Trace Issues
 ↓
Generate Impact Report
 ↓
Notify Authorized Users
 ↓
Return/Dispose
 ↓
Close
```

Keep safety alerts separate from ordinary inventory alerts.

---

# 223. Product Substitution Management

When an item is unavailable:

```text
Requested Product
 ↓
Approved Alternative
 ↓
Availability Check
 ↓
Authorized Substitution
 ↓
Issue
```

Substitutions must be governed by hospital/pharmacy policy and not automatically make clinical decisions.

---

# 224. Shortage Management

Create a formal shortage lifecycle:

```text
SHORTAGE_DETECTED
 ↓
ASSESSMENT
 ↓
ALTERNATIVE_IDENTIFIED
 ↓
PROCUREMENT_ACTION
 ↓
MONITORING
 ↓
RESOLVED
```

Track:

```text
Product
Cause
Start Date
Expected Resolution
Supplier
Alternative
Affected Departments
Impact
```

---

# 225. Supplier Shortage / Backorder

Purchase orders should support:

```text
FULL
PARTIAL
BACKORDER
CANCELLED
DELAYED
```

Partial delivery:

```text
PO: 1000
Received: 400
Backorder: 600
```

Never mark the PO completely received until the remaining quantity is resolved.

---

# 226. Shipment Tracking

For important purchases:

```text
PO
 ↓
Shipment
 ↓
Carrier
 ↓
Tracking Number
 ↓
Estimated Delivery
 ↓
Actual Delivery
 ↓
GRN
```

Support multiple shipments against one PO.

---

# 227. In-Transit Inventory

Transferred/purchased stock should have an explicit state:

```text
ON_HAND
RESERVED
IN_TRANSIT
QUARANTINED
AVAILABLE
```

In-transit stock must not be counted as available stock.

---

# 228. Multi-Stage Receiving

Large hospitals may need:

```text
Dock Receiving
 ↓
Physical Verification
 ↓
Document Verification
 ↓
Quality Inspection
 ↓
Put-away
```

Support partial acceptance:

```text
100 Received
90 Accepted
10 Rejected
```

---

# 229. Receiving Discrepancy Management

Create a discrepancy record for:

```text
Short Quantity
Excess Quantity
Wrong Product
Damaged Product
Wrong Batch
Wrong Expiry
Missing Documents
Price Difference
```

Workflow:

```text
GRN
 ↓
Discrepancy
 ↓
Supplier Notification
 ↓
Resolution
 ↓
Credit / Replacement / Acceptance
```

---

# 230. Supplier Returns

Return lifecycle:

```text
Return Request
 ↓
Approval
 ↓
Pick
 ↓
Dispatch
 ↓
Supplier Receipt
 ↓
Credit Note / Replacement
```

Track returned batches separately.

---

# 231. Recall Simulation / Drill

Hospitals should be able to run a non-destructive recall exercise:

```text
Select Test Batch
 ↓
Run Traceability
 ↓
Identify Affected Locations
 ↓
Generate Report
 ↓
Measure Response Time
```

Clearly mark simulated events so they cannot be confused with real recalls.

---

# 232. Disaster Inventory Kits

Create predefined emergency kits:

```text
Flood Kit
Fire Emergency Kit
Mass Casualty Kit
Pandemic Kit
Disaster Response Kit
Isolation Kit
```

Each kit contains:

```text
Required Items
Minimum Quantity
Expiry Rules
Storage Location
Replenishment Rules
```

---

# 233. Pandemic / Surge Mode

Support configurable surge scenarios:

```text
Normal Mode
Surge Mode
Emergency Mode
Disaster Mode
```

Each mode can change:

```text
Safety Stock
Reorder Point
Emergency Reserve
Approval Rules
Notification Priority
Consumption Forecast
```

---

# 234. Vendor Qualification

Supplier onboarding should include:

```text
Supplier Application
 ↓
Document Collection
 ↓
Verification
 ↓
Quality Review
 ↓
Financial Review
 ↓
Approval
 ↓
Active
```

Track supplier status:

```text
PENDING
APPROVED
CONDITIONAL
SUSPENDED
BLOCKED
EXPIRED
```

---

# 235. Supplier Risk Management

Score suppliers based on:

```text
Financial Risk
Delivery Risk
Quality Risk
Single-Source Risk
Geographic Risk
Regulatory Risk
Historical Performance
```

Flag products dependent on a single supplier.

---

# 236. Single-Supplier Dependency

Dashboard:

```text
Product
Primary Supplier
Alternative Supplier
Lead Time
Stock Coverage
Risk Level
```

Example:

```text
Product X
1 approved supplier
7 days stock
14 days lead time

Risk: HIGH
```

---

# 237. Dual-Sourcing

For critical items:

```text
Primary Supplier
+
Backup Supplier
```

Track qualification status of the backup supplier.

---

# 238. Purchase Contract Price Escalation

Detect:

```text
Contract Price
vs
Actual Invoice Price
```

Alert on unexpected increases.

---

# 239. Price Benchmarking

Compare:

```text
Supplier Price
Hospital Historical Price
Contract Price
Approved Benchmark
```

This supports procurement negotiation.

---

# 240. Procurement Approval Delegation

Support temporary delegation:

```text
Manager A
 ↓
On Leave
 ↓
Manager B
```

Delegation must have:

```text
Start Date
End Date
Scope
Reason
Approver
Audit
```

Expired delegation must automatically stop.

---

# 241. Break-Glass Access

For genuine emergencies, a restricted break-glass mechanism may provide temporary elevated access.

Requirements:

```text
Explicit Reason
User Identity
Timestamp
Scope
Automatic Expiry
Full Audit
Post-Event Review
```

Break-glass access must not silently bypass auditing.

---

# 242. Session and Device Management

Support:

```text
Active Sessions
Device List
Last Login
IP/Network Metadata where permitted
Session Revocation
Forced Logout
```

Privileged users should have stronger session controls.

---

# 243. API Key / Integration Credential Vaulting

External integrations should use managed secrets.

Never store:

```text
API Keys
Passwords
OAuth Secrets
Database Passwords
```

in source code or normal configuration files committed to Git.

Use an appropriate secret-management mechanism.

---

# 244. Encryption Key Rotation

Production security should define:

```text
Key Creation
Key Storage
Rotation
Revocation
Emergency Rotation
Access Logging
```

Do not make encryption keys permanently static.

---

# 245. Data Export Governance

Exports may contain sensitive information.

Before export:

```text
Authorize
 ↓
Apply Filters
 ↓
Minimize Data
 ↓
Generate
 ↓
Audit
 ↓
Secure Download
```

Large reports should use asynchronous generation.

---

# 246. Export Watermarking

For sensitive reports, optionally include:

```text
Generated By
Generated At
Hospital
Report ID
```

This improves accountability.

---

# 247. Search Privacy

Search logs should not unnecessarily retain sensitive patient terms.

Use patient identifiers only when required.

Apply appropriate logging minimization.

---

# 248. Disaster-Resilient Notifications

Critical alerts should not depend on a single provider.

Support configurable fallback:

```text
In-App
 ↓
Push
 ↓
Email
 ↓
SMS
```

Critical escalation policy may use multiple channels.

---

# 249. Job Scheduling Governance

Every scheduled job should have:

```text
Job ID
Schedule
Owner
Status
Last Run
Next Run
Duration
Failure Count
Retry Count
```

Administrators should be able to pause/resume jobs safely.

---

# 250. Queue Backlog Monitoring

Monitor:

```text
Waiting Jobs
Active Jobs
Failed Jobs
Delayed Jobs
Dead Letter Jobs
Processing Time
```

Alert when queue latency exceeds configured thresholds.

---

# 251. Database Migration Governance

Every schema/data migration should include:

```text
Migration ID
Version
Author
Timestamp
Description
Forward Migration
Rollback/Recovery Strategy
Validation
```

Production migrations should be tested on staging with representative data volumes.

---

# 252. Zero-Downtime Deployment Readiness

For critical hospitals, design deployments so that:

```text
Old Version
+
New Version
```

can coexist temporarily.

Use backward-compatible API/database changes where practical.

---

# 253. Blue/Green or Canary Deployment

For high-availability environments:

```text
Production
 ├── Current
 └── Candidate
```

Route a small percentage of traffic to the candidate before full rollout.

---

# 254. Synthetic Monitoring

Run automated checks such as:

```text
Login
Product Search
Barcode Lookup
Stock Availability
Create Test Transaction in Safe Environment
Report Generation
```

Production synthetic checks must never create real hospital transactions.

---

# 255. Business KPI Alerting

Management alerts should detect:

```text
Inventory Value Spike
Stockout Spike
Expiry Loss Spike
Emergency Purchase Spike
Supplier Delay Spike
Consumption Anomaly
Budget Overrun
```

---

# 256. Executive Command Center

Create an executive dashboard with:

```text
Total Inventory Value
Critical Stock
Stockout Risk
Expiry Risk
Emergency Purchases
Supplier Risk
Procurement Spend
Department Consumption
Budget Utilization
Inventory Turnover
```

Allow drill-down:

```text
Hospital
 ↓
Department
 ↓
Warehouse
 ↓
Category
 ↓
Product
 ↓
Batch
 ↓
Transaction
```

---

# 257. Role-Specific Dashboards

## Storekeeper

```text
Receiving
Picking
Transfers
Low Stock
Expiry
Pending Tasks
```

## Pharmacy Manager

```text
Medicine Stock
Controlled Items
Shortages
Expiry
Dispensing
```

## Procurement Manager

```text
RFQ
PO
Supplier Performance
Price Variance
Pending Approvals
```

## Finance

```text
Inventory Value
Budget
Purchase Spend
Invoice Matching
Valuation
```

## Hospital Administrator

```text
Critical Stock
Costs
Supplier Risk
Department Consumption
Compliance
```

---

# 258. Task Inbox

Every operational user should have a centralized task inbox:

```text
Pending Approval
Pending Receipt
Pending Count
Pending Inspection
Pending Return
Pending Reconciliation
Pending Recall
Pending Disposal
Pending Supplier Action
```

Tasks should have:

```text
Priority
SLA
Assignee
Created At
Due At
Status
```

---

# 259. Work Queue Assignment

Tasks may be assigned:

```text
Individual
Role
Department
Warehouse
Shift
```

Support reassignment with audit history.

---

# 260. Shift Management

Inventory operations often operate across shifts.

Track:

```text
Shift
Storekeeper
Opening Balance
Closing Balance
Handover
Pending Tasks
Critical Exceptions
```

Handover report:

```text
Opening
+
Receipts
-
Issues
+
Returns
± Adjustments
=
Expected Closing
```

---

# 261. End-of-Shift Reconciliation

For selected high-risk areas:

```text
System Balance
vs
Physical/Operational Balance
```

Require shift handover acknowledgment.

---

# 262. Warehouse Workload Dashboard

Display:

```text
Pending Receipts
Pending Put-away
Pending Picks
Pending Transfers
Pending Counts
Pending Returns
Average Processing Time
```

This helps managers balance staff workload.

---

# 263. Workforce Planning Integration

Optional integration with hospital workforce management:

```text
Warehouse Volume
+
Shift Staffing
+
Peak Demand
```

This can identify operational bottlenecks.

---

# 264. Cost-to-Serve Analysis

Calculate operational cost by:

```text
Hospital
Department
Warehouse
Product Category
Supplier
Distribution Channel
```

Possible components:

```text
Purchase Cost
Storage Cost
Handling Cost
Expiry Cost
Transport Cost
Emergency Procurement Cost
```

---

# 265. Carbon / Sustainability Tracking

Optional enterprise sustainability module:

```text
Packaging Waste
Expired Stock
Disposal
Transport
Energy-intensive Storage
Supplier Sustainability
```

Track environmental metrics where reliable source data exists.

---

# 266. Packaging and Case-Level Tracking

For warehouse operations:

```text
Pallet
 ↓
Case
 ↓
Box
 ↓
Pack
 ↓
Unit
```

Track hierarchical packaging identifiers where required.

---

# 267. Serial Number Lifecycle

For serialized products:

```text
Purchased
 ↓
Received
 ↓
Stored
 ↓
Issued
 ↓
Installed
 ↓
Patient/Procedure
 ↓
Returned/Serviced
 ↓
Disposed
```

A serial number must not exist in two active locations simultaneously.

---

# 268. Warranty Claim Workflow

For eligible equipment/products:

```text
Issue Detected
 ↓
Warranty Check
 ↓
Claim
 ↓
Supplier
 ↓
Repair/Replacement
 ↓
Receive
 ↓
Close
```

Track warranty cost savings.

---

# 269. Calibration Management

For applicable equipment:

```text
Asset
 ↓
Calibration Schedule
 ↓
Due Alert
 ↓
Calibration
 ↓
Certificate
 ↓
Next Due Date
```

Expired calibration status should optionally block equipment use depending on hospital policy.

---

# 270. Preventive Maintenance Inventory Link

Maintenance work orders should be able to reserve/consume spare parts:

```text
Maintenance Work Order
 ↓
Required Spare Parts
 ↓
Reservation
 ↓
Issue
 ↓
Repair
 ↓
Consumption
```

---

# 271. Spare Parts Inventory

Create dedicated categories:

```text
Biomedical Spare Parts
HVAC Spare Parts
Medical Gas Spare Parts
IT Hardware Spare Parts
Facility Spare Parts
```

Track compatibility with equipment models.

---

# 272. Equipment-BOM Management

For maintainable equipment:

```text
Equipment Model
 ├── Required Spare Part A
 ├── Required Spare Part B
 └── Required Consumable C
```

This enables maintenance planning.

---

# 273. Service Vendor Management

Track:

```text
Service Provider
Contract
SLA
Equipment
Visit
Technician
Parts Used
Cost
Warranty
Outcome
```

---

# 274. Hospital Facility Consumables

The inventory domain may also manage:

```text
Cleaning Supplies
Laundry Supplies
Kitchen Supplies
Office Supplies
Maintenance Materials
PPE
Facility Consumables
```

Keep categories and cost centers separate from clinical inventory.

---

# 275. Asset vs Consumable Classification

Every product should have a clear classification:

```text
CONSUMABLE
MEDICINE
IMPLANT
DEVICE
EQUIPMENT
SPARE_PART
FACILITY_SUPPLY
SERVICE
```

This classification determines lifecycle and accounting behavior.

---

# 276. Inventory Domain Boundaries

Recommended final module boundaries:

```text
Inventory Core
Procurement
Warehouse Management
Pharmacy
Laboratory Supplies
Blood Bank
CSSD
Medical Gas
Biomedical Assets
Facility Supplies
Patient Consumption
Billing Integration
Finance Integration
Supplier Portal
Analytics
Compliance
Identity & Security
Integration Platform
```

Each domain should own its business rules and expose controlled APIs/events.

---

# 277. Anti-Corruption Layer for Integrations

External systems should connect through adapters:

```text
External HIS
     ↓
Integration Adapter
     ↓
Internal Domain
```

Do not allow external schema changes to directly alter core inventory business logic.

---

# 278. Canonical Product Identity

Different systems may use different product IDs.

Create a mapping layer:

```text
Internal Product ID
       │
       ├── HIS Product Code
       ├── Pharmacy Code
       ├── Supplier SKU
       ├── GTIN
       └── Accounting Code
```

This is critical for reliable integrations.

---

# 279. Reconciliation Between Systems

Scheduled reconciliation should compare:

```text
Inventory
vs
Pharmacy
vs
Billing
vs
Finance
```

Find:

```text
Missing Transactions
Duplicate Transactions
Quantity Difference
Value Difference
Unmapped Product
```

---

# 280. Integration Reconciliation Dashboard

Display:

```text
Successful
Pending
Failed
Mismatched
Unmapped
Retried
```

Allow authorized users to investigate and reprocess failures.

---

# 281. Master Data Synchronization

Support controlled synchronization of:

```text
Patients
Departments
Doctors
Products
Suppliers
Cost Centers
Locations
```

Source-of-truth ownership must be explicitly defined.

Example:

```text
Patient → HIS
Employee → HR
Product → Inventory/Pharmacy
Supplier → Procurement
Accounting Code → Finance
```

---

# 282. Production Data Seeding Rules

Production seed data should include only approved configuration:

```text
Roles
Permissions
Units
Statuses
System Configuration
Default Workflows
```

Do not seed fake patients or transactions into production.

---

# 283. Demo / Training Environment

Provide a separate realistic training environment:

```text
Training Hospital
Demo Products
Demo Suppliers
Demo Transactions
```

Users should be able to practice workflows without touching production.

---

# 284. Training and Certification

Create role-specific training checklists:

```text
Storekeeper
Pharmacist
Procurement
Finance
Admin
Auditor
```

Track completion where required.

---

# 285. User Acknowledgement

For high-risk workflows, optionally require users to acknowledge policies before access.

Examples:

```text
Controlled Medicine Policy
Stock Adjustment Policy
Recall Procedure
Emergency Access Policy
```

---

# 286. Internal Audit Module

Auditors should have a dedicated workspace:

```text
Audit Plan
 ↓
Audit Scope
 ↓
Sampling
 ↓
Findings
 ↓
Evidence
 ↓
Corrective Action
 ↓
Follow-up
 ↓
Closure
```

---

# 287. Audit Sampling

Allow auditors to sample:

```text
Random Transactions
High-Value Transactions
High-Risk Products
Large Adjustments
Emergency Issues
Controlled Items
```

---

# 288. Compliance Evidence Repository

Link evidence to:

```text
Audit
Transaction
Supplier
Product
Batch
Disposal
Recall
Calibration
Inspection
```

---

# 289. Corrective and Preventive Action (CAPA)

For significant findings:

```text
Finding
 ↓
Root Cause
 ↓
Corrective Action
 ↓
Preventive Action
 ↓
Owner
 ↓
Due Date
 ↓
Verification
 ↓
Closure
```

---

# 290. Change Management

Production configuration/business-rule changes should use:

```text
Change Request
 ↓
Impact Assessment
 ↓
Approval
 ↓
Implementation
 ↓
Validation
 ↓
Rollback Plan
 ↓
Closure
```

---

# 291. Release Notes

Every production release should document:

```text
Version
Features
Bug Fixes
Database Changes
API Changes
Security Changes
Known Issues
Migration Steps
Rollback Steps
```

---

# 292. Final "Do Not Build" Rules

The production implementation must avoid these anti-patterns:

```text
❌ Direct stock quantity editing
❌ Frontend-only authorization
❌ Deleting transaction history
❌ Reusing patient data unnecessarily
❌ Storing secrets in Git
❌ Hard-coded approval limits
❌ Hard-coded hospital rules
❌ Treating all inventory as identical
❌ Ignoring batch/expiry for applicable items
❌ Counting reserved stock as available
❌ Treating in-transit stock as available
❌ Trusting frontend tenantId
❌ Unlimited API retries
❌ Non-idempotent payment/inventory mutations
❌ Analytics queries that overload production OLTP
❌ Uncontrolled database repair tools
❌ Untracked configuration changes
❌ Using demo data in production
❌ Making clinical decisions automatically from inventory logic
```

---

# 293. Final Production Readiness Scorecard

Before deployment, each domain should be scored:

```text
0 = Not Implemented
1 = Prototype
2 = Functional
3 = Tested
4 = Production Hardened
5 = Audited / Operationally Proven
```

Score separately:

```text
Inventory Core
Procurement
Warehouse
Pharmacy
Laboratory
Blood Bank
CSSD
Medical Gas
Biomedical Assets
Patient Consumption
Finance
Billing
Security
Compliance
Integrations
Analytics
Disaster Recovery
Operations
```

A module should not be declared production-ready merely because its CRUD screens work.

---

# 294. Final Definition of Production Ready

The hospital inventory platform is considered production-ready only when:

```text
Functional
+
Secure
+
Transactional
+
Auditable
+
Traceable
+
Recoverable
+
Observable
+
Interoperable
+
Scalable
+
Tested
+
Operationally Supported
```

The final architecture must prioritize **patient safety, inventory accuracy, traceability, least privilege, financial correctness, and operational continuity** over feature count.

---

# 295. Recommended Final Product Scope

The complete platform should be treated as:

```text
HOSPITAL SUPPLY CHAIN & INVENTORY PLATFORM
│
├── Inventory Core
├── Warehouse Management
├── Procurement
├── Supplier Management
├── Pharmacy Inventory
├── Laboratory Inventory
├── Blood Bank Inventory
├── CSSD / Sterile Supply
├── Medical Gas
├── Biomedical Assets
├── Facility Supplies
├── OT Inventory
├── ICU/Ward Replenishment
├── Crash Cart Management
├── Patient/Procedure Consumption
├── Implant Traceability
├── Billing Integration
├── Finance Integration
├── Insurance/TPA Integration
├── Analytics & BI
├── Compliance & Audit
├── Integration Platform
├── Identity & Security
├── Mobile Operations
└── Administration
```

This is the recommended boundary for the master hospital inventory specification.


---

# 296. Final Gap Analysis — Production Hardening

This section addresses additional gaps that commonly appear only when a hospital inventory platform moves from development into real operational use.

# 297. Hospital Calendar and Operational Context

Inventory demand depends on hospital operations.

Support:

```text
Working Days
Public Holidays
Hospital Events
Scheduled Surgeries
Clinic Sessions
Planned Maintenance
Department Closures
Supplier Holidays
```

Demand planning and delivery-date calculations should use configurable calendars.

---

# 298. Shift-Aware Inventory Operations

Support:

```text
Morning Shift
Evening Shift
Night Shift
Emergency Shift
```

Transactions should optionally record:

```text
shiftId
operatorId
supervisorId
```

Shift-specific dashboards should identify unusual transaction volumes.

---

# 299. Barcode Scanner / Device Management

For enterprise deployments, scanners and mobile devices should be registered.

Track:

```text
Device ID
Device Type
Assigned User
Assigned Department
OS Version
App Version
Last Seen
Status
```

Device states:

```text
ACTIVE
LOST
BLOCKED
RETIRED
```

A lost device must be remotely revocable.

---

# 300. Printer Management

Support operational printers for:

```text
Barcode Labels
Bin Labels
Batch Labels
Patient/Procedure Labels where appropriate
Goods Receipt
Dispatch Documents
Stock Count Sheets
```

Printers should be mapped to:

```text
Hospital
Department
Warehouse
Workstation
```

---

# 301. Label Template Engine

Create configurable templates for:

```text
Product Label
Batch Label
Shelf Label
Bin Label
Asset Label
Transfer Label
Specimen-related supply label where applicable
```

Templates should support:

```text
Barcode
QR
Text
Batch
Expiry
Serial
Location
```

---

# 302. Label Reprint Controls

Reprinting sensitive/high-risk labels should be auditable.

Track:

```text
Original Print
Reprint
Reason
User
Timestamp
Quantity
```

---

# 303. Scanner Error Handling

Barcode workflows must handle:

```text
Unknown Barcode
Expired Product
Wrong Batch
Wrong Location
Duplicate Scan
Unsupported Barcode
Damaged Barcode
Already Issued Serial
```

The UI should explain the problem and provide a safe next action.

---

# 304. Inventory Task Offline Safety

Offline transactions should have strict restrictions.

Safe candidates may include:

```text
Cycle Count Capture
Location Scanning
Draft Pick Lists
Draft Receiving
```

High-risk operations should normally require online server confirmation:

```text
Controlled Drug Issue
Large Stock Adjustment
Write-off
Final Transfer Posting
Financially Significant Transactions
```

Offline policy must be configurable.

---

# 305. Clock and Timestamp Integrity

Never trust client device time for authoritative transactions.

Use server timestamps for:

```text
Issue
Receipt
Approval
Adjustment
Recall
Disposal
Audit
```

Preserve client timestamp separately only when operationally useful.

---

# 306. Time Synchronization Monitoring

Production infrastructure should maintain synchronized clocks.

Incorrect system time can corrupt:

```text
Audit Order
Expiry Calculations
Approval SLA
Integration Events
Security Logs
```

---

# 307. Sequence Number Management

Important documents should have controlled sequences:

```text
PO-2026-000001
GRN-2026-000001
IND-2026-000001
TRF-2026-000001
ADJ-2026-000001
RET-2026-000001
```

Sequence generation must be concurrency-safe.

Do not generate authoritative document numbers only in the frontend.

---

# 308. Fiscal-Year Document Numbering

Support configurable financial/document periods:

```text
2025-26
2026-27
2027-28
```

Rules must be configurable by hospital/tenant.

---

# 309. Number-Series Audit

Track:

```text
Generated
Cancelled
Voided
Unused
```

Do not silently reuse numbers.

---

# 310. Tax Configuration Layer

For applicable jurisdictions, support configurable tax components:

```text
Tax Category
Tax Rate
Tax Inclusive/Exclusive
Tax Exemption
Tax Registration
Tax Jurisdiction
```

Tax calculations must be centralized.

Do not scatter tax formulas across React components.

---

# 311. India-Ready Finance/Tax Integration

For Indian deployments, design an optional integration boundary for:

```text
GST
HSN/SAC
GSTIN
E-Invoice
E-Way Bill
TDS
Credit Note
Debit Note
```

The implementation must follow the hospital's applicable accounting/tax configuration and current legal requirements.

---

# 312. Multi-Currency Procurement

For international suppliers:

```text
Supplier Currency
Exchange Rate
Rate Date
Base Currency
Landed Cost
Currency Variance
```

Historical transactions must preserve the exchange rate used at transaction time.

---

# 313. Landed-Cost Allocation Engine

Support allocation of:

```text
Freight
Insurance
Customs/Duty
Handling
Other Allocable Charges
```

Possible allocation bases:

```text
Quantity
Weight
Volume
Value
Manual Allocation
```

The allocation method must be recorded.

---

# 314. Costing Engine Versioning

Costing rules may change.

Track:

```text
Costing Method
Effective Date
Previous Method
New Method
Reason
Approved By
```

Historical transactions must retain the cost basis used at that time.

---

# 315. Inventory Valuation Closing

Support accounting period close:

```text
Open Period
 ↓
Transaction Review
 ↓
Reconciliation
 ↓
Valuation
 ↓
Approval
 ↓
Close
```

After close, normal users must not modify historical transactions without a controlled reopening/correction process.

---

# 316. Period Lock

Support locks by:

```text
Month
Quarter
Fiscal Year
```

A locked period should reject unauthorized backdated inventory transactions.

---

# 317. Backdated Transaction Controls

Backdated transactions should require:

```text
Reason
Authorization
Audit
```

Apply stricter controls when the requested date falls inside a closed accounting period.

---

# 318. Cut-Off Management

At period end:

```text
Receiving Cut-off
Issue Cut-off
Transfer Cut-off
Return Cut-off
Invoice Cut-off
```

Provide reports for transactions around closing time.

---

# 319. Inventory Reconciliation Framework

Reconcile:

```text
Physical Stock
Inventory Ledger
Warehouse Balance
Pharmacy Balance
Department Balance
Finance Valuation
```

Generate reconciliation exceptions rather than silently correcting differences.

---

# 320. Automated Reconciliation Rules

Examples:

```text
Ledger Quantity != Balance Quantity
PO Received > PO Ordered
Issued Quantity > Available
Reserved Quantity > Physical
Finance Value != Inventory Value
Duplicate Serial
```

Each exception should have:

```text
Severity
Owner
Status
Root Cause
Resolution
Audit
```

---

# 321. Exception Management Center

Create one enterprise exception dashboard:

```text
Stock Exceptions
Procurement Exceptions
Quality Exceptions
Integration Exceptions
Security Exceptions
Financial Exceptions
Workflow Exceptions
```

Statuses:

```text
OPEN
ACKNOWLEDGED
INVESTIGATING
RESOLVED
WONT_FIX
```

---

# 322. SLA for Exceptions

Every important exception can have:

```text
Priority
Due Date
Owner
Escalation
```

Critical stock discrepancies should escalate faster than informational issues.

---

# 323. Rules Engine

Create a configurable rules engine for non-clinical business rules.

Example:

```text
IF
criticalItem = true
AND
availableStock < criticalMinimum

THEN
createCriticalAlert
AND
notifyStoreManager
```

Rules should be versioned and tested before activation.

---

# 324. Rule Simulation

Before activating a rule:

```text
Draft Rule
 ↓
Run Against Historical Data
 ↓
Preview Results
 ↓
Review
 ↓
Activate
```

This reduces accidental alert floods.

---

# 325. Alert Fatigue Controls

Support:

```text
Deduplication
Grouping
Severity
Suppression
Escalation
Digest Notifications
```

Critical alerts must remain visible even when lower-priority alerts are grouped.

---

# 326. Data Quality Dashboard

Track:

```text
Missing SKU
Missing Barcode
Missing Unit
Missing Supplier
Missing Batch
Invalid Expiry
Duplicate Product
Duplicate Supplier
Unmapped Product
Invalid Location
```

Assign data-quality owners.

---

# 327. Master Data Stewardship

Assign ownership:

```text
Product Master → Inventory Steward
Medicine Master → Pharmacy Steward
Supplier Master → Procurement Steward
Cost Center → Finance Steward
Department → Administration
```

Every master-data domain should have a defined source of truth.

---

# 328. Reference Data Versioning

Version:

```text
Units
Product Categories
Transaction Types
Status Codes
Tax Codes
Cost Centers
Storage Types
```

Do not delete reference values used by historical transactions.

Retire them instead.

---

# 329. Data Import Reconciliation

After bulk import:

```text
Source Count
Imported Count
Rejected Count
Duplicate Count
Error Count
```

Require an import summary and audit record.

---

# 330. Safe Bulk Operations

Bulk actions should support:

```text
Preview
Validation
Confirmation
Progress
Partial Failure Handling
Result Report
Audit
```

Never allow a single accidental click to modify thousands of records without confirmation.

---

# 331. Bulk Adjustment Approval

Large bulk adjustments should require elevated approval based on configurable thresholds.

---

# 332. Report Scheduling

Allow authorized users to schedule reports:

```text
Daily
Weekly
Monthly
Custom
```

Recipients must be permission-checked.

Do not send sensitive reports to unauthorized email addresses.

---

# 333. Report Snapshotting

Important management reports may be stored as snapshots:

```text
Report ID
Period
Filters
Generated Data
Generated By
Generated At
```

This preserves an auditable historical view.

---

# 334. Report Access Logging

Track:

```text
Viewed
Downloaded
Exported
Shared
```

for sensitive reports.

---

# 335. Data Masking

Sensitive fields should be masked based on role.

Example:

```text
Full Patient Identifier → Authorized Clinical User
Masked Identifier → Inventory User
No Patient Data → General Storekeeper Dashboard
```

---

# 336. Fine-Grained Permissions

Permissions should be action-specific:

```text
inventory.product.view
inventory.product.create
inventory.product.approve
inventory.stock.view
inventory.stock.issue
inventory.stock.adjust
inventory.stock.writeoff
inventory.stock.export
inventory.audit.view
```

Avoid overly broad permissions such as:

```text
inventory.admin = everything
```

for normal users.

---

# 337. Field-Level Permissions

Certain fields may require additional access:

```text
Purchase Cost
Supplier Contract Price
Patient Identifier
Financial Account
Controlled Drug Balance
```

Support field-level masking where necessary.

---

# 338. API Response Minimization

API responses should return only fields required by the requesting screen/role.

Avoid returning full documents when a list only needs:

```text
id
name
status
quantity
expiry
```

---

# 339. Pagination Safety

Never expose unrestricted endpoints that return the entire inventory database.

Require:

```text
Pagination
Maximum Page Size
Filtering
Sorting
```

Large exports should be asynchronous.

---

# 340. Search Abuse Protection

Search endpoints should protect against:

```text
Expensive wildcard queries
Unbounded regex
Huge result sets
Repeated automated requests
```

Use indexes and safe search strategies.

---

# 341. Database Transaction Boundaries

Define transaction boundaries explicitly.

For example:

```text
Stock Issue Transaction
 ├── Validate
 ├── Ledger Entry
 ├── Balance Update
 ├── Reservation Update
 └── Outbox Event
```

External API calls should generally not be held open inside database transactions.

---

# 342. Saga / Distributed Workflow Readiness

For multi-system workflows:

```text
Inventory
 ↔
Billing
 ↔
Finance
 ↔
Pharmacy
```

Use asynchronous orchestration where a single database transaction cannot span systems.

Every step needs:

```text
Success
Failure
Retry
Compensation
```

---

# 343. Compensation Actions

Examples:

```text
Billing Failed
 → Keep Inventory Transaction
 → Create Reconciliation Task

External Pharmacy Sync Failed
 → Retry
 → Dead Letter
 → Manual Reconciliation
```

Do not blindly reverse inventory merely because an external system failed.

---

# 344. Idempotent Event Consumers

Every event consumer must tolerate duplicate delivery.

Use:

```text
eventId
consumerId
processedAt
```

or an equivalent deduplication mechanism.

---

# 345. Event Schema Registry

Version important events:

```text
StockIssued.v1
StockIssued.v2
StockReceived.v1
```

Consumers should be able to handle supported versions.

---

# 346. Integration Sandbox

Every external integration should have:

```text
Development
Sandbox/Test
Production
```

Never test real transactions against production integrations.

---

# 347. Integration Health Dashboard

Show:

```text
Connection
Authentication
Last Successful Sync
Last Failed Sync
Queue Backlog
Error Rate
API Latency
```

---

# 348. Integration Kill Switch

Authorized administrators should be able to temporarily disable an external integration without disabling the entire inventory system.

Example:

```text
Finance Integration → OFF
Inventory Core → ON
```

The system should queue/reconcile affected events safely.

---

# 349. Data Contract Ownership

Every integration must define:

```text
Source System
Target System
Owner
Schema
Version
Required Fields
Error Handling
Retry Policy
SLA
```

---

# 350. Operational Runbooks

Create runbooks for:

```text
Database Failure
Redis Failure
Queue Failure
Integration Failure
Stock Mismatch
Recall
Controlled Drug Variance
Cyber Incident
Backup Restore
Certificate Expiry
Supplier Failure
Mass-Casualty Mode
```

Each runbook should contain:

```text
Detection
Immediate Action
Owner
Escalation
Recovery
Validation
Post-Incident Review
```

---

# 351. On-Call Support

Enterprise deployments should define:

```text
L1 Support
L2 Application Support
L3 Engineering
Database Support
Security Support
Infrastructure Support
```

Critical incidents need escalation paths.

---

# 352. Incident Severity

Example:

```text
SEV-1
Hospital-wide inventory unavailable

SEV-2
Critical department workflow unavailable

SEV-3
Non-critical feature degraded

SEV-4
Minor defect
```

Severity and response targets must be configurable.

---

# 353. Status Page / Maintenance Communication

For appropriate deployments, provide:

```text
System Status
Scheduled Maintenance
Incident
Degraded Service
Resolved
```

Do not expose sensitive security information publicly.

---

# 354. Release Feature Compatibility Matrix

Before release, verify:

```text
Frontend Version
Backend Version
Database Version
Mobile Version
Integration Version
```

This prevents incompatible client/server deployments.

---

# 355. Mobile App Version Enforcement

For critical workflows, configure minimum supported app version.

Example:

```text
Old App
 ↓
Update Required
 ↓
New App
```

This is especially important when barcode or transaction payload formats change.

---

# 356. API Deprecation Policy

When retiring an API:

```text
Announce
 ↓
Deprecation Period
 ↓
Usage Monitoring
 ↓
Migration
 ↓
Disable
```

Do not silently break external hospital integrations.

---

# 357. Production Configuration Backup

Configuration should be exportable/versioned:

```text
Approval Rules
Workflows
Thresholds
Notification Rules
Tax Rules
Units
Locations
Roles
Feature Flags
```

Configuration backups must not expose secrets.

---

# 358. Configuration Promotion

Support:

```text
Development
 ↓
Testing
 ↓
Staging
 ↓
Production
```

Configuration changes should be promoted rather than manually recreated where practical.

---

# 359. Environment Drift Detection

Detect differences between:

```text
Staging
vs
Production
```

for:

```text
Feature Flags
Workflow Versions
API Configuration
Reference Data
Required Integrations
```

---

# 360. Final Architecture Governance

The implementation should enforce these architectural principles:

```text
Domain Ownership
Least Privilege
Immutable Transactions
Explicit State Machines
Configuration Over Hard-Coding
API Versioning
Event Versioning
Idempotency
Observability
Testability
Recoverability
Traceability
Data Minimization
Operational Safety
```

---

# 361. Final Master Module Map

The complete production platform should now be considered:

```text
HOSPITAL SUPPLY CHAIN PLATFORM
│
├── 01 Inventory Core
├── 02 Warehouse Management
├── 03 Procurement
├── 04 Supplier Management
├── 05 Pharmacy
├── 06 Laboratory Inventory
├── 07 Blood Bank
├── 08 CSSD / Sterile Supply
├── 09 Medical Gas
├── 10 Biomedical Assets
├── 11 Facility Inventory
├── 12 OT Inventory
├── 13 ICU / Ward Replenishment
├── 14 Crash Cart Management
├── 15 Implant & Device Traceability
├── 16 Patient Consumption
├── 17 Billing Integration
├── 18 Finance & Accounting Integration
├── 19 Insurance / TPA Integration
├── 20 Demand Planning
├── 21 Forecasting
├── 22 Quality & Recall
├── 23 Compliance & Internal Audit
├── 24 Supplier Portal
├── 25 Mobile Operations
├── 26 Analytics / BI
├── 27 Integration Platform
├── 28 Identity & Security
├── 29 Notification Platform
├── 30 Workflow / Rules Engine
├── 31 Configuration Management
├── 32 Incident / Operations
└── 33 Administration
```

---

# 362. Production Completion Gate

Before implementation is declared complete, require sign-off from:

```text
Hospital Administration
Pharmacy
Stores/Warehouse
Procurement
Finance
IT
Security
Biomedical Engineering
Laboratory
OT
Nursing
Quality/Compliance
```

For applicable modules also include:

```text
Blood Bank
CSSD
Medical Gas
Insurance/TPA
```

Technical sign-off alone is not sufficient.

---

# 363. Final Acceptance Categories

Acceptance testing must include:

```text
Functional Acceptance
Security Acceptance
Performance Acceptance
Integration Acceptance
Data Migration Acceptance
User Acceptance
Operational Acceptance
Disaster Recovery Acceptance
Audit/Compliance Acceptance
```

---

# 364. Final Production Principle

The system must be designed so that a hospital can answer these questions at any time:

```text
What do we have?
Where is it?
Which batch is it?
When does it expire?
Who owns it?
Who received it?
Who moved it?
Who issued it?
Why was it issued?
Where did it go?
Which patient/procedure used it, when applicable?
What did it cost?
Which supplier supplied it?
Can it be recalled?
Can we prove every transaction?
Can we recover after failure?
Can we operate safely during an outage?
```

If the system cannot answer these questions with controlled, auditable data, the inventory platform should not yet be considered production-complete.


---

# 365. Production UI/UX Specification — MERN Stack Only

This section defines the required attractive, modern, responsive, accessible, and production-ready UI/UX for the hospital inventory platform.

## 365.1 Technology Constraint

The implementation must use the MERN stack:

```text
Frontend:
React.js
React Router
JavaScript / JSX
HTML5
CSS3
Tailwind CSS or CSS Modules
Axios
React Hook Form
Zod or equivalent validation
TanStack Query or equivalent server-state management

Backend:
Node.js
Express.js

Database:
MongoDB
Mongoose

Authentication:
JWT + Refresh Token
HTTP-only Secure Cookies where applicable

No requirement for:
Next.js
Laravel
Django
PHP
Angular
Vue
```

UI libraries may be used only when they work cleanly with React and do not replace the application's domain architecture.

---

# 366. Design Direction

The application should feel like a premium enterprise healthcare product rather than a generic admin template.

Design goals:

```text
Clean
Professional
Calm
Trustworthy
Fast
Information-Dense
Accessible
Responsive
Consistent
Low Cognitive Load
```

Avoid:

```text
❌ Excessive gradients
❌ Excessive shadows
❌ Huge cards everywhere
❌ Decorative animations
❌ Cluttered dashboards
❌ Tiny text
❌ Too many colors
❌ Excessive rounded containers
❌ Fake 3D effects
❌ Dashboard template appearance
```

---

# 367. Visual System

Use a restrained healthcare-oriented visual system.

## Color roles

Do not hard-code colors throughout components.

Use design tokens:

```text
--color-primary
--color-primary-hover
--color-success
--color-warning
--color-danger
--color-info
--color-background
--color-surface
--color-surface-muted
--color-border
--color-text
--color-text-muted
```

Semantic meaning must remain consistent:

```text
Green  → Healthy / Available / Completed
Amber  → Warning / Near Expiry / Attention
Red    → Critical / Blocked / Stockout
Blue   → Information / Processing
Gray   → Neutral / Inactive
```

Do not use color as the only way to communicate status.

---

# 368. Typography

Use a highly readable modern sans-serif font.

Recommended hierarchy:

```text
Page Title
Section Heading
Card Heading
Body
Secondary Text
Caption
Table Text
```

Guidelines:

```text
Page title: strong hierarchy
Body: comfortable line height
Table: compact but readable
Numbers: high visual clarity
```

Important inventory quantities and critical values should use tabular/monospaced numerals where appropriate.

---

# 369. Spacing System

Use a consistent spacing scale.

Example:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Do not create arbitrary spacing for individual screens.

---

# 370. Border Radius and Elevation

Use restrained radius:

```text
Small Controls: 6px
Inputs: 8px
Cards: 10px
Dialogs: 12px
Large Panels: 14px
```

Use subtle elevation only for:

```text
Modal
Dropdown
Popover
Floating Action
Important Summary Card
```

Most dashboard content should rely on spacing and borders instead of heavy shadows.

---

# 371. Application Shell

Desktop layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Top Bar                                                  │
├───────────────┬─────────────────────────────────────────┤
│               │ Breadcrumb                              │
│ Sidebar       │ Page Header                             │
│               │                                         │
│ Navigation    │ Main Content                            │
│               │                                         │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

Required:

```text
Collapsible Sidebar
Top Navigation
Breadcrumbs
Global Search
Notifications
User Menu
Hospital/Tenant Context
Environment Indicator
```

---

# 372. Sidebar Navigation

Organize navigation by domain rather than dozens of flat links.

```text
Dashboard

Inventory
  Products
  Stock
  Batches
  Serial Numbers
  Expiry
  Adjustments
  Transfers

Warehouse
  Locations
  Receiving
  Put-away
  Picking
  Dispatch
  Cycle Counts

Procurement
  Requisitions
  RFQ
  Quotations
  Purchase Orders
  GRN
  Returns

Pharmacy
  Medicines
  Formulary
  Dispensing
  Controlled Items
  Shortages

Clinical Supply
  OT
  ICU/Wards
  Laboratory
  CSSD
  Blood Bank
  Medical Gas
  Implants

Assets
  Biomedical Equipment
  Maintenance
  Calibration
  Spare Parts

Analytics
  Inventory
  Procurement
  Suppliers
  Expiry
  Consumption
  Finance

Administration
  Users
  Roles
  Workflows
  Settings
  Audit
  Integrations
```

Sidebar must support:

```text
Expanded
Collapsed
Mobile Drawer
Keyboard Navigation
```

---

# 373. Global Search

Provide a fast command-style search.

Search across:

```text
Products
SKU
Barcode
Batch
Serial Number
PO
GRN
Supplier
Warehouse
Location
Transfer
Asset
Purchase Requisition
```

Example:

```text
Search "MED-1024"
        ↓
Product
Batch
Available Stock
Locations
Open POs
Expiry
Recent Transactions
```

Do not expose records the current user cannot access.

---

# 374. Command Palette

Desktop users should have an optional command palette:

```text
Ctrl + K
```

Examples:

```text
Create Purchase Requisition
Search Product
Open Stock
Create Transfer
Scan Barcode
View Low Stock
Open Tasks
Open Reports
```

Actions must be permission-aware.

---

# 375. Dashboard Design

The dashboard should prioritize decisions, not decoration.

Recommended hierarchy:

```text
Critical Alerts
        ↓
KPI Summary
        ↓
Stock Health
        ↓
Expiry / Shortage
        ↓
Pending Tasks
        ↓
Consumption / Procurement Trends
        ↓
Recent Activity
```

---

# 376. Executive Dashboard

Use high-value KPIs:

```text
Inventory Value
Available Stock
Critical Stock
Stockout Risk
Near Expiry Value
Open Purchase Orders
Pending Approvals
Supplier Risk
Monthly Consumption
Emergency Purchases
```

Each KPI should support drill-down.

---

# 377. Storekeeper Dashboard

Prioritize operational tasks:

```text
Today's Receipts
Pending Put-away
Pending Picks
Pending Transfers
Low Stock
Expiring Batches
Cycle Counts Due
Exceptions
```

Include prominent action buttons:

```text
Receive
Issue
Transfer
Count
Scan
```

---

# 378. Pharmacy Dashboard

Show:

```text
Medicine Availability
Near Expiry
Shortage
Controlled Inventory
Pending Requisitions
Dispensing Queue
Recall Alerts
```

High-risk alerts must be visually prominent without overwhelming the user.

---

# 379. Procurement Dashboard

Show:

```text
Pending PR
RFQ Awaiting Response
Quotation Comparison
PO Approval
Delayed Suppliers
Backorders
Price Variance
Monthly Spend
```

---

# 380. Warehouse Dashboard

Show:

```text
Inbound
Put-away
Picking
Dispatch
Stock Accuracy
Capacity
Cycle Counts
Pending Tasks
```

---

# 381. KPI Card Design

A KPI card should contain:

```text
Label
Primary Value
Trend
Comparison Period
Status
Optional Drill-down
```

Example:

```text
Critical Stock
18 items
↑ 5 from last week
Needs Attention
```

Do not overload cards with unnecessary icons.

---

# 382. Data Visualization

Use charts only when they communicate a useful relationship.

Recommended:

```text
Line Chart       → Consumption over time
Bar Chart        → Department comparison
Stacked Bar      → Category composition
Donut            → Limited categorical distribution
Heatmap          → Expiry / demand patterns
Area Chart       → Inventory trend
Table            → Exact operational data
```

Avoid 3D charts.

---

# 383. Operational Tables

Tables are central to inventory management.

Required features:

```text
Column Sorting
Filtering
Search
Pagination
Column Visibility
Density Control
Sticky Header
Sticky Important Columns
Bulk Selection
Export
Saved Views
```

Example product table:

```text
☐ SKU
Product
Category
Available
Reserved
Batch
Expiry
Location
Status
Actions
```

---

# 384. Table Density

Provide:

```text
Comfortable
Compact
Dense
```

Store the user's preference locally or in their profile.

---

# 385. Saved Table Views

Users can save:

```text
My Expiring Medicines
Critical Stock
Supplier Delays
My Warehouse
Pending Approvals
```

Saved views should preserve:

```text
Filters
Sort
Columns
Density
```

---

# 386. Advanced Filtering

Use a filter drawer instead of putting 15 inputs above the table.

Support:

```text
Category
Warehouse
Location
Supplier
Batch
Expiry Range
Stock Status
Quantity Range
Date Range
Department
```

Show active filters as removable chips.

---

# 387. Bulk Actions

Bulk action toolbar appears only after selection:

```text
Selected: 24

Transfer
Export
Assign
Approve
Print Labels
Mark for Review
```

Dangerous actions require confirmation and reason.

---

# 388. Product Detail Page

Use a structured detail layout:

```text
Product Header
 ├── Product Name
 ├── SKU
 ├── Barcode
 ├── Status
 └── Quick Actions

Overview
Stock
Batches
Locations
Transactions
Suppliers
Purchase History
Consumption
Expiry
Documents
Audit
```

---

# 389. Stock Detail Visualization

Show inventory flow visually:

```text
Opening
   +
Receipts
   +
Transfers In
   -
Issues
   -
Transfers Out
   ±
Adjustments
   =
Current
```

This helps users understand why the current quantity exists.

---

# 390. Batch Detail Page

Show:

```text
Batch Number
Product
Manufacturer
Received Date
Expiry
Quantity
Available
Reserved
Issued
Location
Quality Status
Recall Status
Documents
Movement History
```

---

# 391. Barcode-First UX

Warehouse workflows should support scanner-first interaction.

Example:

```text
Scan Barcode
      ↓
Recognize Product
      ↓
Select Batch
      ↓
Select Quantity
      ↓
Confirm
```

Do not force users through unnecessary forms when a barcode already identifies the product.

---

# 392. Mobile Scanner Screen

Mobile layout:

```text
┌─────────────────────┐
│ Scan Item            │
│                      │
│       [ CAMERA ]     │
│                      │
│ Manual Entry         │
│                      │
│ Recent Scans         │
└─────────────────────┘
```

Use large touch targets.

---

# 393. Quick Issue Screen

For frequently used supplies:

```text
Scan
 ↓
Product
 ↓
Available Stock
 ↓
Quantity
 ↓
Destination
 ↓
Confirm
```

Use a confirmation summary before committing.

---

# 394. Receiving UX

Receiving should use a progressive workflow:

```text
1. Select PO
2. Scan Product
3. Enter/scan Batch
4. Verify Quantity
5. Verify Expiry
6. Record Discrepancy
7. Quality Check
8. Confirm GRN
```

Show progress:

```text
Step 3 of 8
```

---

# 395. Purchase Requisition UX

Use a simple guided form:

```text
Requesting Department
 ↓
Required Items
 ↓
Quantity
 ↓
Required Date
 ↓
Reason
 ↓
Attachments
 ↓
Review
 ↓
Submit
```

Do not show procurement complexity to normal department users.

---

# 396. Purchase Order UX

Separate:

```text
Header
Supplier
Items
Pricing
Taxes
Delivery
Attachments
Approvals
History
```

Use inline calculations:

```text
Subtotal
Tax
Discount
Freight
Grand Total
```

---

# 397. Quotation Comparison UX

Use side-by-side comparison:

```text
              Supplier A   Supplier B   Supplier C
Price             ₹100        ₹95          ₹110
Delivery          7 days      15 days       5 days
Quality             95%         90%           98%
Warranty            1 yr        1 yr          2 yr
```

Highlight the best value using a semantic indicator, not just color.

---

# 398. Approval Center

One central approval inbox:

```text
Purchase Requests
Purchase Orders
Adjustments
Write-offs
Returns
Supplier Approvals
Configuration Changes
```

Each item should show:

```text
Amount
Requester
Department
Age
Priority
Risk
```

---

# 399. Approval Detail UX

Use a review layout:

```text
Request Summary
 ↓
Business Reason
 ↓
Items
 ↓
Financial Impact
 ↓
Policy Checks
 ↓
History
 ↓
Attachments
 ↓
Approve / Reject / Return
```

Reject/return actions must request a reason.

---

# 400. Workflow Timeline

Every important transaction should have a visual timeline:

```text
Created
   ↓
Submitted
   ↓
Approved
   ↓
Processed
   ↓
Completed
```

Show:

```text
User
Timestamp
Action
Comment
Status
```

---

# 401. Audit Timeline

Audit history should be human-readable:

```text
14:32  Arun
Changed quantity
100 → 80

14:35  Priya
Approved adjustment

14:36  System
Ledger updated
```

Do not make auditors interpret raw JSON as the primary interface.

---

# 402. Status Design

Use consistent status badges:

```text
Available
Reserved
Low Stock
Critical
Expired
Quarantined
Blocked
In Transit
Pending
Approved
Rejected
Completed
Cancelled
```

Status badges should include text plus optional icon.

---

# 403. Empty States

Never show a blank table without explanation.

Example:

```text
No expiring items

Your current filters returned no products
within the selected expiry period.

[Clear Filters]
```

---

# 404. Loading States

Use skeleton loading for:

```text
Dashboard Cards
Tables
Charts
Detail Panels
```

Avoid full-screen spinners for normal navigation.

---

# 405. Error States

Provide useful errors:

```text
What happened?
Why?
What can the user do?
```

Example:

```text
Unable to load stock

The inventory service did not respond.

[Retry] [View Status]
```

Never expose stack traces to normal users.

---

# 406. Success Feedback

Use non-blocking feedback:

```text
Stock transfer created
PO submitted for approval
Batch successfully received
```

For important transactions, show a reference number.

---

# 407. Confirmation Dialogs

Use confirmation dialogs only for meaningful consequences:

```text
Delete/Archive
Write-off
Stock Adjustment
Reject
Cancel PO
Block Batch
Dispose Stock
```

Dialog should explain:

```text
What will happen
Impact
Required reason
```

---

# 408. Destructive Action UX

Use stronger confirmation for irreversible actions.

Example:

```text
Write off 500 units?

This will reduce available inventory and create
an auditable financial adjustment.

Reason: [________________]

[Cancel] [Continue]
```

---

# 409. Form UX

Forms must support:

```text
Clear Labels
Required Indicators
Inline Validation
Helpful Descriptions
Input Formatting
Keyboard Navigation
Error Summary
Draft Save where appropriate
```

Do not rely only on placeholder text as labels.

---

# 410. Multi-Step Form UX

Use steps for complex workflows:

```text
1 Details
2 Items
3 Verification
4 Approval
5 Complete
```

Users should be able to go backward without losing valid data.

---

# 411. Unsaved Changes Protection

If a user leaves a modified form:

```text
Unsaved changes will be lost.

[Stay] [Discard]
```

---

# 412. Form Drafts

Long forms may support autosave drafts:

```text
Draft saved 20 seconds ago
```

Drafts must not accidentally become real transactions.

---

# 413. Accessibility

Target WCAG 2.2 AA principles where practical.

Support:

```text
Keyboard Navigation
Visible Focus
Screen Readers
Semantic HTML
Accessible Labels
Color Contrast
Reduced Motion
Error Announcements
```

All critical workflows must be keyboard usable.

---

# 414. Responsive Design

Desktop:

```text
Full Sidebar
Multi-column Dashboard
Dense Tables
```

Tablet:

```text
Collapsible Sidebar
Responsive Tables
Stacked Forms
```

Mobile:

```text
Bottom/Drawer Navigation
Large Touch Targets
Scanner-first workflows
Card/List alternatives for tables
```

Do not simply shrink the desktop interface.

---

# 415. Mobile Bottom Navigation

Recommended:

```text
Home
Scan
Tasks
Alerts
More
```

Only show the most frequently used actions.

---

# 416. Mobile Quick Actions

Use a floating/quick action menu only when useful:

```text
Scan
Receive
Issue
Transfer
Count
```

Do not let floating controls cover important content.

---

# 417. Responsive Data Tables

On small screens:

```text
Desktop Table
      ↓
Priority Columns
      +
Expandable Row
```

Example:

```text
Medicine A
Available: 120
Expiry: 20 Sep
Status: Low

[View Details]
```

---

# 418. Accessibility for Status

Never communicate:

```text
Red = Critical
Green = Available
```

without text.

Use:

```text
🔴 Critical
🟢 Available
🟠 Near Expiry
```

where icons are accessible and accompanied by text.

---

# 419. Reduced Motion

Respect:

```text
prefers-reduced-motion
```

Avoid animation for critical hospital workflows.

Animations should be:

```text
Short
Purposeful
Non-distracting
```

---

# 420. Micro-Interactions

Use subtle feedback for:

```text
Button press
Successful save
Filter application
Scan success
Row selection
Navigation
```

Never animate important numerical data excessively.

---

# 421. Notification Center UX

Notification categories:

```text
Critical
Warning
Task
Approval
Information
System
```

Allow:

```text
Mark Read
Mark All Read
Filter
Open Related Record
```

---

# 422. Alert Center

Separate urgent operational alerts from ordinary notifications.

Example:

```text
CRITICAL
Oxygen stock below emergency reserve

WARNING
42 medicine batches expire within 30 days

TASK
7 purchase orders awaiting approval
```

---

# 423. Task Inbox UX

Task cards should show:

```text
Task
Priority
Due Date
Owner
SLA
Related Record
Action
```

Allow quick completion for simple tasks.

---

# 424. Personalization

Allow users to configure:

```text
Dashboard Cards
Table Columns
Table Density
Default Warehouse
Default Date Range
Notification Preferences
Theme
```

Do not allow personalization to override security rules.

---

# 425. Dark Mode

Support dark mode if implemented correctly.

Requirements:

```text
Readable Tables
Accessible Contrast
Clear Status Colors
Charts Adapted
No Pure Black/White Flash
```

Do not simply invert colors.

---

# 426. Print UX

Create print-specific layouts for:

```text
PO
GRN
Stock Count
Transfer
Labels
Audit Reports
Management Reports
```

Hide:

```text
Sidebar
Navigation
Interactive Controls
```

during printing.

---

# 427. PDF/Export UX

Export dialogs should allow:

```text
Format
Date Range
Columns
Filters
```

Large exports should show:

```text
Preparing export...
You can continue working.
```

---

# 428. Design System Component Library

Create reusable React components:

```text
Button
IconButton
Input
Select
DatePicker
SearchInput
Badge
Avatar
Card
StatCard
DataTable
FilterDrawer
Modal
Drawer
Tabs
Accordion
Tooltip
Popover
Dropdown
Toast
Alert
Skeleton
EmptyState
ErrorState
Timeline
Stepper
Pagination
Breadcrumb
CommandPalette
```

---

# 429. Domain Components

Build domain-specific reusable components:

```text
ProductStatusBadge
StockQuantity
ExpiryBadge
BatchSelector
BarcodeScanner
LocationSelector
SupplierSelector
WarehouseSelector
ApprovalPanel
StockMovementTimeline
InventoryLedger
PurchaseOrderSummary
```

Keep business rules out of generic UI components.

---

# 430. React Folder Structure

Recommended MERN frontend:

```text
client/
└── src/
    ├── app/
    │   ├── router/
    │   ├── providers/
    │   └── store/
    │
    ├── components/
    │   ├── ui/
    │   ├── forms/
    │   ├── tables/
    │   ├── charts/
    │   └── feedback/
    │
    ├── layouts/
    │   ├── AppLayout.jsx
    │   ├── AuthLayout.jsx
    │   └── MobileLayout.jsx
    │
    ├── features/
    │   ├── dashboard/
    │   ├── inventory/
    │   ├── warehouse/
    │   ├── procurement/
    │   ├── pharmacy/
    │   ├── laboratory/
    │   ├── blood-bank/
    │   ├── cssd/
    │   ├── medical-gas/
    │   ├── biomedical/
    │   ├── suppliers/
    │   ├── analytics/
    │   ├── audit/
    │   └── administration/
    │
    ├── hooks/
    ├── services/
    ├── utils/
    ├── constants/
    ├── validators/
    ├── assets/
    └── styles/
```

---

# 431. React Feature Structure

Each domain should be self-contained.

Example:

```text
features/inventory/
├── pages/
│   ├── InventoryPage.jsx
│   ├── ProductListPage.jsx
│   ├── ProductDetailPage.jsx
│   └── StockAdjustmentPage.jsx
│
├── components/
│   ├── ProductTable.jsx
│   ├── StockSummary.jsx
│   ├── BatchTable.jsx
│   ├── InventoryFilters.jsx
│   └── StockMovementTimeline.jsx
│
├── hooks/
├── api/
├── schemas/
├── utils/
└── routes.js
```

---

# 432. React State Architecture

Separate:

```text
Server State
UI State
Form State
Authentication State
Persistent Preferences
```

Do not put all application data into one global store.

Recommended approach:

```text
Server State → TanStack Query or equivalent
Forms        → React Hook Form
UI State     → Local React state
Global UI    → Small context/store
Auth         → Secure authentication state
```

---

# 433. API Service Layer

React components should not directly scatter Axios calls.

Use:

```text
services/
 ├── apiClient.js
 ├── inventoryApi.js
 ├── procurementApi.js
 ├── supplierApi.js
 └── analyticsApi.js
```

Components call feature hooks/services rather than manually constructing URLs everywhere.

---

# 434. Frontend Authorization

Hide unavailable actions:

```text
No permission
 ↓
Button hidden/disabled
```

But frontend authorization is never sufficient.

The Express backend must independently verify every permission.

---

# 435. React Routing

Use protected route boundaries:

```text
Public Routes
Auth Routes
Authenticated Routes
Role/Permission Routes
```

Example:

```text
/dashboard
/inventory
/inventory/products
/inventory/products/:id
/warehouse/receiving
/procurement/purchase-orders
/admin/users
/audit
```

---

# 436. Backend MERN UI Support Architecture

Recommended Express structure:

```text
server/
└── src/
    ├── config/
    ├── modules/
    │   ├── auth/
    │   ├── inventory/
    │   ├── warehouse/
    │   ├── procurement/
    │   ├── pharmacy/
    │   ├── laboratory/
    │   ├── bloodBank/
    │   ├── cssd/
    │   ├── biomedical/
    │   ├── suppliers/
    │   ├── analytics/
    │   └── audit/
    │
    ├── middleware/
    ├── routes/
    ├── jobs/
    ├── events/
    ├── utils/
    └── app.js
```

---

# 437. UI Performance Requirements

Target:

```text
Fast initial application shell
Lazy-loaded feature routes
Code splitting
Virtualized large tables
Debounced search
Cached reference data
Optimized images
Minimal unnecessary re-renders
```

Large inventory tables should not render thousands of DOM rows simultaneously.

---

# 438. Loading Performance

Use:

```text
Route-level lazy loading
Skeletons
Prefetching
Pagination
Virtualization
Query caching
```

Do not load every hospital module when the user opens the dashboard.

---

# 439. UX Performance Budget

Set measurable targets such as:

```text
Navigation feedback: immediate
Search feedback: < reasonable interactive delay
Common table interactions: responsive
Barcode workflow: minimal steps
Dashboard: progressive loading
```

Exact targets should be validated against real hospital hardware and network conditions.

---

# 440. Error Boundary Strategy

Use React Error Boundaries around major feature areas:

```text
Dashboard
Inventory
Procurement
Pharmacy
Analytics
Administration
```

A failure in one feature should not unnecessarily crash the entire application.

---

# 441. Offline / Network UX

When connection is lost:

```text
Offline
```

Show clearly:

```text
Connection lost
Some actions are unavailable until connection returns.
```

Do not imply a transaction succeeded when the server has not confirmed it.

---

# 442. Double-Submission Protection

Disable or safely deduplicate submit actions:

```text
Submit
 ↓
Processing...
```

Backend idempotency is still required.

---

# 443. Optimistic UI Restrictions

Do not optimistically show success for high-risk mutations such as:

```text
Stock Issue
Stock Adjustment
Write-off
Controlled Drug Transaction
Financial Transaction
```

Wait for authoritative server confirmation.

---

# 444. UX for Concurrent Updates

If two users modify the same record:

```text
This record changed since you opened it.

[Refresh]
[Review Changes]
```

Avoid silently overwriting another user's work.

---

# 445. Accessibility Testing

Test with:

```text
Keyboard Only
Screen Reader
Zoom
High Contrast
Reduced Motion
Mobile Touch
```

Also test table navigation and modal focus management.

---

# 446. Visual Regression Testing

Maintain screenshots for important screens:

```text
Dashboard
Inventory Table
Product Detail
Receiving
PO
Approval
Pharmacy
Mobile Scanner
Reports
```

Run visual regression testing after major UI changes.

---

# 447. UX Analytics

For non-sensitive operational telemetry, measure:

```text
Task Completion Time
Search Success
Form Abandonment
Error Frequency
Barcode Scan Failure
Most Used Actions
```

Do not collect unnecessary patient-identifying information for product analytics.

---

# 448. Usability Testing

Test with actual representative roles:

```text
Storekeeper
Pharmacist
Procurement Officer
Warehouse Manager
Finance User
Hospital Administrator
Auditor
```

Measure:

```text
Time to Complete
Errors
Confusion
Training Required
Steps per Task
```

---

# 449. Design QA Checklist

Before releasing a screen:

```text
✓ Responsive
✓ Keyboard Accessible
✓ Loading State
✓ Empty State
✓ Error State
✓ Success State
✓ Permission State
✓ Long Text Tested
✓ Large Number Tested
✓ Large Table Tested
✓ Slow Network Tested
✓ Mobile Tested
✓ Dark Mode Tested if enabled
✓ Print Tested where required
```

---

# 450. Final UI/UX Principle

The application should optimize for:

```text
Correctness
+
Speed
+
Clarity
+
Safety
+
Traceability
```

The most important workflow should require the fewest safe steps.

The final UI must feel like a purpose-built hospital operations platform, not a generic React admin dashboard.

---

# 451. MERN Implementation Rule

All UI/UX requirements in Sections 365–450 must be implemented using:

```text
React
React Router
JavaScript/JSX
CSS/Tailwind
Node.js
Express.js
MongoDB
Mongoose
```

The UI layer must consume the Express APIs and must never connect directly from React to MongoDB.

The final architecture remains:

```text
React UI
   ↓
React Services / Query Layer
   ↓
Express REST APIs
   ↓
Authentication / Authorization
   ↓
Business Services
   ↓
Mongoose
   ↓
MongoDB
```

This is the required MERN production architecture for the hospital inventory platform.
