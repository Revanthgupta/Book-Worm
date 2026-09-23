# Homepage Carbon Reskin Plan

## Overview

Restyle the Book Worm homepage so it visually matches the target `screens/HomepageScreen.png`.
This is a **presentation-only** change: no routing, Redux logic, data fetching, filtering, search,
or component APIs are modified. Only Tailwind classes, markup structure, Tailwind config tokens,
and font loading change.

The target design follows the **IBM Carbon dark look**:
- Near-black `#161616` page background (not navy)
- Flat surfaces — no card containers, no box shadows, no rounded corners
- Underlined links in Carbon blue (`#4589ff`)
- IBM Plex Sans (currently declared but not loading weights 300/600)
- Horizontal book items showing a prominent cover image (~176 px wide) with text beside it

The screen has five affected areas:
1. `tailwind.config.js` — new color tokens
2. `index.html` + `src/index.css` — font weights, body background, `dark` class
3. `src/components/Header/index.tsx` — Carbon header style
4. `src/components/Layout/index.tsx` — swap `bg-bw-bg` to `bg-page`
5. `src/features/books/CategorySidebar.tsx` — flat sidebar, Carbon active state
6. `src/pages/HomePage.tsx` + `src/features/books/FilterBar.tsx` + `src/features/books/SearchBar.tsx` — single-row filter grid
7. `src/components/BookCard/index.tsx` (`default` variant only) + `src/features/books/BookGrid.tsx` — horizontal flat book items; `compact` variant is untouched (Product Detail page is out of scope)

---

## Sub-Task 1 — Tailwind Config Tokens + Font Loading

**Status:** `[ ] pending`

### Intent
Add the new Carbon-page color tokens without disturbing any existing `bw-*` or Carbon payment tokens.
Fix the font to actually load and apply IBM Plex Sans weights 300, 400, 600.

### Expected Outcomes
- `bg-page`, `text-ink`, `text-ink-soft`, `text-ink-dim`, `border-rule`, `bg-danger`,
  `text-link`, `hover:text-link-hover` classes resolve in Tailwind.
- IBM Plex Sans (w300, w400, w600) loads from Google Fonts.
- `<body>` carries `font-sans bg-page text-ink` for this dark-only screen.
- `darkMode: 'class'` remains; `<html class="dark">` already set in `index.html`.

### Todo List
1. In `tailwind.config.js` → `theme.extend.colors`, add the five new token groups:
   ```
   page:   '#161616',
   rule:   '#8d8d8d',
   danger: '#da1e28',
   link:   { DEFAULT: '#4589ff', hover: '#78a9ff' },
   ink:    { DEFAULT: '#f4f4f4', soft: '#c6c6c6', dim: '#6f6f6f' },
   ```
   Keep all existing tokens exactly as-is.
2. In `index.html`, update the Google Fonts `<link>` to include weights `300;400;600;700`
   (it currently only loads `400;500;600;700` — add 300, confirm 600 is present).
3. In `src/index.css`, change the `body` rule from `bg-bw-bg text-white` to
   `bg-page text-ink font-sans`.
   Keep the `*` border-color rule unchanged (it affects other pages).

### Relevant Context
- [`tailwind.config.js`](tailwind.config.js)
- [`index.html`](index.html)
- [`src/index.css`](src/index.css)

---

## Sub-Task 2 — Header Reskin

**Status:** `[ ] pending`

### Intent
Replace the navy/rounded header with a flat Carbon `h-12 bg-page border-b border-field` bar.
Left: outlined book icon → "Book Worm" (font-semibold text-base) → 1px vertical divider → nav links.
Right: cart icon with red badge + outlined user-circle (remove blue "P" avatar).

### Expected Outcomes
- Header height is 48 px (`h-12`), not 56 px.
- Brand icon is an outlined panel/book SVG (~20 px), replacing the 3×3 dots grid icon.
- "Book Worm" brand text is `font-semibold text-base` (not `font-bold text-lg`).
- Vertical divider between brand and nav is `bg-field h-7 w-px` (not a `|` text char).
- Nav links `text-ink-soft hover:text-ink font-normal text-base`.
- Cart badge is `bg-danger` (red, `#da1e28`), not `bg-bw-primary` (blue).
- When logged in, show outlined `user-circle` SVG icon (`text-ink-soft hover:text-ink`) — no blue avatar circle.
- Mobile: hamburger/book icon triggers drawer; user dropdown still works.
- All `bw-bg`, `bw-border`, `bw-primary`, `bw-accent`, `bw-card`, `bw-muted` class references in this file replaced with Carbon tokens.

