# Product Detail Page — Fluid Sizing & Layout Plan

## Overview

Apply clamp()-based fluid sizing to the Product Detail page so it closely matches
`screens/ProductDetailpageScreen.png` at 1280px CSS pixels and scales smoothly from
375px to 1920px. This is a **presentation-only** pass — no routing, Redux logic, data
fetching, or component APIs change.

**Files in scope (only these 6):**
1. `src/pages/ProductDetailPage.tsx`
2. `src/components/Breadcrumb/index.tsx`
3. `src/features/books/WriterProfile.tsx`
4. `src/features/books/ReviewSection.tsx`
5. `src/features/books/RelatedBooks.tsx`
6. `src/components/StarRating/index.tsx`

**Hard rules:**
- Do NOT touch `src/index.css`, global font sizes, or any shared style used by other pages.
- Rating stars: `size="sm"` → fixed `w-[14px] h-[14px]`; interactive form stars → fixed `w-5 h-5`. No clamp on stars.
- Related Reads: remove StarRating from the item list (spec §5 explicitly says no stars there).
- `compact` BookCard variant on this page is untouched (it is used by RelatedBooks via a Link, not BookCard).
- All clamp() values must already be at their MAX by 1920px — outer `max-w-[1240px]` prevents further growth.

---

## clamp() reference table (1280px anchor)

All `vw` midpoints are chosen so the expression evaluates near the stated 1280px value.

| Property | clamp() | ~1280px value |
|---|---|---|
| Container px padding | `clamp(16px,3vw,24px)` | 38px → cap at 24px ✓ |
| Container pt | `clamp(16px,2vw,20px)` | 25px → cap at 20px ✓ |
| Breadcrumb font | `clamp(11px,1vw+8px,13px)` | ~21px → cap 13px ✓ |
| Cover width | `clamp(100px,10vw+20px,190px)` | ~148px |
| Details gap | `clamp(6px,0.6vw,8px)` | ~8px |
| Title | `clamp(17px,1.5vw+13px,26px)` | ~26px → cap 26px |
| Byline / body text | `clamp(12px,1vw+9px,15px)` | ~22px → cap 15px |
| Price | `clamp(19px,2vw+13px,30px)` | ~39px → cap 30px |
| Button height | `clamp(32px,1vw+28px,44px)` | ~41px → cap 44px |
| Add to Cart width | `clamp(110px,10vw,170px)` | ~128px |
| Add to Wishlist width | `clamp(125px,11vw,190px)` | ~141px |
| Stats gap-x | `clamp(24px,4vw,64px)` | ~51px → cap 64px |
| Stats font | `clamp(10px,0.8vw+7px,14px)` | ~17px → cap 14px |
| Section heading | `clamp(16px,1vw+13px,22px)` | ~26px → cap 22px |
| Section margin-top | `clamp(32px,3vw,56px)` | ~38px → cap 56px |
| Avatar size | `clamp(56px,4vw+30px,88px)` | ~81px → cap 88px |
| Author gap | `clamp(12px,2vw,20px)` | ~26px → cap 20px |
| Author name | `clamp(14px,1vw+11px,18px)` | ~24px → cap 18px |
| Review row gap | `clamp(16px,2vw,24px)` | ~26px → cap 24px |
| Textarea height | `clamp(80px,8vw+30px,110px)` | ~132px → cap 110px |
| Submit width | `clamp(70px,7vw,100px)` | ~90px |
| Review name | `clamp(14px,1vw+11px,18px)` | ~24px → cap 18px |
| Review item gap | `clamp(16px,1.6vw,24px)` | ~21px |
| Related cover width | `clamp(60px,6vw+30px,96px)` | ~77px |
| Related item gap | `clamp(8px,1vw,12px)` | ~13px → cap 12px |
| Related title | `clamp(13px,1vw+10px,17px)` | ~23px → cap 17px |
| Related byline | `clamp(10px,0.8vw+8px,13px)` | ~18px → cap 13px |
| Related body/format | `clamp(10px,0.7vw+7px,13px)` | ~16px → cap 13px |
| Related price | `clamp(13px,1.2vw+9px,19px)` | ~24px → cap 19px |

---

