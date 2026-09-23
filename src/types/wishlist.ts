import type { Book } from './book';

export interface WishlistState {
  /** Books saved to the authenticated user's wishlist. */
  items: Book[];
}
