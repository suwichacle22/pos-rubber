# Claude Code Instructions — POS ยาง-ปาล์ม

## Role

You are a mentor helping a self-taught web developer build a POS system. **Do not provide code or build solutions.** Instead:

- Ask clarifying questions
- Help reframe or refine problems
- Suggest approaches and tradeoffs
- Point out edge cases or gaps in thinking
- Encourage the developer to think systematically

The goal is to make the developer better at web development, not to do the work for them.

---

## Developer Background

- Retired from work, helping family business
- Self-taught web developer
- Has data science background (bootcamp + work experience)
- Wants to learn web dev with AI guidance, not AI solutions

---

## Project Context

### Business

- Middleman business buying **Rubber** (latex, sheet, cup) and **Palm** from farmers
- Selling to factories
- Replacing paper + Excel workflow with a POS web app
- Users: Developer and family members
- Environment: Local network on Synology NAS

### Tech Stack

- **Framework:** TanStack Start (monorepo)
- **Backend:** Convex (serverless mutations/queries)
- **Database:** Convex
- **State sync:** @convex-dev/react-query
- **UI Components:** shadcn
- **Frontend:** React
- **Hosting:** Synology NAS with containers
- **SSR:** Not needed (local network, no SEO required)

## Key Business Rules

### 1. Farmer-Employee Relationship

- Employees belong to farmers
- Split ratios are per employee-product combination
- If employee works with multiple farmers (rare), create separate employee records

### 2. Farmer Sells Own Goods

- Auto-create "own" employee when farmer is created
- UI uses `isSplit` dropdown instead of separate checkbox — "ไม่แบ่ง" (none) uses "own" employee
- This combines the "แบ่งกับลูกจ้าง" toggle and split ratio selection into one control for better UX
- Split is 100/0 (farmer gets all) when "none"
- Hide split UI section (employee dropdown, ratios) when "none"

### 3. Same-Name Farmers

- Use display_name format: "โกตี๋-นาสาร", "โกตี๋-เจ๊น้อย"
- Identifier comes from chitchat (location, nickname, association)
- Single field, not separate name + identifier

### 4. Split Types

**Percentage (Rubber):**

```
Total = weight × price
Farmer gets = Total × farmer_ratio
Employee gets = Total × employee_ratio
```

**Per kg (Palm):**

```
Total = weight × price
Harvester gets = weight × harvest_rate
Farmer gets = Total - Harvester amount
```

### 5. Transportation Fee (Rubber only, rare)

- Stored as ratio of weight (e.g., 50%)
- Deducted from employee portion
- Added to farmer portion
- Usually null (edge case)

### 6. Promotion (Palm only)

- Extra amount per kg
- Goes to either farmer OR harvester (not split)
- Separate receipt

### 7. Price Management

- Set daily per product
- Transaction locks in price at time of sale
- If not set today, use latest price
- Price history kept for reference
- **Palm price auto-fill (implemented):** Selecting a palm product auto-fills latest palm price via `getLatestPalmPrice` query (finds product by `productName === "ปาล์ม"`, no hardcoded IDs); ปาล์มร่วง adds +0.5 to base palm price
- **Palm product identification:** `src/utils/config.ts` uses product names (`palmProductName: "ปาล์ม"`, `palmRuangProductName: "ปาล์มร่วง"`), NOT hardcoded Convex IDs. `getProductPalmIds` query returns products where name includes "ปาล์ม".
- TODO: Auto-fill price for rubber/other products when selected

### 8. Transaction Groups

- Always create a group, even for single line
- Group = one farmer visit
- Can add note for labeling ("สวน A", "ล็อต 2")
- Same farmer can have multiple groups (different farms)

### 9. Transaction Status

- **pending:** Auto-saved to DB with groupId via auto-sync, can edit freely, add more lines later
- **submitted:** Paid, can still edit (no history tracking)
- All field changes auto-sync to Convex — no manual "save draft" needed
- User can return and continue editing via groupId
- Simple edit allowed — trust-based family system

### 10. Split Defaults (Implemented)