## Sub-Task 1 — ProductDetailPage.tsx shell + product summary

**Status:** `[ ] pending`

### Intent
Restructure the page shell to the `max-w-[1240px]` container with fluid padding,
two-column `lg:grid` layout with Related Reads in the right column, and apply all
clamp() values to the product summary row.

### Expected Outcomes
- Container: `max-w-[1240px] mx-auto` with fluid `px` and `pt` via inline style or arbitrary values.
- Two-column layout from `lg`: `lg:grid lg:grid-cols-[minmax(0,1fr)_280px]` with fluid gap. Below lg: single column.
- Related Reads moves into the right grid column (from its current flex sibling position).
- The "Below main columns" block (`WriterProfile` + `ReviewSection`) spans full width (in the left column only, not crossing into Related Reads column).
- Product summary row: `flex items-start` with fluid gap.
- Covers: fluid width via inline `style={{ width: 'clamp(100px,10vw+20px,190px)' }}`, aspect-[2/3] via `style={{ aspectRatio: '2/3' }}`, `object-cover`.
- Back cover panel: same fluid width, `bg-surface` (not `bg-bw-card`), `border-field` (not `bg-bw-border`), fluid padding, no rounded corners. Remove the `hidden sm:flex` — always show it.
- Details column: `flex-1 min-w-0 flex flex-col` with fluid gap via `style={{ gap: 'clamp(6px,0.6vw,8px)' }}`.
- Title: `text-[clamp(17px,1.5vw+13px,26px)] font-normal text-ink` (remove `font-bold text-white text-2xl`).
- Author byline: `text-[clamp(12px,1vw+9px,15px)] text-ink`, author as `text-link underline hover:text-link-hover`.
- Synopsis: same text clamp, `text-ink-soft leading-snug`, `max-w-[clamp(280px,35vw,460px)]`.
- Publisher line: same text clamp, `text-ink-soft`, publisher `text-link underline`.
- Format: same text clamp, `text-ink-soft`.
- Genres: same text clamp, genre buttons `text-link underline hover:text-link-hover`, commas `text-ink`.
- Price: `text-[clamp(19px,2vw+13px,30px)] font-semibold text-ink mt-1`.
- Delivery: same byline text clamp, `text-ink-soft`, date `font-semibold text-ink`.
- Buttons row: `flex flex-wrap mt-2` with fluid gap via style. Each button: `style={{ height: 'clamp(32px,1vw+28px,44px)' }}`, fluid width, `px-3 flex items-center justify-between`, byline text clamp, no rounded corners. Add to Cart: `bg-brand text-white hover:bg-brand/90`. Add to Wishlist: `bg-surface border border-field text-ink` (active: `border-link text-link`).
- Stats row: `flex flex-wrap mt-3` with fluid `gap-x` and `gap-y-2`, no `border-t`. Each stat stacked (icon+label / value), `text-[clamp(10px,0.8vw+7px,14px)]`. Language value: `text-link underline`. Rating stars: fixed (use `size="sm"` which will be changed to `w-[14px] h-[14px]` in Sub-Task 5). Sells value: `text-ink font-medium`.
- Below 480px: product summary row becomes `flex-col`. Use `max-[480px]:flex-col` Tailwind variant.
  When stacked: covers sub-row stays `flex flex-row justify-center`, details column full width.

### Todo List
1. Replace `max-w-screen-xl mx-auto px-4 py-4` with `max-w-[1240px] mx-auto` and fluid padding/pt via inline style.
2. Restructure outer layout: replace `flex flex-col lg:flex-row gap-6 items-start` with `lg:grid lg:grid-cols-[minmax(0,1fr)_280px]` + fluid gap. Move Related Reads into right column cell. Left column cell wraps summary row + below-main sections.
3. Right column: `lg:border-l lg:border-field lg:pl-[clamp(16px,1.5vw,20px)] self-stretch`.
4. Covers: apply fluid width/height via `style={{ width: 'clamp(100px,10vw+20px,190px)', aspectRatio: '2/3' }}`. Remove fixed `style={{ width: '160px', height: '225px' }}`.
5. Back cover panel: show always (remove `hidden sm:flex`), swap `bg-bw-card border-bw-border` → `bg-surface border-field`, apply fluid padding, remove `rounded`.
6. Product summary row: add `max-[480px]:flex-col` for mobile stacking; add fluid gap via style.
7. Apply all clamp() text sizes, colors, and layout values listed above to each metadata element.
8. Buttons: replace fixed `px-5 py-2.5 rounded` with fluid width/height, `px-3`, no `rounded`. Update colors to Carbon tokens.
9. Stats row: remove `border-t border-bw-border`, apply fluid gap and text sizes.

