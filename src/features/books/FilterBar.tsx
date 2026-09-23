import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters } from './booksSlice';
import type { BooksFilters, BookFormat, BookLanguage } from '../../types/book';

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

/**
 * Each filter renders as a labelled box matching the screenshot:
 *   ┌───────────────────┐
 *   │ Language          │
 *   │ All            ▾  │
 *   └───────────────────┘
 */
const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => (
  <div className="relative h-14 bg-surface px-3 border-b border-rule flex flex-col justify-center">
    <span className="block text-xs text-ink-soft leading-none mb-1">{label}</span>
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full appearance-none bg-transparent text-sm text-ink-dim px-0 pr-6 focus:outline-none focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface text-ink">
            {opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-0 flex items-center text-ink">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

const LANGUAGES: Array<BookLanguage | 'All'> = [
  'All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
];

const FORMATS: Array<BookFormat | 'All'> = [
  'All', 'Paperback', 'Hard Cover', 'eBook',
];

const PRICE_RANGES: BooksFilters['priceRange'][] = [
  'All', 'Under ₹200', '₹200–₹400', 'Above ₹400',
];

const SORT_OPTIONS: BooksFilters['sortBy'][] = [
  'Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating',
];

const FilterBar = () => {
  const dispatch = useAppDispatch();
  const { language, format, priceRange, sortBy } = useAppSelector(
    (s) => s.books.filters,
  );

  const update = (patch: Partial<BooksFilters>) => dispatch(setFilters(patch));

  return (
    <>
      <FilterSelect
        label="Language"
        value={language}
        options={LANGUAGES}
        onChange={(v) => update({ language: v as BookLanguage | 'All' })}
      />
      <FilterSelect
        label="Format (Paperback, ebook etc)"
        value={format}
        options={FORMATS}
        onChange={(v) => update({ format: v as BookFormat | 'All' })}
      />
      <FilterSelect
        label="Price Range"
        value={priceRange}
        options={PRICE_RANGES}
        onChange={(v) => update({ priceRange: v as BooksFilters['priceRange'] })}
      />
      <FilterSelect
        label="Sort by"
        value={sortBy}
        options={SORT_OPTIONS}
        onChange={(v) => update({ sortBy: v as BooksFilters['sortBy'] })}
      />
    </>
  );
};

export default FilterBar;
