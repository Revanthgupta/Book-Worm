import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storageGet, storageSet } from '../../storage/storageService';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import type { Book } from '../../types/book';
import type { RootState } from '../../store';
import {
  apiGetCart,
  apiUpsertCartItem,
  apiRemoveCartItem,
  apiClearCart,
  apiApplyCoupon,
  apiRemoveCoupon,
} from './cartService';
import type { ApiCartResult } from './cartService';

export interface CartItem {
  book: Book;
  quantity: number;
}

// Valid demo coupon codes (kept for offline fallback)
const COUPON_CODES: Record<string, number> = {
  BOOK10: 10,
  SAVE50: 50,
  READ100: 100,
  WORM20: 20,
};

interface CartState {
  items: CartItem[];
  couponCode: string;
  discount: number;
  // Server-computed totals (populated after API round-trip; undefined = use client calc)
  serverSubtotal?: number;
  serverTax?: number;
  serverTotal?: number;
}

function loadCart(): CartState {
  const saved = storageGet<CartItem[]>(STORAGE_KEYS.CART);
  return { items: saved ?? [], couponCode: '', discount: 0 };
}

const initialState: CartState = loadCart();

// ── Async thunks ──────────────────────────────────────────────────────────────

/** Merge partial cart items from the API with full Book data from the catalogue. */
function enrichItems(result: ApiCartResult, catalogue: Book[]): ApiCartResult {
  const enriched = result.items.map((item) => {
    const full = catalogue.find((b) => b.id === item.book.id);
    if (!full) return item;
    return {
      ...item,
      book: {
        ...item.book,
        authorName: full.authorName,
        authorId: full.authorId,
        synopsis: full.synopsis,
        format: full.format,
        categories: full.categories,
        deliveryDate: full.deliveryDate,
        language: full.language,
        rating: full.rating,
        sells: full.sells,
        backCoverText: full.backCoverText,
        publisher: full.publisher,
      },
    };
  });
  return { ...result, items: enriched };
}

export const loadCartFromApi = createAsyncThunk(
  'cart/loadFromApi',
  async (_, { getState }) => {
    const result = await apiGetCart();
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItems(result, catalogue);
  },
);

export const upsertCartItemApi = createAsyncThunk(
  'cart/upsertItem',
  async ({ isbn, quantity }: { isbn: string; quantity: number }, { getState }) => {
    const result = await apiUpsertCartItem(isbn, quantity);
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItems(result, catalogue);
  },
);

export const removeCartItemApi = createAsyncThunk(
  'cart/removeItem',
  async (isbn: string, { getState }) => {
    const result = await apiRemoveCartItem(isbn);
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItems(result, catalogue);
  },
);

export const clearCartApi = createAsyncThunk('cart/clearApi', async () => {
  await apiClearCart();
});

export const applyCouponApi = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { getState }) => {
    const result = await apiApplyCoupon(code);
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItems(result, catalogue);
  },
);

export const removeCouponApi = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { getState }) => {
    const result = await apiRemoveCoupon();
    const catalogue = (getState() as RootState).books.catalogue;
    return enrichItems(result, catalogue);
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

function applyApiResult(
  state: CartState,
  items: CartItem[],
  totals: { couponCode: string | null; discount: number; subtotal: number; tax: number; total: number },
) {
  state.items = items;
  state.couponCode = totals.couponCode ?? '';
  state.discount = totals.discount;
  state.serverSubtotal = totals.subtotal;
  state.serverTax = totals.tax;
  state.serverTotal = totals.total;
  storageSet(STORAGE_KEYS.CART, items);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Book>) {
      const existing = state.items.find((i) => i.book.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ book: action.payload, quantity: 1 });
      }
      storageSet(STORAGE_KEYS.CART, state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.book.id !== action.payload);
      storageSet(STORAGE_KEYS.CART, state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ bookId: string; quantity: number }>,
    ) {
      const item = state.items.find((i) => i.book.id === action.payload.bookId);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      storageSet(STORAGE_KEYS.CART, state.items);
    },
    clearCart(state) {
      state.items = [];
      state.couponCode = '';
      state.discount = 0;
      state.serverSubtotal = undefined;
      state.serverTax = undefined;
      state.serverTotal = undefined;
      storageSet(STORAGE_KEYS.CART, []);
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      storageSet(STORAGE_KEYS.CART, state.items);
    },
    /** Returns 'ok' | 'invalid' — caller uses the couponError selector */
    applyCoupon(state, action: PayloadAction<string>) {
      const code = action.payload.trim().toUpperCase();
      if (COUPON_CODES[code] !== undefined) {
        state.couponCode = code;
        state.discount = COUPON_CODES[code];
      } else {
        state.couponCode = action.payload;
        state.discount = 0;
      }
    },
    removeCoupon(state) {
      state.couponCode = '';
      state.discount = 0;
    },
  },
  extraReducers: (builder) => {
    const syncFromApi = (
      state: CartState,
      action: { payload: { items: CartItem[]; totals: { couponCode: string | null; discount: number; subtotal: number; tax: number; total: number } } },
    ) => applyApiResult(state, action.payload.items, action.payload.totals);

    builder
      .addCase(loadCartFromApi.fulfilled, syncFromApi)
      .addCase(upsertCartItemApi.fulfilled, syncFromApi)
      .addCase(removeCartItemApi.fulfilled, syncFromApi)
      .addCase(applyCouponApi.fulfilled, syncFromApi)
      .addCase(removeCouponApi.fulfilled, syncFromApi)
      .addCase(clearCartApi.fulfilled, (state) => {
        state.items = [];
        state.couponCode = '';
        state.discount = 0;
        state.serverSubtotal = undefined;
        state.serverTax = undefined;
        state.serverTotal = undefined;
        storageSet(STORAGE_KEYS.CART, []);
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.serverSubtotal ??
  state.cart.items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

/** Tax at 12% of subtotal, rounded */
export const selectCartTax = (state: { cart: CartState }) =>
  state.cart.serverTax ??
  Math.round(selectCartSubtotal(state) * 0.12);

export const selectCartDiscount = (state: { cart: CartState }) =>
  state.cart.discount;

export const selectCouponCode = (state: { cart: CartState }) =>
  state.cart.couponCode;

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.serverTotal ??
  Math.max(0, selectCartSubtotal(state) + selectCartTax(state) - selectCartDiscount(state));

export const selectCouponValid = (state: { cart: CartState }) =>
  state.cart.couponCode !== '' && state.cart.discount > 0;

export default cartSlice.reducer;
