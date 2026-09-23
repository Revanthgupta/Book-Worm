import { Link, useNavigate } from 'react-router-dom';
import type { Book, Category } from '../../types/book';
import { useAppDispatch } from '../../store/hooks';
import { setSelectedCategory } from '../../features/books/booksSlice';

interface BookCardProps {
  book: Book;
  /** 'default' = full card (Homepage); 'compact' = smaller sidebar card (Related Reads) */
  variant?: 'default' | 'compact';
}

const BookCard = ({ book, variant = 'default' }: BookCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  const handleCategoryClick = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setSelectedCategory(cat));
    navigate('/');
  };

  // ── compact variant (Product Detail sidebar) — untouched ─────────────────
  if (isCompact) {
    return (
      <Link
        to={`/books/${book.id}`}
        className="flex bg-bw-card rounded-lg overflow-hidden hover:bg-bw-border/40 transition-colors group gap-3 p-2"
      >
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="object-cover rounded shrink-0"
          style={{ width: '64px', height: '88px' }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-white font-semibold leading-snug group-hover:text-bw-accent transition-colors line-clamp-2 text-sm">
            {book.title}
          </h3>
          <p className="text-bw-accent mt-0.5 text-xs">by {book.authorName}</p>
          <p className="text-bw-muted text-xs mt-1">{book.format}</p>
          <div className="flex flex-wrap gap-x-0.5 mt-1">
            {book.categories.slice(0, 3).map((cat, i) => (
              <span key={cat} className="text-xs">
                <button
                  onClick={(e) => handleCategoryClick(e, cat)}
                  className="text-bw-accent hover:underline text-xs"
                >
                  {cat}
                </button>
                {i < Math.min(book.categories.length, 3) - 1 && (
                  <span className="text-bw-muted">,&nbsp;</span>
                )}
              </span>
            ))}
          </div>
          <p className="text-white font-semibold mt-auto pt-1 text-sm">₹{book.price}</p>
          <p className="text-bw-muted text-xs">
            Delivery by <span className="font-medium text-bw-muted">{book.deliveryDate}</span>
          </p>
        </div>
      </Link>
    );
  }

  // ── default variant (Homepage) — Carbon flat horizontal item ──────────────
  return (
    <Link
      to={`/books/${book.id}`}
      className="flex gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
    >
      {/* Cover */}
      <img
        src={book.coverImage}
        alt={`Cover of ${book.title}`}
        className="w-28 shrink-0 object-cover self-start"
        style={{ aspectRatio: '2/3' }}
      />

      {/* Text column */}
      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-base font-normal text-ink line-clamp-2 leading-snug">
          {book.title}
        </h3>

        <p className="text-sm text-ink mt-0.5">
          by{' '}
          <span
            onClick={(e) => e.preventDefault()}
            className="text-link underline hover:text-link-hover"
          >
            {book.authorName}
          </span>
        </p>

        <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-snug">
          {book.synopsis}
        </p>

        <p className="text-xs text-ink mt-1">{book.format}</p>

        {/* Genre links */}
        <div className="flex flex-wrap gap-x-0.5 mt-1">
          {book.categories.slice(0, 3).map((cat, i) => (
            <span key={cat} className="text-xs">
              <button
                onClick={(e) => handleCategoryClick(e, cat)}
                className="text-link underline hover:text-link-hover text-xs"
              >
                {cat}
              </button>
              {i < Math.min(book.categories.length, 3) - 1 && (
                <span className="text-ink">,&nbsp;</span>
              )}
            </span>
          ))}
        </div>

        {/* Price + delivery — pinned to bottom */}
        <div className="mt-auto pt-1">
          <p className="text-lg font-semibold text-ink">₹{book.price}</p>
          <p className="text-xs text-ink-soft">
            Delivery by{' '}
            <span className="font-semibold text-ink">{book.deliveryDate}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