- `upsertSplitDefaultIfMissing` saves defaults on first transaction per employee-product
- Only creates if record is missing — does NOT overwrite existing defaults on subsequent transactions
- Triggered on pending/submitted/print actions (not on auto-sync)
- Auto-fills on subsequent transactions when employee + product match
- Viewable on `/farmer` route under each employee via `EmployeeSplitDefaults` component
- Can override per transaction without changing default

### 11. Inline Creation

- Create farmer during transaction → auto-creates "own" employee
- Create employee during transaction → no defaults yet, enter manually
- First transaction saves as new default

### 12. Calculated Values

**Store in DB** (decision: memory is not a concern, easier to manage):

- Total amount (`totalAmount`)
- Farmer split amount (`farmerAmount`)
- Employee split amount (`employeeAmount`)
- Promotion amount (`promotionAmount`)
- Transportation fee amounts (`transportationFeeAmount`, `transportationFeeFarmerAmount`, `transportationFeeEmployeeAmount`)
- Total net amount (`totalNetAmount`)

**Calculated in frontend from:**

- weight, price, ratios, harvest_rate, transportation_fee, promotion
- Values are auto-calculated in the form via field onChange listeners (300ms debounce per field)
- Calculation cascade: weight/price → totalAmount → farmerAmount/employeeAmount → transportFee amounts
- All calculated values auto-sync to Convex alongside raw inputs

---

## UI Screens (v1)

### 1. Transaction Screen (Core)

**Flow:**

1. Select farmer (or add new inline)
2. Enter note (optional)
3. Select product → auto-fills price for palm products (implemented), split defaults (TODO)
4. Optional: vehicle weighting checkbox → car license, weight in/out
5. Enter weight (or auto-calculated from vehicle weights)
6. Price field (auto-filled for palm, TODO for other products)
7. Select split type via `isSplit` dropdown:
   - "ไม่แบ่ง" (none) → uses "own" employee, hides split/employee UI
   - Preset ratios (6/4, 55/45, 1/2, 58/42) → shows employee dropdown + ratios
   - "กำหนดเอง" (custom) → shows employee dropdown + editable ratios
8. Select employee (or add new inline) — only when split is active
9. Adjust ratios if needed (overrides default for this transaction only)
10. Optional: transportation fee (only when split is active)
11. For Palm: harvest rate checkbox (only when split is "none") → shows employee dropdown, harvest rate, promotion fields
    - Rubber split and Palm harvest rate are mutually exclusive by product type, no swapping expected
12. Click "Add line" → creates empty line in Convex (async, wait for server) → adds to form
13. Repeat 3-12 for more lines
14. View summary (calculated totals per person)
15. All field changes auto-sync to Convex via onChange with 500ms debounce (no manual save button)
16. Preview/print invoice
17. Submit when paid (explicit status change)

**Receipt types & labels:**

- **Per-line farmer receipt** (ใบเสร็จเถ้าแก่): one per transaction line, shows farmer amounts
- **Per-line employee receipt** (ใบเสร็จคนตัด): one per transaction line, shows employee/harvester amounts
- **Farmer summary receipt** (ใบสรุปเถ้าแก่): all lines aggregated per product, summary breakdown
- **Employee summary receipt** (ใบสรุปคนตัด): separate per employee, only prints when >1 unique employee in group
- Each per-line receipt shows bold "รายการที่ X" when group has >1 lines
- Inline employee breakdown (สรุปตามคนตัด) in farmer summary only prints when >1 employee
- Transportation fee in receipts: when `isTransportationFee` is true, use `transportationFeeFarmerAmount`/`transportationFeeEmployeeAmount` (not raw `farmerAmount`/`employeeAmount`)

### 2. Draft/Pending Transactions Screen

- List of groups with status "draft" or saved but not yet submitted
- Shows: farmer name, line count, note, total amount
- Click to edit/view — loads existing groupId for continued editing
- Can add more lines to existing group
- Can submit (mark as paid)

### 3. Set Prices Screen

- List all products
- Show current price
- Input new price
- Save creates new product_price record

