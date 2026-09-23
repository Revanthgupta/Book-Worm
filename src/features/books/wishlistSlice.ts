import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../../services/axiosClient';
import type { Book } from '../../types/book';
import type { WishlistState } from '../../types/wishlist';
import type { RootState } from '../../store';

// ── API helpers ───────────────────────────────────────────────────────────────

interface ApiWishlistItem {
  book_id: string;
  title: string;
  cover_image: string | null;
  price: number;
  author_name: string;
}

/**
 * Enrich a partial API wishlist item with full Book data from the catalogue
 * already loaded in Redux state (same pattern as enrichItems in cartSlice).
 * Falls back to a minimal stub only when the book is not yet in the catalogue.
 */
function enrichItem(item: ApiWishlistItem, catalogue: Book[]): Book {
  const full = catalogue.find((b) => b.id === item.book_id);
  if (full) {
    return {
      ...full,
      // Prefer API price in case it differs from the catalogue snapshot
      price: item.price,
      coverImage: item.cover_image ?? full.coverImage,
    };
  }
  return {
    id: item.book_id,
    title: item.title,
    authorId: '',
    authorName: item.author_name,
    publisher: '',
    format: 'Paperback',
    categories: [],
    price: item.price,
    coverImage: item.cover_image ?? '',
    synopsis: '',
    backCoverText: '',
    language: 'English',
    rating: 0,
    sells: 0,
    deliveryDate: '',
    isbn: item.book_id,
  };
}

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { getState }) => {
    const res = await axiosClient.get<ApiWishlistItem[]>('/wishlist');
    const catalogue = (getState() as RootState).books.catalogue;
    return res.data.map((item) => enrichItem(item, catalogue));
  },
);

export const addToWishlistApi = createAsyncThunk(
  'wishlist/add',
  async (isbn: string, { getState }) => {
    const res = await axiosClient.post<ApiWishlistItem>(`/wishlist/${isbn}`);
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItem(res.data, catalogue);
  },
);

export const removeFromWishlistApi = createAsyncThunk(
  'wishlist/remove',
  async (isbn: string) => {
    await axiosClient.delete(`/wishlist/${isbn}`);
    return isbn;
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: WishlistState = { items: [] };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    /** Synchronous add (optimistic or offline). */
    addToWishlist(
      state,
      action: PayloadAction<{ book: Book; userId: string }>,
    ) {
      const { book } = action.payload;
      if (!state.items.some((b) => b.id === book.id)) {
        state.items.push(book);
      }
    },

    removeFromWishlist(
      state,
      action: PayloadAction<{ bookId: string; userId: string }>,
    ) {
      state.items = state.items.filter((b) => b.id !== action.payload.bookId);
    },

    clearWishlist(state) {
      state.items = [];
    },

    /** Load wishlist for a user (used after login — kept for backward compat). */
    loadWishlist(_state, _action: PayloadAction<string>) {
      // No-op: use fetchWishlist thunk instead
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToWishlistApi.fulfilled, (state, action) => {
        if (!state.items.some((b) => b.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(removeFromWishlistApi.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;

export const selectIsInWishlist =
  (bookId: string) => (state: { wishlist: WishlistState }) =>
    state.wishlist.items.some((b) => b.id === bookId);

export default wishlistSlice.reducer;
