/** StarRating — supports filled, half, and empty stars.
 *
 * Interactive mode: pass onChange to allow clicking to set a rating.
 * Display mode: omit onChange for a read-only display.
 *
 * Size variants:
 *   'sm'  → w-3.5 h-3.5  (14px — used in stats row and review list)
 *   'md'  → w-5 h-5       (20px — used in review form picker)
 */

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

type StarType = 'full' | 'half' | 'empty';

function getStarType(star: number, value: number): StarType {
  if (value >= star) return 'full';
  if (value >= star - 0.5) return 'half';
  return 'empty';
}

interface StarRatingProps {
  /** Current value 1–5, supports decimals for half-stars */
  value: number;
  /** If provided, renders interactive stars and calls onChange on click */
  onChange?: (rating: number) => void;
  /** 'sm' = 14px (w-3.5), 'md' = 20px (w-5) */
  size?: 'sm' | 'md';
}

const StarRating = ({ value, onChange, size = 'md' }: StarRatingProps) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const isInteractive = typeof onChange === 'function';

  // Star colors
  const filledColor  = '#f1c21b'; // text-star
  const emptyStroke  = '#c6c6c6'; // text-ink-soft

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Rating: ${value} out of 5 stars`}
      role={isInteractive ? 'group' : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const type = getStarType(star, value);
        const clipId = `half-clip-${star}`;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(star)}
            aria-label={isInteractive ? `Rate ${star} out of 5` : undefined}
            className={`${starSize} transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
              isInteractive
                ? 'cursor-pointer hover:scale-110'
                : 'cursor-default pointer-events-none'
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className="w-full h-full"
              aria-hidden="true"
              overflow="visible"
            >
              {type === 'half' && (
                <defs>
                  <clipPath id={clipId}>
                    <rect x="0" y="0" width="10" height="20" />
                  </clipPath>
                </defs>
              )}

              {/* Outline / empty layer */}
              <path
                d={STAR_PATH}
                fill="none"
                stroke={type === 'full' ? filledColor : emptyStroke}
                strokeWidth={1.5}
              />

              {/* Filled layer (full or half) */}
              {type !== 'empty' && (
                <path
                  d={STAR_PATH}
                  fill={filledColor}
                  stroke={filledColor}
                  strokeWidth={1.5}
                  clipPath={type === 'half' ? `url(#${clipId})` : undefined}
                />
              )}
            </svg>
          </button>
        );
      })}
    </span>
  );
};

export default StarRating;