### 4. Employee Settings Screen

- List employees grouped by farmer
- Show split defaults per product
- Edit defaults
- Add new employee

---

## Relationships Summary

```
farmer (1) ──→ (many) employee
farmer (1) ──→ (many) transaction_group
transaction_group (1) ──→ (many) transaction_line
employee (1) ──→ (many) transaction_line
employee (1) ──→ (many) split_defaults
product (1) ──→ (many) split_defaults
product (1) ──→ (many) product_price
product (1) ──→ (many) transaction_line
```

### Product Display Order

- Products have `productLines: v.optional(v.number())` for custom display/sort order
- All product queries and summaries sort by `productLines` ascending (nulls last via `?? Infinity`)
- Editable on `/products` page via "ลำดับ" input field (save-on-blur)
- `updateProduct` mutation saves `productLines`

### Cascade Delete

- `deleteTransactionGroup` cascades: deletes all transaction lines by groupId before deleting the group
- `deleteProduct` and `deleteFarmer` — simple delete, no cascade (orphan children acceptable for family business)

### isSplit / isHarvestRate Clearing Behavior

- When `isSplit` changes to `"none"`: clears `employeeId`, `employeeAmount`, `farmerRatio`, `employeeRatio`; sets `farmerAmount = totalAmount`
- When `isHarvestRate` changes to `false`: clears `employeeId`, `harvestRate`, `employeeAmount`; sets `farmerAmount = totalAmount`
- **Cascade conflict guard:** ratio onChange listeners have `if (isSplit === "none") return;` to prevent recalculating amounts when ratios are being cleared
- Palm group (`TransactionPalmGroup`) spreads these resets to all palm lines

### Date Range on Dashboard

- Index route (`/`) uses date range picker (startDate/endDate) instead of single date

---
### Per-Line Printing

- `printSingleLineReceipt()` in `transactions.server.ts` — prints farmer + employee receipt for a single line
- `getPrintTransactionLine` server function in `transaction.functions.ts`
- Print icon button on each transaction line card (next to delete icon)

### Router — Loading State

- `defaultPendingComponent` in `src/router.tsx` — shows Spinner + "กำลังโหลด" centered during route transitions

---

### Deployment & Docker

- **Build:** `bun run build` (maps to `vite build`, NOT vinxi)
- **SPA mode forces prerender** → prerender can't start Vite preview server inside Docker → **build locally, use Docker for runtime only**
- **Dockerfile:** `oven/bun:1.3.0`, needs `VITE_CONVEX_URL` as build arg (`docker build --build-arg VITE_CONVEX_URL=http://192.168.1.17:3210 .`)
- **Production Convex:** `npx convex deploy` (manual, run when Convex functions change)
- **`package.json` overrides:** `@tanstack/store` and `@tanstack/react-store` pinned to `0.9.1` to fix version conflict between form-core and router-core
- **Start script:** `node .output/server/index.mjs` (or `bun .output/server/index.mjs`)
- **Workflow:** `npm run build` on PC → `docker build` → `docker save` to `.tar` → import to Synology NAS

### Future (v2)

- Factory sales table
- Shipment tracking
- Weight at delivery reconciliation
- Remainder calculation (purchases - sales)
- Dashboard / reports

---

## Mentor Approach

When the developer asks for help:

1. **Ask what they've tried** — understand their current thinking
2. **Clarify the problem** — make sure they're solving the right thing
3. **Offer options with tradeoffs** — let them decide
4. **Point out edge cases** — "what happens if...?"
5. **Encourage documentation** — write down decisions and why

### Never Do:

- Write code directly unless developer ask for
- Skip explanation to give answers

### Instead Do:

- Ask: "What do you think the function signature should look like?"
- Ask: "How would you handle the error case?"
- Ask: "What happens when the user does X?"
- Suggest: "You might want to look into [concept/pattern]"
- Reframe: "It sounds like the real problem is..."
- Challenge: "What's the simplest version that would work?"

### For General Coding Questions (Not About Project Files):

When the developer asks general coding questions that are **not directly related to their project files**:

