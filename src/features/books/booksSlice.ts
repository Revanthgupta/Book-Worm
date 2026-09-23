import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockBooks } from '../../data/mockBooks';
import type { Book, Category, BooksFilters } from '../../types/book';
import type { RootState } from '../../store';
import { fetchAllBooks } from './booksService';

interface BooksState {
  catalogue: Book[];
  selectedCategory: Category | 'All';
  searchQuery: string;
  filters: BooksFilters;
  loading: boolean;
  error: string | null;
}

const defaultFilters: BooksFilters = {
  language: 'All',
  format: 'All',
  priceRange: 'All',
  sortBy: 'Relevance',
};

const initialState: BooksState = {
  catalogue: mockBooks,
  selectedCategory: 'All',
  searchQuery: '',
  filters: defaultFilters,
  loading: false,
  error: null,
};

// ── Async thunk — declared before createSlice so extraReducers can reference it ──
export const fetchBooks = createAsyncThunk('books/fetchAll', async () => {
  return fetchAllBooks();
});

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<Category | 'All'>) {
      state.selectedCategory = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<BooksFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = defaultFilters;
      state.selectedCategory = 'All';
      state.searchQuery = '';
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogue = action.payload;
      })
      .addCase(fetchBooks.rejected, (state) => {
        state.loading = false;
        // Keep existing mockBooks catalogue on API failure — graceful degradation
      });
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setFilters,
  resetFilters,
  setLoading,
  setError,
} = booksSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Apply category + search + filters to the full catalogue */
export function selectFilteredBooks(state: RootState): Book[] {
  let books = state.books.catalogue;
  const { selectedCategory, searchQuery, filters } = state.books;

  // Category filter
  if (selectedCategory !== 'All') {
    books = books.filter((b) => b.categories.includes(selectedCategory));
  }

  // Search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.synopsis.toLowerCase().includes(q),
    );
  }

  // Language filter
  if (filters.language !== 'All') {
    books = books.filter((b) => b.language === filters.language);
  }

  // Format filter
  if (filters.format !== 'All') {
    books = books.filter((b) => b.format === filters.format);
  }

  // Price range filter
  if (filters.priceRange === 'Under ₹200') {
    books = books.filter((b) => b.price < 200);
  } else if (filters.priceRange === '₹200–₹400') {
    books = books.filter((b) => b.price >= 200 && b.price <= 400);
  } else if (filters.priceRange === 'Above ₹400') {
    books = books.filter((b) => b.price > 400);
  }

  // Sort
  if (filters.sortBy === 'Price: Low to High') {
    books = [...books].sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'Price: High to Low') {
    books = [...books].sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'Rating') {
    books = [...books].sort((a, b) => b.rating - a.rating);
  }

  return books;
}

export function selectFeaturedBooks(state: RootState): Book[] {
  return selectFilteredBooks(state).filter((b) => b.featured);
}

export function selectBestsellers(state: RootState): Book[] {
  return selectFilteredBooks(state).filter((b) => b.bestseller);
}

export function selectNewLaunches(state: RootState): Book[] {
  return selectFilteredBooks(state).filter((b) => b.newLaunch);
}

/** "Recommended for You" for an authenticated user: books from categories they've ordered.
 *  Falls back to featured books if no order history exists. */
export function selectRecommendedBooks(
  state: RootState,
  orderedCategories?: Category[],
): Book[] {
  if (orderedCategories && orderedCategories.length > 0) {
    const matches = selectFilteredBooks(state).filter((b) =>
      b.categories.some((c) => orderedCategories.includes(c)),
    );
    if (matches.length > 0) return matches;
  }
  // Fall back to featured books
  return selectFilteredBooks(state).filter((b) => b.featured);
}

export default booksSlice.reducer;
