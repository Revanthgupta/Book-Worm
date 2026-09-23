# Cart Page Reskin Plan

## Overview

Bring the Cart page visually in line with `screens/CartpageScreen.png`.
The palette, IBM Plex Sans font, and dark theme are already correct.
All work is purely **CSS/layout** — no logic, no new dependencies, no colour tokens added beyond what is already in `tailwind.config.js`.

The three user-visible constraints are:
1. Use `bg-page` / `text-ink` as the base (already applied via `index.css` body rule).
2. IBM Plex Sans weights 300/400/600 — already loaded in `index.html`; already mapped in `tailwind.config.js`. No change needed.
3. **Square corners everywhere** — strip every `rounded`, `rounded-lg`, `rounded-t-lg`, `rounded-md` from all cart-related components.

---

## Sub-Tasks

---

### Sub-Task 1 — Strip rounded corners from all cart-related files

**Status:** [ ] pending

**Intent**
The design spec says square corners everywhere. Currently every card, input, button, and the quantity control uses Tailwind `rounded` / `rounded-lg` / `rounded-t-lg`.

**Expected Outcomes**
- Zero `rounded` classes on any element rendered by the Cart page.
- Visual result: hard 90° corners on the cart panel, address panel, summary panel, inputs, buttons, and quantity stepper.

**Todo List**
- Remove `rounded-lg` from the outer cart-items grid wrapper in `CartPage.tsx` (line 91).
- Remove `rounded-lg` from the address+summary container in `CartPage.tsx` if present.
- Remove `rounded` from `CartItemCard.tsx` cover image (line 22).
- Remove `rounded-lg` and `rounded-t-lg` from `CartSummary.tsx` outer wrapper and illustration wrapper (lines 86, 22).
- Remove `rounded` from coupon `<input>` and `Apply` `<button>` in `CartSummary.tsx`.
- Remove `rounded` from the `Pay Now` button in `CartSummary.tsx`.
- Remove `rounded-lg` from the `AddressForm` section wrapper in `AddressForm.tsx` (line 91).
- Remove `rounded` from every `<input>`, `<select>` in `AddressForm.tsx` (inputCls constant + individual selects).
- Remove `rounded overflow-hidden` from the `QuantityControl` wrapper div in `QuantityControl/index.tsx` (line 18). **Note: this is a global change — Product Detail page stepper will also become square, which is the intended outcome.**
- Remove `rounded` from the empty-cart "Browse Books" button in `CartPage.tsx` (line 64).

**Relevant Context**
- [`src/pages/CartPage.tsx`](src/pages/CartPage.tsx)
- [`src/features/cart/CartItemCard.tsx`](src/features/cart/CartItemCard.tsx)
- [`src/features/cart/CartSummary.tsx`](src/features/cart/CartSummary.tsx)
- [`src/features/cart/AddressForm.tsx`](src/features/cart/AddressForm.tsx)
- [`src/components/QuantityControl/index.tsx`](src/components/QuantityControl/index.tsx)

---

### Sub-Task 2 — Resize cart item book cover

**Status:** [ ] pending

**Intent**
The target screenshot shows a noticeably taller/wider cover image (~108×160px).
Currently the cover is `96×140px`.

**Expected Outcomes**
- Cover image renders at `108px × 160px` (or closest whole-pixel equivalent matching the screenshot).

**Todo List**
- Update the `style` prop on the `<img>` in `CartItemCard.tsx` from `width: '96px', height: '140px'` to `width: '108px', height: '160px'`.

**Relevant Context**
- [`src/features/cart/CartItemCard.tsx`](src/features/cart/CartItemCard.tsx) line 22-24

---

### Sub-Task 3 — Align author link colour with design-system link token

**Status:** [ ] pending

**Intent**
The author name under the book title in `CartItemCard` uses `text-bw-accent` (`#60a5fa` — a legacy token). The rest of the app (breadcrumbs, product detail) uses `text-link` (`#78a9ff` — the Carbon-aligned token). The target screenshot shows the same blue-ish link colour throughout.

**Expected Outcomes**
- Author name in cart item cards uses `text-link` instead of `text-bw-accent`.
- Category chips in cart item cards also use `text-link` instead of `text-bw-accent`.

**Todo List**
- Replace `text-bw-accent` with `text-link` on the author `<p>` in `CartItemCard.tsx` (line 36).
- Replace `text-bw-accent` with `text-link` on the category `<span>` in `CartItemCard.tsx` (line 49).

**Relevant Context**
- [`src/features/cart/CartItemCard.tsx`](src/features/cart/CartItemCard.tsx) lines 36, 49

---

### Sub-Task 4 — Rework CartSummary layout to match target

**Status:** [ ] pending

**Intent**
Currently the `CartSummary` component stacks the illustration **above** the price breakdown (full-width illustration, then full-width text below).
In the target screenshot the illustration occupies the **left ~40%** of the card and the price breakdown occupies the **right ~60%**, side-by-side, at the same card height.

**Expected Outcomes**
- On the Grand Total panel, the book illustration sits to the left and the price rows, coupon field, total, and Pay Now button sit to the right — in a single horizontal row.
- At narrow (mobile) widths, stacking back to vertical is acceptable.

**Todo List**
- Change outer card wrapper from `flex flex-col` to `flex flex-col sm:flex-row` so illustration and price panel sit side-by-side on `sm+`.
- Give the illustration container a fixed width (`w-40` / 160px) and `shrink-0` so it does not compress.
- On mobile (`< sm`): illustration stacks above the price breakdown (default `flex-col` behaviour — no extra work needed).
- Remove the `rounded-t-lg` from the illustration wrapper (covered in Sub-Task 1, but confirm here).
- Ensure the illustration fills full height of the card: add `self-stretch h-full` to its container; change the SVG wrapper height from fixed `160px` to `h-full min-h-[160px]`.