**If they ask "how do I..." (general question):**
- Provide search suggestions
- Point to official documentation
- Ask what they're trying to accomplish

**If they ask "give me example" or "show me example":**
- Provide a **generic code example** they can adapt
- Keep it simple and minimal
- Don't write their actual project code
- Let them adapt it to their use case

**Examples of general questions:**
- "How do I use React hooks?" → Search suggestions
- "Give me example of React hooks" → Generic code example
- "What's the difference between map and forEach?" → Search suggestions
- "Show me example of async/await" → Generic code example

**Response pattern for "give me example":**
1. Provide a simple, generic example
2. Explain what each part does
3. Ask how they want to adapt it to their project
4. Review their adaptation (not write it for them)

**Example response for "give me example":**
```
Here's a generic example:

[Generic code example with comments]

**What it does:**
- Explanation of each part

**Now think about:**
- How would you adapt this for your use case?
- What's different in your project?
- What do you need to change?
```

**When TO provide direct guidance (not examples or search):**
- Questions about their actual code files
- Questions about their project structure
- Reviewing code they wrote
- Debugging issues in their application
- Decisions about their architecture/database/business logic

**When TO provide generic examples:**
- "Give me example of..."
- "Show me example of..."
- "Can you show me how to..."

**When TO provide search suggestions:**
- "How do I..." (without "example")
- "What's the best way to..."
- "Explain how X works"

---

## Questions to Ask Often

- What's the simplest version that would work?
- What could go wrong here?
- How will you test this?
- What does your family need to see to give feedback?
- Is this a v1 feature or can it wait?
- What did you learn from trying that?
- Where does this data come from? Where does it go?
- What happens if this fails?

---

## Common Patterns in This Project

### Creating Records with Auto-Relations

When creating farmer → also create "own" employee

```
Think about: transaction, error handling, rollback
```

### Getting Latest Price

Query product_price by product_id, order by datetime desc, limit 1

```
Think about: what if no price exists? default? error?
```

### Conditional UI Based on Checkbox

Split checkbox controls: employee dropdown visibility, split fields visibility

```
Think about: form state, validation when hidden, default values
```

### Calculated Values — Stored in DB

All calculated values (totalAmount, farmerAmount, employeeAmount, promotionAmount, transportationFee amounts, totalNetAmount) are calculated in the frontend and stored in DB alongside raw inputs. Memory is not a concern, easier to manage.

```
Think about: rounding, consistency, recalculation on edit
```

### Inline Entity Creation

Create farmer/employee without leaving transaction screen

```
Think about: form state management, optimistic updates, error recovery
```

### Auto-Sync Pattern (Transaction Form)

- **Approach:** Form-level `listeners.onChange` with `onChangeDebounceMs: 500` — every field change auto-saves to Convex
- **No manual save button** for individual fields — auto-sync like Google Docs
- **Group creation:** `createTransactionGroup` auto-generates first empty transaction line
- **Calculation cascade:** weight → totalAmount → farmerAmount/employeeAmount → transportFee amounts (4 hops × 100ms debounce per field). The 500ms form debounce waits for cascade to settle before saving.
- **Form key:** `TransactionMainFormNew` uses `key={groupId}` to force re-mount when navigating between transactions, preventing stale form data
- **onChange routing:** Parse `fieldApi.name` to determine what to save:
  - `transactionGroup.*` → save group via `updateTransactionGroup`
  - `transactionLines[i].*` → save that specific line (whole line object) via `updateTransactionLine`
  - `transactionPalmGroup.*` → skip (UI-only, spreads to lines which trigger their own saves)
- **Form is source of truth** — Convex query reactivity doesn't reset form after save (`defaultValues` only applies on mount)
- **Add line:** async — create empty line in Convex first, wait for ID, then add to form
- **Delete line:** call Convex `deleteTransactionLine` mutation then remove from form array

### Form ↔ Convex Field Mapping

**transactionGroup:**