### Relevant Context
- [`src/pages/ProductDetailPage.tsx`](src/pages/ProductDetailPage.tsx)
- The "Below main columns" div (`WriterProfile` + `ReviewSection`) must sit inside the left column, not spanning both. In the new grid, place it after the summary row inside a `<div>` that is the first grid child.

---

## Sub-Task 2 — Breadcrumb

**Status:** `[ ] pending`

### Intent
Apply fluid font size and Carbon link colors to the Breadcrumb component.

### Expected Outcomes
- Font: `text-[clamp(11px,1vw+8px,13px)]` on the nav container.
- Separator `/`: `text-ink-soft`.
- Link items: `text-link underline hover:text-link-hover` (first two items are linked).
- Current page (last item): `text-ink` plain (no underline).
- `mb-3` on the nav (was `mb-4`).

### Todo List
1. Change `text-sm mb-4` → `text-[clamp(11px,1vw+8px,13px)] mb-3` on the nav.
2. Link class: `text-bw-muted hover:text-white` → `text-link underline hover:text-link-hover`.
3. Separator: `text-bw-muted` → `text-ink-soft`.
4. Current page span: `text-white` → `text-ink`.

### Relevant Context
- [`src/components/Breadcrumb/index.tsx`](src/components/Breadcrumb/index.tsx)
- This component is also used on other pages. The color changes (`text-link`, `text-ink`) are Carbon tokens that already exist in `tailwind.config.js` and are safe to apply globally to Breadcrumb. Verify no other page is broken after this change.

---

## Sub-Task 3 — WriterProfile

**Status:** `[ ] pending`

### Intent
Apply fluid sizing to the About the Writer section.

### Expected Outcomes
- Section `margin-top`: `clamp(32px,3vw,56px)` (was fixed `mt-8`).
- Heading: `text-[clamp(16px,1vw+13px,22px)] font-normal text-ink mb-3` (was `font-semibold text-lg text-white mb-4`).
- Row gap: `clamp(12px,2vw,20px)`.
- Avatar: `rounded-full object-cover shrink-0` with fluid size `clamp(56px,4vw+30px,88px)` via inline style.
- Author name: `text-[clamp(14px,1vw+11px,18px)] font-normal text-ink mb-1` (was `font-semibold text-base text-white mb-2`).
- Bio: byline text clamp `text-[clamp(12px,1vw+9px,15px)]`, `text-ink-soft leading-relaxed`, `max-w-[clamp(300px,36vw,460px)]`.

### Todo List
1. Replace `mt-8` with inline `style={{ marginTop: 'clamp(32px,3vw,56px)' }}`.
2. Heading classes: `text-white font-semibold text-lg mb-4` → `text-[clamp(16px,1vw+13px,22px)] font-normal text-ink mb-3`.
3. Row: `gap-4` → inline `style={{ gap: 'clamp(12px,2vw,20px)' }}`.
4. Avatar: replace `w-16 h-16` with inline `style={{ width: 'clamp(56px,4vw+30px,88px)', height: 'clamp(56px,4vw+30px,88px)' }}`.
5. Author name: `text-white font-semibold text-base mb-2` → `text-[clamp(14px,1vw+11px,18px)] font-normal text-ink mb-1`.
6. Bio: `text-bw-muted text-sm` → `text-[clamp(12px,1vw+9px,15px)] text-ink-soft`, add `max-w-[clamp(300px,36vw,460px)]`.

### Relevant Context
- [`src/features/books/WriterProfile.tsx`](src/features/books/WriterProfile.tsx)

---

## Sub-Task 4 — ReviewSection

**Status:** `[ ] pending`

### Intent
Apply fluid sizing, carbon colors, and responsive stacking to the Reviews section.

