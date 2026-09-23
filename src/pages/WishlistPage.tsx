import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectWishlistItems, removeFromWishlistApi, fetchWishlist } from '../features/books/wishlistSlice';
import { addToCart, upsertCartItemApi } from '../features/cart/cartSlice';
import type { Book } from '../types/book';

// ── WishlistCard ──────────────────────────────────────────────────────────────
interface WishlistCardProps {
  book: Book;
}

const WishlistCard = ({ book }: WishlistCardProps) => {
  const dispatch = useAppDispatch();

  return (
    <div className="bg-bw-card border border-bw-border overflow-hidden flex flex-col">
      {/* Cover — fluid height so it doesn't crush on 2-col mobile */}
      <Link to={`/books/${book.id}`} className="block bg-bw-bg">
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="w-full object-cover"
          style={{ height: 'clamp(140px, 22vw, 220px)', objectPosition: 'top' }}
        />
      </Link>

      {/* Metadata */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link
          to={`/books/${book.id}`}
          className="text-white font-semibold text-sm hover:text-link transition-colors line-clamp-2 leading-snug"
        >
          {book.title}
        </Link>
        <p className="text-xs sm:text-sm text-ink mt-0.5">
          by <span className="text-link underline hover:text-link-hover">{book.authorName}</span>
        </p>

        <p className="text-muted text-xs mt-1">{book.format}</p>
        <div className="flex flex-wrap gap-x-1 mt-1">
          {book.categories.slice(0, 2).map((cat, i) => (
            <span key={cat} className="text-xs text-link">
              {cat}{i < Math.min(book.categories.length, 2) - 1 ? ',' : ''}
            </span>
          ))}
        </div>

        <p className="text-white font-bold text-base sm:text-lg mt-2">₹{book.price}</p>
        <p className="text-muted text-xs mb-3 sm:mb-4">
          Delivery by <span className="font-semibold text-white">{book.deliveryDate}</span>
        </p>

        {/* Actions — stack on very narrow, row from sm */}
        <div className="flex flex-col min-[380px]:flex-row gap-2 mt-auto">
          <button
            onClick={() => {
              dispatch(addToCart(book));
              dispatch(upsertCartItemApi({ isbn: book.id, quantity: 1 }));
            }}
            className="flex-1 bg-brand hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium py-2.5 transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => dispatch(removeFromWishlistApi(book.id))}
            className="border border-line hover:border-red-500 text-muted hover:text-red-400 text-xs py-2.5 px-3 transition-colors"
            aria-label={`Remove ${book.title} from wishlist`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// ── WishlistPage ──────────────────────────────────────────────────────────────
const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-white font-semibold text-2xl mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="w-16 h-16 text-bw-border mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-bw-muted text-lg mb-2">Your wishlist is empty</p>
          <p className="text-bw-muted text-sm mb-6">
            Save books you like by clicking "Add to Wishlist" on a book's detail page.
          </p>
          <Link
            to="/"
            className="bg-bw-primary hover:bg-bw-primary-hover text-white font-medium px-6 py-2.5 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((book) => (
            <WishlistCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