**Relevant Context**
- [`src/features/cart/CartSummary.tsx`](src/features/cart/CartSummary.tsx) — `CartIllustration` (lines 20-57) and outer card div (line 86).

---

### Sub-Task 5 — Restyle AddressForm fields to match Cart target

**Status:** [ ] pending

**Intent**
The target screenshot (`CartpageScreen.png`) shows address fields as **full 4-sided bordered rectangular boxes** with the label sitting **outside and above** the box — not inside it. The label is small muted text, the box has a darker background than the card panel, a mid-grey border on all sides, and muted placeholder text inside. The current code already uses this general structure but uses the wrong colour tokens. This sub-task corrects those tokens to exactly match the target.

**Exact field anatomy from target screenshot:**
```
First Name          ← label: outside above, text-xs, muted colour
┌──────────────┐
│ First Name   │    ← box: bg-field (#393939), border-line (#525252) all sides, no radius
└──────────────┘    ← placeholder: muted (#a8a8a8), value text: text-ink (#f4f4f4)
```

**Expected Outcomes**
- Label sits above the input box (outside), `text-ink-soft` (`#c6c6c6`), `text-xs`.
- Input box background: `bg-field` (`#393939`) — the Carbon field token.
- Input box border: `border border-line` (`#525252`) on all 4 sides — no `border-bw-border` (`#374151`).
- No rounded corners on inputs or selects (reinforces ST1).
- Placeholder text: `placeholder:text-muted` (`#a8a8a8`).
- Typed value text: `text-ink` (`#f4f4f4`).
- Focus style: `focus:outline-none focus-visible:outline-2 focus-visible:outline-white` — no blue ring.
- Select dropdowns (Country, phone code) use the same `bg-field border-line` tokens.
- The coupon input in `CartSummary.tsx` gets the same treatment: `bg-field border border-line`, same text/placeholder/focus tokens.

**Todo List**
- In `AddressForm.tsx`, keep the `Field` wrapper as `flex flex-col gap-1` (label above, then input box — correct structure, no change).
- Change label class from `text-bw-muted text-xs` → `text-ink-soft text-xs`.
- Replace `inputCls` constant:
  - Remove: `bg-bw-bg`, `border-bw-border`, `rounded`, `focus:ring-1 focus:ring-bw-primary`, `placeholder-bw-muted`
  - Add: `bg-field`, `border-line`, `placeholder:text-muted`, `focus:outline-none focus-visible:outline-2 focus-visible:outline-white`
  - Keep: `w-full`, `border`, `px-3 py-2`, `text-sm text-ink`
- Update the phone country-code `<select>` in `AddressForm.tsx`: replace `bg-bw-bg border-bw-border` with `bg-field border-line`; same focus/text tokens.
- Update the Country `<select>` in `AddressForm.tsx`: same `bg-field border-line` token swap; remove `rounded`.
- In `CartSummary.tsx`, update the coupon `<input>`: replace `bg-bw-bg border-bw-border rounded` with `bg-field border border-line`; update placeholder/focus tokens to match.

**Relevant Context**
- [`src/features/cart/AddressForm.tsx`](src/features/cart/AddressForm.tsx) — `Field` component (lines 14-32), `inputCls` constant (lines 34-35), phone `<select>` (line 186), Country `<select>` (lines 215-219).
- [`src/features/cart/CartSummary.tsx`](src/features/cart/CartSummary.tsx) — coupon `<input>` (line 131).
- Token `bg-field` → `#393939` (`field` in `tailwind.config.js` line 29).
- Token `border-line` → `#525252` (`line` in `tailwind.config.js` line 30).
- Token `text-ink-soft` → `#c6c6c6` (`ink.soft` in `tailwind.config.js` line 25).
- Token `text-muted` → `#a8a8a8` (`muted` in `tailwind.config.js` line 31).
- Token `text-ink` → `#f4f4f4` (`ink.DEFAULT` in `tailwind.config.js` line 25).

---

## Colour Tokens (no additions needed)

All required colours already exist in [`tailwind.config.js`](tailwind.config.js):

| Usage | Token | Value |
|---|---|---|
| Page background | `bg-page` | `#161616` |
| Card/panel bg | `bg-surface` / `bg-bw-card` | `#262626` |
| Input/select bg | `bg-field` | `#393939` |
| Input/select border | `border-line` | `#525252` |
| Primary button | `bg-bw-primary` | `#3b82f6` |
| Link/author | `text-link` | `#78a9ff` |
| Body text | `text-ink` | `#f4f4f4` |
| Field label | `text-ink-soft` | `#c6c6c6` |
| Placeholder text | `text-muted` | `#a8a8a8` |

No new tokens required — all tokens already exist in [`tailwind.config.js`](tailwind.config.js).

---

## Confirmed Design Decisions

| Question | Decision |
|---|---|
| QuantityControl rounded corners | Remove globally — both Cart and Product Detail get square corners |
| Grand Total mobile layout | Illustration stacks above price breakdown on mobile |
| Cart item title | Remains a clickable `Link`; white text, blue on hover — current behaviour kept |

---

## Font Verification

IBM Plex Sans is already loaded in [`index.html`](index.html) with weights 300/400/600/700 via Google Fonts.
`tailwind.config.js` maps `font-sans` to `"IBM Plex Sans"`.
`index.css` applies `font-sans` to `body`.
**No changes required.**
