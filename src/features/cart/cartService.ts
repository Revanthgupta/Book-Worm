import axiosClient from '../../services/axiosClient';
import type { CartItem } from './cartSlice';
import type { Book } from '../../types/book';

/**
 * Cart API service — wraps all /api/cart endpoints.
 */

interface ApiCartItemResponse {
  book_id: string;
  title: string;
  cover_image: string | null;
  price: number;
  quantity: number;
  line_total: number;
}

interface ApiCartResponse {
  items: ApiCartItemResponse[];
  coupon_code: string | null;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

/** Convert the API cart item shape into the frontend CartItem shape.
 *  We only have partial book info from the cart endpoint, so we build a minimal Book. */
function mapApiItem(item: ApiCartItemResponse): CartItem {
  const book: Book = {
    id: item.book_id,
    title: item.title,
    authorId: '',
    authorName: '',
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
  return { book, quantity: item.quantity };
}

export interface ApiCartTotals {
  couponCode: string | null;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface ApiCartResult {
  items: CartItem[];
  totals: ApiCartTotals;
}

function mapApiCart(data: ApiCartResponse): ApiCartResult {
  return {
    items: data.items.map(mapApiItem),
    totals: {
      couponCode: data.coupon_code,
      discount: data.discount,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
    },
  };
}

export async function apiGetCart(): Promise<ApiCartResult> {
  const res = await axiosClient.get<ApiCartResponse>('/cart');
  return mapApiCart(res.data);
}

export async function apiUpsertCartItem(
  isbn: string,
  quantity: number,
): Promise<ApiCartResult> {
  const res = await axiosClient.put<ApiCartResponse>(`/cart/items/${isbn}`, { quantity });
  return mapApiCart(res.data);
}

export async function apiRemoveCartItem(isbn: string): Promise<ApiCartResult> {
  const res = await axiosClient.delete<ApiCartResponse>(`/cart/items/${isbn}`);
  return mapApiCart(res.data);
}

export async function apiClearCart(): Promise<void> {
  await axiosClient.delete('/cart');
}

export async function apiApplyCoupon(code: string): Promise<ApiCartResult> {
  const res = await axiosClient.post<ApiCartResponse>('/cart/coupon', { code });
  return mapApiCart(res.data);
}

export async function apiRemoveCoupon(): Promise<ApiCartResult> {
  const res = await axiosClient.delete<ApiCartResponse>('/cart/coupon');
  return mapApiCart(res.data);
}