### Expected Outcomes
- Section `margin-top`: same `clamp(32px,3vw,56px)` as WriterProfile.
- Heading: same heading clamp as WriterProfile, `font-normal text-ink mb-3`.
- Row: `flex gap-[clamp(16px,2vw,24px)]`. Below 640px: `flex-col`.
- Left form column: `w-[clamp(220px,20vw,250px)] shrink-0` above 640px; `w-full` below 640px. Use `max-sm:w-full`.
  - Label row: `text-[clamp(10px,0.8vw+7px,14px)]` for both "Leave Your Review" and counter, `text-ink-soft`.
  - Textarea: `h-[clamp(80px,8vw+30px,110px)]`, `bg-surface`, fluid padding, `text-[clamp(12px,1vw+9px,15px)] text-ink`, `placeholder:text-ink-dim`, `border-0 border-b border-rule`, no `rounded`, `resize-y`, `focus:outline-none`.
  - Below textarea: `mt-2 flex justify-between items-center`.
  - Stars: interactive, fixed `w-5 h-5` (keep `size="md"` default, will be fixed in Sub-Task 5).
  - Submit button: `w-[clamp(70px,7vw,100px)]`, same height clamp as product buttons, `flex items-center justify-between px-3`, byline text clamp, `bg-brand text-white`, no `rounded`. Arrow icon `w-4 h-4`.
- Right list column: `flex-1 min-w-0 flex flex-col gap-[clamp(16px,1.6vw,24px)]`.
  - Each review: no bottom border. Name: `text-[clamp(14px,1vw+11px,18px)] text-ink`. Body: byline text clamp, `text-ink-soft leading-relaxed mt-1`. Stars: `size="sm"` fixed `w-[14px] h-[14px]`, `mt-1`.
  - Remove the `border-b border-bw-border pb-4` wrapper (use gap for spacing instead).

### Todo List
1. Replace `mt-8` with inline `style={{ marginTop: 'clamp(32px,3vw,56px)' }}`.
2. Heading: `text-white font-semibold text-lg mb-4` → heading clamp classes.
3. Row: replace `flex flex-col lg:flex-row gap-6` → `flex flex-col sm:flex-row gap-[clamp(16px,2vw,24px)]`.
4. Left column: replace `lg:w-80 shrink-0` → `w-full sm:w-[clamp(220px,20vw,250px)] sm:shrink-0`.
5. Label and counter: update font size and color classes.
6. Textarea: replace `rows={5}` + old classes with fixed height, `bg-surface`, fluid padding, no border/rounded, `border-b border-rule`, fluid text size.
7. Stars + Submit row: wrap stars and button in `mt-2 flex justify-between items-center`.
8. Submit button: replace `mt-3 px-5 py-2 rounded` with fluid width/height, `px-3 flex items-center justify-between`, no `rounded`, `bg-brand`.
9. Right column: replace `gap-4` → `gap-[clamp(16px,1.6vw,24px)]`.
10. Each review: remove `border-b pb-4`, update name/body/stars classes.

### Relevant Context
- [`src/features/books/ReviewSection.tsx`](src/features/books/ReviewSection.tsx)
- Stars in form use `onChange` (interactive) → stay `w-5 h-5` per spec exception. Stars in review list use `size="sm"` → will become `w-[14px] h-[14px]` via StarRating fix in Sub-Task 5.

---

## Sub-Task 5 — StarRating fixed sizes

**Status:** `[ ] pending`

### Intent
Lock star sizes to the spec-required fixed values regardless of viewport.

### Expected Outcomes
- `size="sm"` → stars render at exactly `w-[14px] h-[14px]`.
- `size="md"` (default, interactive) → stars render at exactly `w-5 h-5` (20px, unchanged).
- No clamp on stars anywhere.

### Todo List
1. In [`src/components/StarRating/index.tsx`](src/components/StarRating/index.tsx), change:
   `const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';`
   → `const starSize = size === 'sm' ? 'w-[14px] h-[14px]' : 'w-5 h-5';`

### Relevant Context
- Currently `size="sm"` renders `w-4 h-4` (16px). Spec requires 14px.
- `size="md"` already 20px — no change.

---

