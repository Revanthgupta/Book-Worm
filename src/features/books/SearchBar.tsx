import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery } from './booksSlice';

/**
 * Search box matching the screenshot:
 *   ┌──────────────────────────────────────────────────── 🔍 ┐
 *   │ Search you want to read here                            │
 *   │ Search                                                  │
 *   └─────────────────────────────────────────────────────────┘
 * The label "Search" appears as small muted text below the placeholder row.
 */
const SearchBar = () => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((s) => s.books.searchQuery);

  return (
    <div className="relative h-14 bg-surface px-3 border-b border-rule flex flex-col justify-center">
      <label htmlFor="book-search" className="block text-xs text-ink-soft leading-none mb-1">
        Search you want to read here
      </label>
      <div className="flex items-center gap-2">
        <input
          id="book-search"
          type="search"
          value={value}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Search"
          aria-label="Search books"
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none focus-visible:outline-none"
        />
        <span className="text-ink shrink-0" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
