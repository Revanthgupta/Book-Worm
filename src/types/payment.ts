import type { CartItem } from '../features/cart/cartSlice';

export type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'wallet';

export interface PaymentState {
  selectedMethod: PaymentMethod;
  status: 'idle' | 'processing' | 'success' | 'error';
  lastConfirmedOrderId: string | null;
  redeemedPoints: number;
}

/** Summarises what the user is about to pay for — passed from cart to payment */
export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}