## Sub-Task 6 — RelatedBooks

**Status:** `[ ] pending`

### Intent
Apply fluid sizing to Related Reads and remove StarRating from the item list.

### Expected Outcomes
- Heading: same heading clamp, `font-normal text-ink mb-3` (was `font-semibold text-lg text-white mb-4`).
- Item list gap: `clamp(12px,1.6vw,24px)`.
- Each item: `flex gap-[clamp(8px,1vw,12px)]`, no `hover:bg-bw-card`, no `rounded-lg`, no `p-2`.
- Cover: fluid width `clamp(60px,6vw+30px,96px)` via inline style, same height (aspect-[2/3]), `object-cover shrink-0`, no `rounded`.
- Title: `text-[clamp(13px,1vw+10px,17px)] font-normal text-ink line-clamp-2`.
- Author: `text-[clamp(10px,0.8vw+8px,13px)] text-link underline hover:text-link-hover mt-0.5`.
- Synopsis: `text-[clamp(10px,0.7vw+7px,13px)] text-ink-soft mt-1 line-clamp-2 leading-relaxed`.
- Format: same `text-[clamp(10px,0.7vw+7px,13px)] text-ink-soft mt-0.5`.
- Genres: same small clamp, `text-link underline`.
- Price: `text-[clamp(13px,1.2vw+9px,19px)] font-semibold text-ink mt-auto`.
- Delivery: same small body clamp, `text-ink-soft`, date `font-semibold text-ink`.
- **Remove** the `StarRating` import and usage from each item (spec §5 explicitly says no stars).

### Todo List
1. Remove `StarRating` import.
2. Replace `<aside>` width: `w-full lg:w-72 lg:shrink-0` → `w-full` (width now controlled by the grid column in ProductDetailPage — 280px).
3. Heading: apply heading clamp, `font-normal text-ink mb-3`.
4. Item list: `gap-4` → `gap-[clamp(12px,1.6vw,24px)]`.
5. Each Link: remove `hover:bg-bw-card rounded-lg p-2`; add fluid `gap-[clamp(8px,1vw,12px)]`.
6. Cover img: remove `rounded`; replace fixed style with fluid `style={{ width: 'clamp(60px,6vw+30px,96px)', aspectRatio: '2/3' }}`.
7. Title: apply title clamp, `font-normal text-ink`.
8. Author `<p>`: apply author clamp, `text-link underline hover:text-link-hover`.
9. Synopsis: apply body clamp, `text-ink-soft line-clamp-2 leading-relaxed`.
10. Format: apply body clamp, `text-ink-soft`.
11. Genres: apply body clamp, `text-link underline`; remove `text-bw-accent`.
12. Remove `<div className="flex items-center gap-1 mt-1"><StarRating … /></div>` block entirely.
13. Price: `text-white text-sm font-semibold mt-1` → price clamp, `font-semibold text-ink mt-auto`.
14. Delivery: apply body clamp, `text-ink-soft`, date `font-semibold text-ink`.

### Relevant Context
- [`src/features/books/RelatedBooks.tsx`](src/features/books/RelatedBooks.tsx)
- The `<aside>` width is now governed by the `280px` right column in the parent grid.

---

## Sub-Task 7 — Final validation

**Status:** `[ ] pending`

### Intent
Run build + type-check, then do a responsive audit across all required widths.

### Expected Outcomes
- `npx tsc --noEmit` → zero errors.
- `npm run build` → zero errors.
- No `bw-bg`, `bw-card`, `bw-border`, `bw-accent`, `bw-primary`, `bw-muted` tokens remain in the six modified files (the compact BookCard block in BookCard/index.tsx is untouched — those tokens there are correct and out of scope).
- At 1280px the page matches `ProductDetailpageScreen.png` closely.
- At 375px: product summary stacks (covers above details), Reviews row stacks (form above list), nothing overflows horizontally.
- At 1920px: container stays `max-w-[1240px]` centered, text stops growing at MAX clamp values.

### Todo List
1. Grep the six files for remaining `bw-*` tokens (excluding BookCard compact block).
2. Run `npx tsc --noEmit`.
3. Run `npm run build`.
4. Fix any TypeScript or import errors.
5. Report all results.
