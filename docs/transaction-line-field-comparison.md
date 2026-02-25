# Transaction Line Field Comparison

Comparison between **TransactionMainForm** (server-to-form mapping) and **transactionLinesDefaultForm** (default when adding new line).

| Field | TransactionMainForm | Default Form | Schema | Match? |
|-------|---------------------|--------------|--------|--------|
| transactionGroupId | ✅ (from loaded group) | ❌ not in default | ✅ in schema | N/A — added at submit for new lines |
| transactionLinesId | ✅ `line._id` | ✅ `""` | ✅ | ✅ |
| employeeId | ✅ `line.employeeId ?? ""` | ✅ `""` | ✅ | ✅ |
| productId | ✅ `line.productId ?? ""` | ✅ `""` | ✅ | ✅ |
| isVehicle | ✅ `line.isVehicle ?? false` | ✅ `false` | ✅ | ✅ |
| carLicense | ❌ missing | ✅ `""` | ✅ | **❌ MISMATCH** |
| carLicenseId | ✅ `line.carLicenseId ?? ""` | ❌ missing | ❌ not in schema | **❌ MISMATCH** |
| weightVehicleIn | ✅ | ✅ | ✅ | ✅ |
| weightVehicleOut | ✅ | ✅ | ✅ | ✅ |
| weight | ✅ | ✅ | ✅ | ✅ |
| price | ✅ | ✅ | ✅ | ✅ |
| totalAmount | ✅ | ✅ | ✅ | ✅ |
| isSplit | ✅ | ✅ | ✅ | ✅ |
| farmerRatio | ✅ | ✅ | ✅ | ✅ |
| employeeRatio | ✅ | ✅ | ✅ | ✅ |
| farmerAmount | ✅ | ✅ | ✅ | ✅ |
| employeeAmount | ✅ | ✅ | ✅ | ✅ |
| isTransportationFee | ✅ | ✅ | ✅ | ✅ |
| transportationFee | ✅ | ✅ | ✅ | ✅ |
| transportationFeeAmount | ✅ | ✅ | ✅ | ✅ |
| transportationFeeFarmerAmount | ✅ | ✅ | ✅ | ✅ |
| transportationFeeEmployeeAmount | ✅ | ✅ | ✅ | ✅ |
| farmerPaidType | ✅ | ✅ | ✅ | ✅ |
| employeePaidType | ✅ | ✅ | ✅ | ✅ |
| isHarvestRate | ✅ | ✅ | ✅ | ✅ |
| harvestRate | ✅ | ✅ | ✅ | ✅ |
| promotionRate | ✅ | ✅ | ✅ | ✅ |
| promotionTo | ✅ | ✅ | ✅ | ✅ |
| promotionAmount | ✅ | ✅ | ✅ | ✅ |
| totalNetAmount | ❌ not in mapping | ❌ not in default | ✅ in schema | N/A — computed at submit |

## Fixes Applied

1. **TransactionMainForm**: Map `carLicense` (not `carLicenseId`). The form and schema use `carLicense` for the license plate text. `carLicenseId` is a server-side reference and not used in the form UI.
2. **transactionLinesDefaultForm**: Already had all required fields; no changes needed.
