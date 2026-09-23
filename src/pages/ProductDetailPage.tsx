import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addToCart, upsertCartItemApi } from '../features/cart/cartSlice';
import {
  addToWishlist,
  addToWishlistApi,
  removeFromWishlistApi,
  selectIsInWishlist,
} from '../features/books/wishlistSlice';
import { getBookById, getAuthorById, getRelatedBooks } from '../data/mockBooks';
import Breadcrumb from '../components/Breadcrumb';
import StarRating from '../components/StarRating';
import RelatedBooks from '../features/books/RelatedBooks';
import WriterProfile from '../features/books/WriterProfile';
import ReviewSection from '../features/books/ReviewSection';

// ── Outline SVG icons ─────────────────────────────────────────────────────────

const CartIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M9 20a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className="w-4 h-4 shrink-0"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const LanguageIcon = () => (
  <svg className="w-3.5 h-3.5 text-ink-soft shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3c-2.4 2.8-3.8 5.7-3.8 9s1.4 6.2 3.8 9M12 3c2.4 2.8 3.8 5.7 3.8 9s-1.4 6.2-3.8 9" />
  </svg>
);

const StarOutlineIcon = () => (
  <svg className="w-3.5 h-3.5 text-ink-soft shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const SellsIcon = () => (
  <svg className="w-3.5 h-3.5 text-ink-soft shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userId = useAppSelector((s) => s.auth.user?.id ?? '');
  const inWishlist = useAppSelector(selectIsInWishlist(id ?? ''));

  const book = id ? getBookById(id) : undefined;
  const author = book ? getAuthorById(book.authorId) : undefined;
  const related = book ? getRelatedBooks(book, 3) : [];

  // 404 guard
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-ink-soft text-lg mb-4">Book not found.</p>
        <button
          onClick={() => navigate('/')}
          className="text-link hover:text-link-hover text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          ← Back to catalogue
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    dispatch(addToCart(book));
    dispatch(upsertCartItemApi({ isbn: book.id, quantity: 1 }));
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (inWishlist) {
      dispatch(removeFromWishlistApi(book.id));
    } else {
      dispatch(addToWishlist({ book, userId }));
      dispatch(addToWishlistApi(book.id));
    }
  };

  // Breadcrumb: Home / genre1 / genre2 (or Home / genre / title if one genre)
  const breadcrumbItems = (() => {
    const cats = book.categories.filter((c) => c !== 'All');
    if (cats.length >= 2) {
      return [
        { label: 'Home', to: '/' },
        { label: cats[0], to: '/' },
        { label: cats[1], to: '/' },
      ];
    }
    if (cats.length === 1) {
      return [
        { label: 'Home', to: '/' },
        { label: cats[0], to: '/' },
        { label: book.title },
      ];
    }
    return [{ label: 'Home', to: '/' }, { label: book.title }];
  })();

  const frontSrc = book.coverUrl ?? book.coverImage;
  const backSrc  = book.backCoverUrl ?? null;

  return (
    /*
     * max-w-[67.5rem] = 1080px — matches the exact width of the reference screenshot.
     * px-6 = 24px each side → 1032px usable content area.
     */
    <div className="mx-auto px-3 pt-3">
      <Breadcrumb items={breadcrumbItems} />

      {/*
       * Two-column grid:
       *   left  = minmax(0,1fr)  — covers + details + writer + reviews
       *   right = 18rem (288px)  — Related Reads, matches ~295px in target
       *
       * Stacks to single column below lg.
       */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_30%] lg:gap-4 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="min-w-0">

          {/* Product summary: covers pair + details side by side */}
          <div className="flex flex-col sm:flex-row items-start gap-4">

            {/* Covers pair — each cover ~200px wide */}
            <div className="flex gap-2 shrink-0">

              {/* Front cover — w-[12.5rem] = 200px */}
              <img
                src={frontSrc}
                alt={`Front cover of ${book.title}`}
                className="w-[12.5rem] aspect-[2/3] object-cover shrink-0"
              />

              {/* Back cover */}
              {backSrc ? (
                <img
                  src={backSrc}
                  alt={`Back cover of ${book.title}`}
                  className="w-[12.5rem] aspect-[2/3] object-cover shrink-0 hidden sm:block"
                />
              ) : (
                <div className="w-[12.5rem] aspect-[2/3] bg-surface p-3 text-ink-soft hidden sm:flex flex-col justify-between shrink-0">
                  <div>
                    <p className="text-ink text-center italic text-xs leading-snug mb-2">
                      "{book.backCoverText.slice(0, 60)}..."
                    </p>
                    <p className="leading-relaxed line-clamp-6 text-xs">{book.backCoverText}</p>
                  </div>
                  <p className="text-ink-soft text-xs mt-2">ISBN {book.isbn}</p>
                </div>
              )}
            </div>

            {/* Details column */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">

              <h1 className="text-lg font-normal leading-snug">{book.title}</h1>

              <p className="text-sm">
                by{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-link underline hover:text-link-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  {book.authorName}
                </button>
              </p>

              <p className="text-xs text-ink-soft leading-snug">{book.synopsis}</p>

              <p className="text-xs">
                <span className="text-ink-soft">Published by:</span>{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-link underline hover:text-link-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  {book.publisher}
                </button>
              </p>

              <p className="text-xs text-ink">{book.format}</p>

              <div className="flex flex-wrap gap-x-1 text-xs">
                {book.categories.filter((c) => c !== 'All').map((cat, i, arr) => (
                  <span key={cat}>
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="text-link underline hover:text-link-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      {cat}
                    </button>
                    {i < arr.length - 1 && <span className="text-ink-soft">,</span>}
                  </span>
                ))}
              </div>

              <p className="text-2xl font-semibold">₹{book.price}</p>
              <p className="text-xs text-ink-soft">
                Delivery by <span className="font-semibold">{book.deliveryDate}</span>
              </p>

              {/* Action buttons — 48px tall, side by side */}
              <div className="mt-1.5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-11 min-w-36 flex items-center justify-between px-3.5 bg-brand hover:bg-brand-hover text-white text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Add to Cart
                  <CartIcon />
                </button>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className={`h-11 min-w-40 flex items-center justify-between px-3.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                    inWishlist
                      ? 'border border-brand text-link bg-transparent'
                      : 'bg-neutral hover:bg-neutral-hover text-white'
                  }`}
                >
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  <BookmarkIcon filled={inWishlist} />
                </button>
              </div>

              {/* Stats row: Language / Rating / Sells */}
              <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <div className="flex items-center gap-1">
                    <LanguageIcon />
                    <span className="text-xs text-ink-soft">Language</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-link underline hover:text-link-hover text-xs mt-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {book.language}
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <StarOutlineIcon />
                    <span className="text-xs text-ink-soft">Rating</span>
                  </div>
                  <div className="mt-0.5">
                    <StarRating value={book.rating} size="sm" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <SellsIcon />
                    <span className="text-xs text-ink-soft">Sells</span>
                  </div>
                  <p className="text-xs font-semibold text-ink mt-0.5">
                    {book.sells.toLocaleString()} copies sold
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About the writer */}
          {author && <WriterProfile author={author} />}

          {/* Reviews */}
          <ReviewSection bookId={book.id} />
        </div>

        {/* ── RIGHT COLUMN — Related Reads ─────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-10 lg:mt-0 lg:border-l lg:border-field lg:pl-4">
            <RelatedBooks books={related} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
