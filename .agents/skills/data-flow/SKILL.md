---
name: data-flow-checker
description: |
  Use this skill to verify data flow correctness across a full-stack TypeScript app — from Prisma schema through Express/TypeScript backend to React/TypeScript frontend.

  Trigger when the user wants to:
  - Check if data from backend to frontend is correct, complete, or consistent
  - Verify TypeScript types/interfaces match actual API responses
  - Trace a field across layers: Prisma → service → controller → API → hook → component
  - Detect data loss, field mismatch, wrong transforms, missing null guards, or type drift
  - Audit a feature end-to-end ("check booking flow", "why is X undefined on frontend", "does my DTO match Prisma?")

  Trigger even without "data flow" keywords — "why is X undefined", "frontend not getting Y", "does my type match the response", or any pasted backend+frontend code are strong signals.
---

# Data Flow Checker

This skill performs systematic end-to-end analysis of how data moves through a full-stack TypeScript application — from Prisma schema through Express backend to React frontend — and produces a structured text report of all issues found.

## Mental Model

Think of the data flow as a pipeline with discrete layers. Each layer can introduce bugs: wrong fields selected, incorrect transformations, type drift, missing null guards, or frontend assumptions that don't match what the API actually sends. Your job is to walk this pipeline and flag every point where something could break or already is broken.

```
Prisma Schema
    ↓  (select / include)
Service Layer       ← transforms, filters, business logic
    ↓  (returns DTO / plain object)
Controller Layer    ← maps to HTTP response
    ↓  (JSON over REST)
API Contract        ← what the frontend actually receives
    ↓  (fetch / axios)
React Hook / Store  ← parses, maps, stores state
    ↓
Component           ← renders, may transform further
```

## Step 1: Gather Context

Before analyzing, understand what the user wants to check. If they haven't provided code yet, ask for:
- The **feature or field** they want to trace (e.g. "the court booking detail page")
- Relevant **backend files**: Prisma schema (or model), service, controller/route handler
- Relevant **frontend files**: API call (fetch/axios), React hook or query, component

If partial code is provided, work with what's available and note which layers are missing from the analysis.

## Step 2: Identify Each Layer

Map out the layers that exist in the provided code. For each layer, extract:

| Layer | What to extract |
|---|---|
| Prisma model | Fields, types, relations, optional (`?`) fields |
| Service | `select`/`include` clauses, any transforms, return type |
| Controller | What it passes to `res.json()`, any mapping or filtering |
| TypeScript DTO/interface | Declared shape vs. actual returned shape |
| Frontend API call | Assumed response type, any `.data` unwrapping |
| React hook/store | How data is stored, mapped, or derived |
| Component | How fields are accessed, rendered, or conditionally shown |

## Step 3: Trace the Data

Walk the pipeline field by field for the key data objects. For each field or object:
1. Does it exist at the source (Prisma model)?
2. Is it selected/included in the query?
3. Is it included in the service return value?
4. Is it present in the controller response?
5. Does the frontend TypeScript type declare it correctly?
6. Is it accessed correctly in the hook and component?

Pay special attention to:
- **Fields selected in Prisma but not returned** (accidentally dropped in service transform)
- **Fields returned by API but not typed on frontend** (missing from interface → typed as `any` or causes TS error)
- **Optional fields (`field?`) accessed without null checks** on frontend
- **Nested relations** that require `include` but are missing from the query
- **Type mismatches**: backend returns `number`, frontend types it as `string`; backend returns `Date`, frontend gets `string` (JSON serialization)
- **Array vs. single object** confusion
- **Enum mismatches**: Prisma enum vs. frontend string literal union
- **DTO transformations** that rename or reshape fields inconsistently
- **`res.json({ data: result })` wrapping** that the frontend forgets to unwrap

## Step 4: Check TypeScript Type Consistency

Compare declared types against actual runtime shapes:
- Backend: declared return type of service/controller vs. what Prisma actually returns
- API boundary: response body shape vs. frontend interface
- Frontend: interface vs. how fields are actually used in hooks and components

Flag any place where types are declared as `any`, where type assertions (`as SomeType`) are used without validation, or where the declared interface has fields that the API never actually sends.

## Step 5: Verify Data Handling Correctness

Beyond types, check for logical correctness:
- **Filtering/mapping errors**: `.filter()` or `.map()` that may silently drop or corrupt data
- **Default values**: are missing fields handled with sensible defaults or will they cause runtime errors?
- **Async handling**: are loading/error states handled so the component doesn't render with undefined data?
- **Stale data**: is the frontend re-fetching when it should, or displaying cached/stale values?
- **Mutation vs. query sync**: after a mutation (POST/PUT/DELETE), is the frontend state updated correctly?

## Step 6: Produce the Report

Write a structured report. Keep it scannable and actionable. Use this template:

---

## Data Flow Analysis Report — [Feature Name]

### Layers Analyzed
List which files/layers were provided and which were absent.

### Pipeline Summary
One-paragraph description of how data flows through this feature.

### Issues Found

For each issue:

**[SEVERITY] Issue title**
- **Layer**: where the problem occurs (e.g. Service → Controller)
- **Description**: what is wrong and why it matters
- **Evidence**: the specific code or field that demonstrates the issue
- **Fix**: concrete suggestion to resolve it

Severity levels:
- `[CRITICAL]` — will cause runtime errors or data corruption
- `[WARNING]` — likely causes bugs in edge cases or with certain data
- `[INFO]` — type drift, inconsistency, or style issue that should be cleaned up

### Fields Trace Summary
A table showing each key field and its status across layers:

| Field | Prisma | Service | Controller | Frontend Type | Component | Status |
|---|---|---|---|---|---|---|
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `courtName` | ✅ | ❌ not selected | — | ✅ typed | ⚠️ renders undefined | BROKEN |

### Recommendations
Prioritized list of fixes, starting with CRITICAL issues.

---

## Tone and Depth

Be specific — quote the actual field names, line patterns, and type declarations from the code. Avoid vague statements like "there might be a type issue." Point to the exact discrepancy.

If a layer is missing (e.g. user only provided the service but not the frontend), note it clearly: "Frontend types were not provided — the following analysis covers backend layers only."

When the code is clean and correct, say so. Don't manufacture issues. A short report that says "no critical issues found" is a valid and useful output.

## Common Patterns in Express + Prisma + React Stack

### Prisma `select` drops relation fields
```ts
// BAD: select is used but relation is not included
const booking = await prisma.booking.findUnique({
  where: { id },
  select: { id: true, startTime: true } // court is NOT selected
})
// result.court → undefined, even though the relation exists
```

### Date serialization drift
```ts
// Backend: Prisma returns Date objects
// API response: JSON.stringify converts to ISO string
// Frontend interface: typed as Date → WRONG, it's actually string
interface Booking {
  createdAt: Date // ← should be string
}
```

### DTO wrapping forgotten on frontend
```ts
// Controller wraps:
res.json({ data: bookings, total })
// Frontend types it as:
const bookings: Booking[] = await res.json() // ← missing .data unwrap
```

### Optional relation accessed without guard
```ts
// Prisma model: court Court? (optional relation)
// Frontend component:
<p>{booking.court.name}</p> // ← crashes if court is null
```

Refer to these patterns when explaining issues — they help users recognize the problem category quickly.
