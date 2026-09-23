# Homepage Size Correction Plan

## Overview

The current implementation renders at ~143% of the target visual size. The user confirms that at 70% browser zoom the screen matches `screens/HomepageScreen.png`. This means every dimension needs to be scaled down by approximately 30% to match the screenshot at 100% zoom.

This is a **classes-only** change. No logic, routing, state, or component APIs change.

---

## Measured deltas (current → target)

Derived by comparing the target screenshot proportions against current Tailwind values:

| Element | Current | Target | Notes |
|---|---|---|---|
| Sidebar width | `w-80` (320px) | `w-48` (192px) | Screenshot sidebar is ~180px wide |
| Sidebar item height | `h-10` (40px) | `h-8` (32px) | Tighter rows in screenshot |
| Sidebar font size | `text-[15px]` | `text-sm` (14px) | Slightly smaller |
| Sidebar pt | `pt-5` | `pt-3` | Less top gap |
| Filter field height | `h-20` (80px) | `h-14` (56px) | Fields are shorter in screenshot |
| Filter label font | `text-sm` | `text-xs` | Small muted label |
| Filter value font | `text-base` | `text-sm` | Value text |
| Filter px | `px-4` | `px-3` | Tighter horizontal padding |
| Filter grid gap | `gap-5` | `gap-3` | Tighter column gaps |
| Filter mb | `mb-8` | `mb-6` | Less space below filters |
| Cover width | `w-44` (176px) | `w-28` (112px) | Screenshot cover ~100-110px wide |
| Book item gap | `gap-4` | `gap-3` | Tighter gap between cover and text |
| Book grid gap | `gap-x-6 gap-y-8` | `gap-x-5 gap-y-6` | Less space between items |
| Book title | `text-xl` | `text-base` | Screenshot title is ~16px |
| Author line | `text-base` | `text-sm` | Smaller author text |
| Synopsis | `text-sm` | `text-xs` | Smaller synopsis |
| Format | `text-sm` | `text-xs` | Smaller format text |
| Genre links | `text-sm` | `text-xs` | Smaller genre text |
| Price | `text-2xl` | `text-lg` | Screenshot price is ~18-20px |
| Delivery text | `text-sm` | `text-xs` | Smaller delivery text |
| Section heading | `text-2xl` | `text-xl` | Screenshot heading ~20px |
| Section mb | `mb-10` | `mb-8` | Less space between sections |
| Section heading mb | `mb-5` | `mb-4` | Less gap below heading |
| Main content px | `px-5` | `px-4` | Slightly tighter |
| Main content pt | `pt-5` | `pt-4` | Slightly tighter |

---

## Sub-Task A — Sidebar sizing

**Status:** `[ ] pending`

**Files:** `src/features/books/CategorySidebar.tsx`

### Changes
- `<aside>` width: `w-80` → `w-48`
- `<aside>` top padding: `pt-5` → `pt-3`
- `<aside>` sticky height: `h-[calc(100vh-3rem)]` stays (correct)
- Category button height: `h-10` → `h-8`
- Category button font: `text-[15px] font-semibold` → `text-sm font-semibold`
- Active item: `pl-[17px]` → `pl-[13px]` (20px - 4px border = 16px → 13px keeps text aligned for w-48 sidebar with px-4 baseline)
- Active item `pr-5` → `pr-4`
- Inactive item `px-5` → `px-4`

---

## Sub-Task B — Filter row sizing

**Status:** `[ ] pending`

**Files:** `src/features/books/SearchBar.tsx`, `src/features/books/FilterBar.tsx`, `src/pages/HomePage.tsx`

### SearchBar changes
- Outer div height: `h-20` → `h-14`
- Label: `text-sm` → `text-xs`
- Input: `text-base` → `text-sm`
- Outer div px: `px-4` → `px-3`

### FilterSelect changes
- Outer div height: `h-20` → `h-14`
- Label: `text-sm` → `text-xs`
- Select value: `text-base` → `text-sm`
- Outer div px: `px-4` → `px-3`

### HomePage filter grid changes
- Grid gap: `gap-5` → `gap-3`
- Grid bottom margin: `mb-8` → `mb-6`

---

## Sub-Task C — BookCard sizing

**Status:** `[ ] pending`

**Files:** `src/components/BookCard/index.tsx`, `src/features/books/BookGrid.tsx`

### BookCard default variant changes
- Cover width: `w-44` → `w-28`
- Book item gap: `gap-4` → `gap-3`
- Title: `text-xl font-normal` → `text-base font-normal`
- Author line: `text-base` → `text-sm`
- Synopsis: `text-sm` → `text-xs`
- Format: `text-sm` → `text-xs`
- Genre links (button + span): `text-sm` → `text-xs`
- Price: `text-2xl font-semibold` → `text-lg font-semibold`
- Delivery text: `text-sm text-ink-soft` → `text-xs text-ink-soft`

### BookGrid changes
- Grid gaps: `gap-x-6 gap-y-8` → `gap-x-5 gap-y-6`

### Section component (in HomePage.tsx)
- Heading: `text-2xl font-normal` → `text-xl font-normal`
- Heading margin: `mb-5` → `mb-4`
- Section wrapper: `mb-10` → `mb-8`

---

## Validation

After all three sub-tasks:
- `npx tsc --noEmit` — zero errors
- `npm run build` — zero errors
- Visual comparison: screenshot should match at 100% zoom without needing to zoom out