### Todo List
1. Change outer `<header>` classes: `bg-bw-bg border-b border-bw-border` → `bg-page border-b border-field`.
2. Change `<div>` inner height from `h-14` to `h-12`.
3. Replace the 3×3 dots SVG with a small outlined book SVG (use a simple open-book or panel outline path).
4. Change brand Link: `font-bold text-lg` → `font-semibold text-base`; `text-white` → `text-ink`.
5. Replace `<span>` text divider `|` with `<span className="hidden sm:block h-7 w-px bg-field mx-1" aria-hidden="true" />`.
6. Update nav link classes: remove `font-medium`, use `font-normal text-base text-ink-soft hover:text-ink`.
7. Cart badge: change `bg-bw-primary` → `bg-danger`; text stays white.
8. Replace the authenticated blue-circle button with an outlined user-circle SVG icon (same click behaviour); user dropdown menu styling updated to use `bg-surface border-field`.
9. Update mobile nav drawer background/border to use `bg-page border-field`.
10. Update mobile nav link classes and user section to use new tokens.

### Relevant Context
- [`src/components/Header/index.tsx`](src/components/Header/index.tsx)
- Mobile nav drawer shifts with `top-12` (was `top-14`) to track header height change.

---

## Sub-Task 3 — CategorySidebar Reskin

**Status:** `[ ] pending`

### Intent
Flatten the sidebar: no background, no border, sticky under the new `h-12` header,
independently scrollable. Carbon-style active item (left brand-blue border + `bg-field`).

### Expected Outcomes
- `<aside>` has no background color, no right border; `w-80` wide (not `w-44`).
- Sticky: `sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto`.
- Each list item: `h-10 px-5 flex items-center text-[15px] font-semibold text-ink-soft whitespace-nowrap hover:bg-field`.
- Active item: `bg-field text-ink border-l-4 border-brand` with `pl-[17px]` (so content aligns — 20px total minus 4px border = 16px, adjust to taste to align with non-active).
- Category display name `'Self Help'` → `'Self-help'` (lowercase h, hyphen) in the CATEGORIES array and in the booksSlice type if needed. **Note**: the type `Category` has `'Self Help'` — change display label only, keep the type value as-is to avoid breaking filter logic. So display as `'Self-help'` in label but dispatch `'Self Help'` for filter compatibility — or simply rename the type value if safe. Safest: keep type as `'Self Help'`, but show `'Self-help'` as the display string using a label map.
- "Comics & Graphic Novels" must be on one line (`whitespace-nowrap` + scrollable sidebar).
- `MobileCategoryDrawer` gets the same item styling.

### Todo List
1. Change `<aside>` class: remove `bg-bw-bg`, change `w-44` → `w-80`, add `sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto pt-5`.
2. Remove the `shrink-0` (or keep it — sidebar is now sticky, not flex child of a flex row).
3. Rewrite `CategoryList` item button classes to Carbon style: `h-10 px-5 flex items-center text-[15px] font-semibold whitespace-nowrap`.
4. Active state: `bg-field text-ink border-l-4 border-brand pl-[17px]` (reduces effective left padding to align with non-active 20px).
5. Inactive state: `text-ink-soft hover:bg-field`.
6. Add a `CATEGORY_LABELS` map or inline ternary: when `cat === 'Self Help'` display `'Self-help'`.
7. Update `MobileCategoryDrawer` drawer background to `bg-page border-field`; apply same item styles.

### Relevant Context
- [`src/features/books/CategorySidebar.tsx`](src/features/books/CategorySidebar.tsx)
- [`src/types/book.ts`](src/types/book.ts) — `Category` type has `'Self Help'` (keep for filter logic)

---

