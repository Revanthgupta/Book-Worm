import { Link, useNavigate } from 'react-router-dom';
import type { Book } from '../../types/book';

interface RelatedBooksProps {
  books: Book[];
}

const RelatedBooks = ({ books }: RelatedBooksProps) => {
  const navigate = useNavigate();

  return (
    <aside aria-label="Related Reads">
      <h2 className="text-lg font-normal mb-3">Related Reads</h2>
      <div className="flex flex-col gap-4">
        {books.map((book) => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="flex gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {/* Cover — w-20 = 80px, matching ~80px in target sidebar */}
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                className="w-20 aspect-[2/3] object-cover shrink-0"
              />
            ) : (
              <div
                className="w-20 aspect-[2/3] shrink-0 bg-surface"
              />
            )}

            {/* Meta */}
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-sm font-normal group-hover:text-link transition-colors">
                {book.title}
              </h3>
              <p className="text-xs mt-0.5">
                by{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                  className="text-link underline hover:text-link-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  {book.authorName}
                </button>
              </p>
              <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                {book.synopsis}
              </p>
              <p className="text-xs text-ink mt-1">{book.format}</p>
              <div className="flex flex-wrap gap-x-0.5 mt-0.5">
                {book.categories.slice(0, 2).map((cat, i) => (
                  <span key={cat} className="text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                      }}
                      className="text-link underline hover:text-link-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      {cat}
                    </button>
                    {i < Math.min(book.categories.length, 2) - 1 && (
                      <span className="text-ink-soft">,</span>
                    )}
                  </span>
                ))}
              </div>
              {/* Star ratings intentionally omitted per spec */}
              <p className="text-lg font-semibold mt-auto pt-1">₹{book.price}</p>
              <p className="text-xs text-ink-soft">
                Delivery by{' '}
                <span className="font-semibold">{book.deliveryDate}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default RelatedBooks;
