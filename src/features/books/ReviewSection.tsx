import { useState, useEffect } from 'react';
import StarRating from '../../components/StarRating';
import axiosClient from '../../services/axiosClient';
import { useAppSelector } from '../../store/hooks';
import type { Review } from '../../types/book';

interface ReviewSectionProps {
  bookId: string;
}

const MAX_CHARS = 100;

interface ApiReview {
  id: string;
  book_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  text: string;
}

function mapApiReview(r: ApiReview): Review {
  return {
    id: r.id,
    bookId: r.book_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    text: r.text,
    createdAt: 0,
  };
}

const ReviewSection = ({ bookId }: ReviewSectionProps) => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  // Load reviews from API on mount / when bookId changes
  useEffect(() => {
    axiosClient
      .get<ApiReview[]>(`/books/${bookId}/reviews`)
      .then((res) => setReviews(res.data.map(mapApiReview)))
      .catch(() => setReviews([]));
  }, [bookId]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setError('Please log in to leave a review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (text.trim() === '') {
      setError('Please write your review.');
      return;
    }
    try {
      const res = await axiosClient.post<ApiReview>(`/books/${bookId}/reviews`, {
        rating,
        text: text.trim(),
      });
      setReviews((prev) => [mapApiReview(res.data), ...prev]);
      setText('');
      setRating(0);
      setError('');
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Failed to submit review.';
      setError(detail);
    }
  };

  const canSubmit = text.trim().length > 0 && rating > 0;

  return (
    <section className="mt-10" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-normal mb-3">
        Reviews
      </h2>

      {/* Reviews body: form left, list right; stacks on md and below */}
      <div className="flex flex-col md:flex-row gap-10">

        {/* ── Left — Review form ── */}
        <div className="w-full md:w-[29.75rem] shrink-0">
          {/* Label row with character counter */}
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="review-text" className="text-xs text-ink-soft">
              Leave Your Review
            </label>
            <span className="text-xs text-ink-soft">
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          {/* Textarea */}
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
            }}
            maxLength={MAX_CHARS}
            placeholder="Placeholder text"
            className="w-full h-40 bg-surface p-3 text-sm text-ink placeholder:text-ink-dim border-0 border-b border-rule resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ borderRadius: 0 }}
          />

          {error && (
            <p className="text-danger text-xs mt-1">{error}</p>
          )}

          {/* Footer row: star picker + submit button */}
          <div className="mt-3 flex justify-between items-center">
            {/* Interactive star picker */}
            <div role="group" aria-label="Select your rating">
              <StarRating value={rating} onChange={setRating} size="md" />
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              className={`w-36 h-12 flex items-center justify-between px-3.5 bg-brand hover:bg-brand-hover text-white text-sm transition-colors ${
                !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Submit
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Right — Review list ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No reviews yet. Be the first to review this book.
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id}>
                <p className="text-base">{r.userName}</p>
                <p className="text-sm text-ink-soft leading-relaxed mt-2">{r.text}</p>
                <div className="mt-2">
                  <StarRating value={r.rating} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