## Sub-Task 4 — HomePage Layout + Filter Row

**Status:** `[ ] pending`

### Intent
Update `HomePage` to use the correct outer layout (no `flex` fighting with sticky sidebar),
combine SearchBar + FilterBar into a single grid row in the page component, and restyle section headings.

Update `SearchBar` and `FilterBar` to the Carbon flat-field style (bottom border only, `h-20 bg-surface`).

### Expected Outcomes
- Page background `bg-page` (already from index.css body).
- Layout: sidebar is sticky outside the scroll container; main scrolls independently.
- Single filter row: `grid gap-5 grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]`.
  Order: Search (col-span-2 below lg), Language, Format, Price Range, Sort by.
- Each field: `h-20 bg-surface px-4` — NO rounded corners, NO full border, only `border-b border-rule`.
- Section headings: `text-2xl font-normal text-ink mb-5` (not `font-semibold text-xl text-white`).
- Section spacing: `mt-10` between sections.
- Outer wrapper: `flex min-h-screen bg-page`; main content `flex-1 min-w-0 px-5 pt-5 overflow-y-auto`.
- Mobile: `MobileCategoryDrawer` trigger styled consistently; sidebar hidden below `lg` (change from `md`).

### Todo List
1. In `HomePage.tsx`: change outer `bg-bw-bg` → `bg-page`. Change `px-4 md:px-6 py-4` → `px-5 pt-5`. Remove the separate `<div>` wrapping `<SearchBar>` and `<FilterBar>` — merge into one `<div>`.
2. Replace the two-row layout (SearchBar div + FilterBar div) with a single filter grid container using `grid gap-5 grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]`.
3. Inside the grid, render `<SearchBar className="col-span-2 lg:col-span-1" />` first, then `<FilterBar />` (which will now render 4 separate cells — see step below).
4. Update `Section` component: `text-white font-semibold text-xl mb-4` → `text-2xl font-normal text-ink mb-5`; wrapper `mb-10`.
5. In `SearchBar.tsx`: restyle to Carbon bottom-border field. Change outer div: remove border/rounded, add `h-20 bg-surface px-4 border-b border-rule flex flex-col justify-center`. Top label: `text-sm text-ink-soft`. Input below: `text-base text-ink-dim placeholder:text-ink-dim`. Icon right-aligned with `absolute` or flex.
6. In `FilterBar.tsx`: restyle `FilterSelect` outer div to `h-20 bg-surface px-4 border-b border-rule relative flex flex-col justify-center`. Remove `border border-bw-border rounded`. Label: `text-sm text-ink-soft`. Select value: `text-base text-ink-dim` (non-default: `text-ink`). Return four individual grid cells from `FilterBar` (not wrapped in its own `flex` row) — or keep the wrapper but make the FilterBar children flow into the parent grid naturally.
7. In `FilterBar.tsx`: change `label="Format (Paperback, eBook etc)"` → `label="Format (Paperback, ebook etc)"` to match screenshot.
8. Focus ring: add `focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[-2px]` on inputs and selects.

### Relevant Context
- [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx)
- [`src/features/books/SearchBar.tsx`](src/features/books/SearchBar.tsx)
- [`src/features/books/FilterBar.tsx`](src/features/books/FilterBar.tsx)
- Grid note: `FilterBar` currently returns a `flex` wrapper. To make 4 select fields sit naturally in the parent grid's 4 remaining columns, `FilterBar` should return a React Fragment `<>…</>` with 4 children, and the `HomePage` grid container will own their placement.

---

## Sub-Task 5 — BookCard Reskin (Horizontal Flat Item)

**Status:** `[ ] pending`

### Intent
Replace the card-with-rounded-corners layout with a flat horizontal book item sitting directly on `bg-page`.
Large cover (w-44, aspect-[2/3]), plain text column on the right with underlined author/genre links,
price at bottom-left. **Only the `default` variant is reskinned.** The `compact` variant (Product Detail page sidebar) is left untouched.

