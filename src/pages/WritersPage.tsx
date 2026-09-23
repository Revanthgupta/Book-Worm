import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import axiosClient from '../services/axiosClient';
import type { Author, Book } from '../types/book';

// ── API helpers ───────────────────────────────────────────────────────────────

// The backend returns snake_case fields; map to the camelCase Book type.
interface ApiBookResponse {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  publisher: string | null;
  format: Book['format'];
  categories: Book['categories'];
  price: number;
  cover_image: string | null;
  synopsis: string | null;
  back_cover_text: string | null;
  language: Book['language'];
  rating: number | null;
  sells: number;
  delivery_date: string;
  featured?: boolean;
  bestseller?: boolean;
  new_launch?: boolean;
}

function mapBook(b: ApiBookResponse): Book {
  return {
    id: b.id,
    title: b.title,
    authorId: b.author_id,
    authorName: b.author_name,
    publisher: b.publisher ?? '',
    format: b.format,
    categories: b.categories,
    price: b.price,
    coverImage: b.cover_image ?? '',
    synopsis: b.synopsis ?? '',
    backCoverText: b.back_cover_text ?? '',
    language: b.language,
    rating: b.rating ?? 0,
    sells: b.sells,
    deliveryDate: b.delivery_date,
    isbn: b.id,
    featured: b.featured,
    bestseller: b.bestseller,
    newLaunch: b.new_launch,
  };
}

async function fetchAllAuthors(): Promise<Author[]> {
  const res = await axiosClient.get<Author[]>('/authors');
  return res.data;
}

async function fetchFollowedAuthorIds(): Promise<string[]> {
  const res = await axiosClient.get<{ author_id: string }[]>('/authors/followed');
  return res.data.map((r) => r.author_id);
}

async function fetchAuthorBooks(authorId: string): Promise<Book[]> {
  const res = await axiosClient.get<ApiBookResponse[]>(`/authors/${authorId}/books`);
  return res.data.map(mapBook);
}

async function apiFollow(authorId: string): Promise<void> {
  await axiosClient.post(`/authors/followed/${authorId}`);
}

async function apiUnfollow(authorId: string): Promise<void> {
  await axiosClient.delete(`/authors/followed/${authorId}`);
}

// ── BookMiniCard ──────────────────────────────────────────────────────────────
const BookMiniCard = ({ book }: { book: Book }) => (
  <Link
    to={`/books/${book.id}`}
    className="flex gap-2 p-2 rounded hover:bg-bw-bg transition-colors group"
  >
    <img
      src={book.coverImage}
      alt={`Cover of ${book.title}`}
      className="rounded object-cover shrink-0"
      style={{ width: '40px', height: '56px' }}
    />
    <div className="min-w-0">
      <p className="text-white text-xs font-medium group-hover:text-bw-accent transition-colors line-clamp-1">
        {book.title}
      </p>
      <p className="text-bw-muted text-xs">{book.format}</p>
      <p className="text-white text-xs font-semibold mt-0.5">₹{book.price}</p>
    </div>
  </Link>
);

// ── WriterCard ────────────────────────────────────────────────────────────────
interface WriterCardProps {
  author: Author;
  books: Book[];
  followed: boolean;
  toggling: boolean;
  onToggle: (id: string) => void;
}

const WriterCard = ({ author, books, followed, toggling, onToggle }: WriterCardProps) => (
  <div className="bg-bw-card rounded-lg border border-bw-border p-5">
    {/* Author header */}
    <div className="flex items-start gap-4 mb-4">
      <img
        src={author.photo}
        alt={author.name}
        className="w-14 h-14 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h2 className="text-white font-semibold text-base">{author.name}</h2>
        <p className="text-bw-muted text-xs mt-1 line-clamp-2 leading-relaxed">
          {author.bio}
        </p>
      </div>
      <button
        onClick={() => onToggle(author.id)}
        disabled={toggling}
        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded border transition-colors disabled:opacity-50 ${
          followed
            ? 'bg-bw-primary/20 border-bw-primary text-bw-accent hover:bg-red-600/10 hover:border-red-500 hover:text-red-400'
            : 'border-bw-border text-bw-muted hover:border-bw-primary hover:text-white'
        }`}
        aria-pressed={followed}
        aria-label={followed ? `Unfollow ${author.name}` : `Follow ${author.name}`}
      >
        {toggling ? '…' : followed ? 'Following' : 'Follow'}
      </button>
    </div>

    {/* Author's books */}
    {books.length > 0 && (
      <div>
        <p className="text-bw-muted text-xs mb-2">Books by {author.name}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {books.slice(0, 3).map((book) => (
            <BookMiniCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    )}
  </div>
);

// ── WritersPage ───────────────────────────────────────────────────────────────
const WritersPage = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [booksByAuthor, setBooksByAuthor] = useState<Record<string, Book[]>>({});
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyFollowed, setShowOnlyFollowed] = useState(false);

  // Load all authors + followed IDs + books per author on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [allAuthors, followedResult] = await Promise.all([
          fetchAllAuthors(),
          isAuthenticated ? fetchFollowedAuthorIds() : Promise.resolve([] as string[]),
        ]);

        if (cancelled) return;
        setAuthors(allAuthors);
        setFollowedIds(followedResult);

        // Fetch books for each author in parallel
        const bookEntries = await Promise.all(
          allAuthors.map(async (a) => {
            const books = await fetchAuthorBooks(a.id);
            return [a.id, books] as [string, Book[]];
          }),
        );
        if (!cancelled) {
          setBooksByAuthor(Object.fromEntries(bookEntries));
        }
      } catch {
        if (!cancelled) setError('Failed to load authors. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleToggle = useCallback(
    async (authorId: string) => {
      if (!isAuthenticated || togglingId) return;
      setTogglingId(authorId);
      try {
        if (followedIds.includes(authorId)) {
          await apiUnfollow(authorId);
          setFollowedIds((prev) => prev.filter((id) => id !== authorId));
        } else {
          await apiFollow(authorId);
          setFollowedIds((prev) => [...prev, authorId]);
        }
      } catch {
        // Silently ignore — button re-enables, state unchanged
      } finally {
        setTogglingId(null);
      }
    },
    [followedIds, isAuthenticated, togglingId],
  );

  const displayedAuthors = showOnlyFollowed
    ? authors.filter((a) => followedIds.includes(a.id))
    : authors;

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-bw-muted text-base animate-pulse">Loading authors…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-red-400 text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-bw-accent hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-white font-semibold text-2xl">My Writers</h1>

        {/* Filter toggle */}
        <button
          onClick={() => setShowOnlyFollowed((v) => !v)}
          className={`text-sm font-medium px-4 py-2 rounded border transition-colors ${
            showOnlyFollowed
              ? 'bg-bw-primary border-bw-primary text-white'
              : 'border-bw-border text-bw-muted hover:text-white'
          }`}
        >
          {showOnlyFollowed ? 'Show All Writers' : 'Show Followed Only'}
        </button>
      </div>

      {displayedAuthors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-bw-muted text-lg mb-2">No followed writers yet</p>
          <p className="text-bw-muted text-sm mb-4">
            Follow authors you love to keep track of their work.
          </p>
          <button
            onClick={() => setShowOnlyFollowed(false)}
            className="text-bw-accent hover:underline text-sm"
          >
            Show all writers →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedAuthors.map((author) => (
            <WriterCard
              key={author.id}
              author={author}
              books={booksByAuthor[author.id] ?? []}
              followed={followedIds.includes(author.id)}
              toggling={togglingId === author.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WritersPage;
