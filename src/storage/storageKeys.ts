/**
 * Centralised localStorage key constants.
 * All persisted data uses the "bw_" prefix.
 */

export const STORAGE_KEYS = {
  USER: 'bw_user',
  CART: 'bw_cart',
  ORDERS: 'bw_orders',
  GIFT_POINTS: 'bw_gift_points',
  WISHLIST: 'bw_wishlist',
  ADDRESS: 'bw_address',
  WRITERS: 'bw_writers',
  REVIEWS: 'bw_reviews',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
