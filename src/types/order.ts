import type { Book } from './book';

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

/** Legacy client-side order item (uses full Book object). */
export interface OrderItem {
  book: Book;
  quantity: number;
}

/** API-backed order item (snapshot fields only — no full Book). */
export interface ApiOrderItem {
  id: string;
  book_id: string | null;
  book_title: string;
  author_name: string;
  price_at_purchase: number;
  quantity: number;
  format: string;
  cover_image: string | null;
  delivery_date: string;
}

export interface Order {
  id: string;
  userId: string;
  /** Legacy: present for localStorage-created orders */
  items?: OrderItem[];
  /** API-backed order items */
  apiItems?: ApiOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  redeemedPointsAmount?: number;
  total: number;
  status: OrderStatus;
  createdAt: number; // Date.now() (ms)
  paymentMethod: string;
  pointsAwarded: boolean;
  deliveryDate?: string;
  pointsEarned?: number;
}