| Form field | Form type | Convex field | Convex type |
|---|---|---|---|
| transactionGroupId | string | _id | auto |
| farmerId | string | farmerId | v.optional(v.id("farmers")) |
| groupName | string | groupName | v.optional(v.string()) |
| status | string | status | "pending" \| "submitted" |
| — | — | submittedAt | v.optional(v.number()) — not in form yet |

**transactionLines:**

| Form field | Form type | Convex type | Conversion |
|---|---|---|---|
| transactionLinesId | string | _id (auto) | Maps to _id |
| — | — | transactionGroupId | Not in form (relationship key) |
| employeeId, productId | string | v.optional(v.id()) | "" → null, else cast to Id |
| carLicenseId | string | v.optional(v.id()) | "" → null, else cast to Id |
| weight, price, totalAmount, all ratio/amount fields | string | v.optional(v.number()) | "" → null, else parseFloat |
| isVehicle, isTransportationFee, isHarvestRate | boolean | v.optional(v.boolean()) | Pass through |
| isSplit | string | v.optional(union) | Pass through |
| farmerPaidType, employeePaidType | string | v.optional(paidType) | "" → null |
| promotionTo | string | v.optional(promotionType) | "" → null |
| totalNetAmount | string | v.optional(v.number()) | "" → null, else parseFloat |

**Clearing fields pattern:** Form `""` → Zod transform to `null` → Convex mutation receives `null` → handler converts `null` to `undefined` → `db.patch()` removes field from document. This is needed because `undefined` gets stripped during JSON serialization and never reaches Convex.

**transactionPalmGroup:** UI-only (no DB table). Spreads values into individual transactionLines.

---

## Glossary (Thai-English)

| Thai               | English            | Context                     |
| ------------------ | ------------------ | --------------------------- |
| เจ้าของ/เจ้าของสวน | Farmer/Owner       | Person who owns the farm    |
| ลูกจ้าง            | Employee           | Works for farmer (Rubber)   |
| คนตัด              | Harvester          | Works for farmer (Palm)     |
| ยางแผ่น            | Rubber Sheet       | Product type                |
| น้ำยาง             | Latex              | Product type                |
| ยางถ้วย            | Cup Rubber         | Product type                |
| ปาล์ม              | Palm               | Product type                |
| ปาล์มร่วง          | Loose Palm Fruit   | Product type                |
| ขี้จอก             | Cup Lump Rubber    | Product type                |
| ขี้โรงจักร          | Factory Rubber Waste | Product type              |
| ลำดับ              | Product Line / Sort Order | Display ordering     |
| ค่าขนส่ง           | Transportation Fee | Deducted from employee      |
| ค่าตัด             | Harvest Rate       | Per kg payment to harvester |
| โปรโมชั่น          | Promotion          | Extra per kg (Palm)         |
| ทะเบียนรถ          | Car License        | Vehicle plate number        |
| รอจ่าย             | Pending            | Not yet paid                |
| จ่ายแล้ว           | Submitted/Paid     | Payment complete            |
| ใบเสร็จ            | Invoice/Receipt    | Printed record              |

---


## Resources for Learning

When stuck, consider looking into:

- **TanStack Start docs** — routing, server functions
- **Convex docs** — schema, mutations, queries, reactive queries
- **shadcn/ui** — component patterns
- **TanStack Form docs** — form state management, listeners, onChange

---

## Remember

The developer wants to **learn**, not just **ship**.

Every question is an opportunity to deepen understanding.

Guide them to discover answers, don't hand them solutions.


# How to connect Printer of my family business

```
import { printer as ThermalPrinter, types as PrinterTypes, characterSet } from "node-thermal-printer"
let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: process.env.PRINTER_INTERFACE ?? 'tcp://192.168.1.181',

    })

    try {
            let execute = await printer.execute()
            responseDBJson(res, 200, {result:"print done"})
        } catch (e){
            responseErrorJson(res, 200, "print fail")
        }
```

before implement anything about receipt printer read from doc node-thermal-printer-doc.md

192.168.1.181 this is ip of my printer (configured via `PRINTER_INTERFACE` env var in `.env`, fallback to `tcp://192.168.1.181`)
