import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedCategory } from './booksSlice';
import type { Category } from '../../types/book';

const DISPLAY_LABEL: Partial<Record<Category | 'All', string>> = {
  'Self Help': 'Self-help',
};

const CATEGORIES: Array<Category | 'All'> = [
  'All',
  'Romance',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Historical',
  'Biography',
  'Self Help',
  'Memoir',
  'Travel',
  'Cooking',
  "Children's",
  'Young Adult',
  'Comics & Graphic Novels',
  'Poetry',
  'Drama',
  'Science',
  'Philosophy',
  'Religion',
  'Language Learning',
];

// ── Category list ─────────────────────────────────────────────────────────────
interface CategoryListProps {
  onSelect?: () => void; // called after selection (used to close mobile drawer)
}

const CategoryList = ({ onSelect }: CategoryListProps) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.books.selectedCategory);

  return (
    <ul role="list">
      {CATEGORIES.map((cat) => (
        <li key={cat}>
          <button
            onClick={() => {
              dispatch(setSelectedCategory(cat));
              onSelect?.();
            }}
            className={`w-full text-left h-7 flex items-center text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
              selected === cat
                ? 'bg-field text-ink border-l-4 border-brand pl-[13px] pr-4'
                : 'px-4 text-ink-soft hover:bg-field'
            }`}
            aria-current={selected === cat ? 'true' : undefined}
          >
            {DISPLAY_LABEL[cat] ?? cat}
          </button>
        </li>
      ))}
    </ul>
  );
};

// ── CategorySidebar — desktop version ────────────────────────────────────────
/** Shown at lg+ as a fixed left sidebar. Hidden on mobile. */
const CategorySidebar = () => (
  <aside
    className="hidden lg:block w-48 shrink-0 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto pt-3"
    aria-label="Book categories"
  >
    <CategoryList />
  </aside>
);

export default CategorySidebar;

// ── MobileCategoryDrawer — mobile version ─────────────────────────────────────
/** Toggle button + slide-in drawer for mobile. Used in HomePage. */
export const MobileCategoryDrawer = () => {
  const selected = useAppSelector((s) => s.books.selectedCategory);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button — visible below lg */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Browse categories"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="lg:hidden flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink px-3 py-1.5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        {selected !== 'All' ? (DISPLAY_LABEL[selected] ?? selected) : 'All Categories'}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book categories"
        className={`fixed top-12 left-0 bottom-0 z-40 w-64 bg-page border-r border-field overflow-y-auto transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-field">
          <span className="text-ink font-semibold text-sm">Categories</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close categories"
            className="text-ink-soft hover:text-ink p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <CategoryList onSelect={() => setOpen(false)} />
      </div>
    </>
  );
};