### Expected Outcomes
- No card background, no border, no shadow, no `rounded-*`.
- Cover: `w-44 aspect-[2/3] object-cover shrink-0 block` (uses `book.coverImage` — already a placehold.co URL).
- Text column: `flex flex-col min-w-0` same height as cover.
- Title: `text-xl font-normal text-ink` (not bold).
- Author line: `text-base text-ink` "by " + underlined link `text-link underline hover:text-link-hover`.
- Synopsis: `text-sm text-ink-soft line-clamp-2 leading-snug`.
- Format: `text-sm text-ink`.
- Genre links: `text-sm text-link underline hover:text-link-hover`, comma-separated.
- Price block (`mt-auto`): `text-2xl font-semibold text-ink`; delivery `text-sm text-ink-soft`, date `font-semibold text-ink`.
- Outer `<Link>`: `flex gap-4` — no bg, no padding card, no rounded.
- `'default'` variant changes as above; `'compact'` variant (used in sidebar on product detail page) can keep a lighter version of the same style or be left unchanged if that page is not in scope.

### Todo List
1. Remove `bg-bw-card rounded-lg overflow-hidden hover:bg-bw-border/40` from outer Link.
2. Add `flex gap-4` to outer Link (keep navigation unchanged).
3. Change `<img>` classes: remove `rounded`; change dimensions to `w-44` with `style={{ aspectRatio: '2/3' }}` or Tailwind `aspect-[2/3]`; keep `object-cover shrink-0`.
4. Title: `text-xl font-normal text-ink line-clamp-2` (drop `font-semibold`, `text-base`, `text-white`).
5. Author line: change from `<p className="text-bw-accent">` to `<p className="text-base text-ink">by <Link className="text-link underline hover:text-link-hover"…>authorName</Link></p>`.
6. Synopsis (non-compact): `text-sm text-ink-soft line-clamp-2 leading-snug`.
7. Format: `text-sm text-ink` (was `text-bw-muted`).
8. Genre links: `text-sm text-link underline hover:text-link-hover`; commas in `text-ink`.
9. Price: `text-2xl font-semibold text-ink mt-auto pt-2`.
10. Delivery: `text-sm text-ink-soft`; date span: `font-semibold text-ink`.
11. Leave `compact` variant block entirely unchanged — wrap its JSX in an early-return or `if (isCompact)` guard to preserve the current navy card look for Product Detail.

### Relevant Context
- [`src/components/BookCard/index.tsx`](src/components/BookCard/index.tsx)
- [`src/features/books/BookGrid.tsx`](src/features/books/BookGrid.tsx) — update grid classes to `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8`.

---

## Sub-Task 6 — Visual QA Pass

**Status:** `[ ] pending`

### Intent
Compare result against screenshot side-by-side and fix any residual spacing, colour, or weight mismatches.
Also ensure responsive behaviour (sidebar collapses below `lg`, grid degrades, keyboard focus visible).

### Expected Outcomes
- No `bw-bg`, `bw-card`, `bw-border`, `bw-accent`, `bw-primary` classes remain in the five modified files.
- Sidebar hidden below `lg` (not `md`).
- Keyboard focus outline visible on sidebar items, filter fields, nav links, book links.
- `npm run build` and `npx tsc --noEmit` pass with zero errors.

### Todo List
1. Grep all modified files for any remaining `bw-bg`, `bw-card`, `bw-border`, `bw-accent`, `bw-primary`, `bw-muted` class references and fix.
2. Change sidebar visibility: `hidden md:block` → `hidden lg:block` in `CategorySidebar`; `md:hidden` → `lg:hidden` on `MobileCategoryDrawer` trigger.
3. Confirm `<Layout>` `bg-bw-bg` → `bg-page` (handled in Sub-Task 1 as confirmed).
4. Add `focus-visible:ring-2 focus-visible:ring-ink` on sidebar buttons, nav links, and the book card link.
5. Run `npx tsc --noEmit` and `npm run build` and fix any TypeScript or import errors.
6. Visually confirm against screenshot — check spacing, font weights, and colour fidelity.

### Relevant Context
- [`src/components/Layout/index.tsx`](src/components/Layout/index.tsx) — already updated in Sub-Task 1
- All modified files in this plan
- Do NOT touch `src/pages/ProductDetailPage.tsx` or any code only used by that page
