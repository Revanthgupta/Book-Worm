import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectOrderById, markPointsAwarded } from '../features/orders/ordersSlice';
import { BookIllustrationBackground } from './PaymentPage';

// ── Green checkmark icon ──────────────────────────────────────────────────────
const CheckIcon = () => (
  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 mx-auto mb-5">
    <svg
      className="w-7 h-7 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

// ── ConfirmationPage ──────────────────────────────────────────────────────────
const ConfirmationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const lastOrderId = useAppSelector((s) => s.payment.lastConfirmedOrderId);
  const order = useAppSelector(
    lastOrderId ? selectOrderById(lastOrderId) : () => undefined,
  );

  // If there's no pending order, redirect to home
  useEffect(() => {
    if (!lastOrderId) {
      navigate('/', { replace: true });
    }
  }, [lastOrderId, navigate]);

  // Gift points are now awarded by the backend at checkout; no need to award here.
  // Just mark locally if needed.
  useEffect(() => {
    if (order && !order.pointsAwarded) {
      dispatch(markPointsAwarded(order.id));
    }
  }, [order, dispatch]);

  if (!order) return null;

  return (
    <div className="relative min-h-screen flex flex-col">
      <BookIllustrationBackground />

      {/* Header overlay */}
      <header className="relative z-10 bg-bw-bg border-b border-bw-border">
        <div className="flex items-center h-14 px-4 gap-4">
          <button aria-label="Menu" className="text-bw-muted p-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 4h4v4H2V4zm6 0h4v4H8V4zm6 0h4v4h-4V4zM2 10h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zM2 16h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>
          <Link to="/" className="text-white font-bold text-lg">Book Worm</Link>
          <span className="hidden sm:block text-bw-border text-xl select-none">|</span>
          <nav className="hidden sm:flex items-center gap-6" aria-label="Primary navigation">
            <a href="/orders" className="text-sm text-bw-muted hover:text-white">My Orders</a>
            <a href="/wishlist" className="text-sm text-bw-muted hover:text-white">My Wishlist</a>
            <a href="/writers" className="text-sm text-bw-muted hover:text-white">My Writers</a>
          </nav>
        </div>
      </header>

      {/* Centred confirmation panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="bg-bw-card rounded-lg w-full px-8 py-8"
          style={{ maxWidth: '600px' }}
          role="status"
          aria-live="polite"
          aria-label="Order confirmation"
        >
          {/* Checkmark */}
          <CheckIcon />

          {/* Success message */}
          <p className="text-white text-center text-lg font-light leading-snug mb-6">
            Your purchase of the<br />following reads is successful
          </p>

          {/* Purchased books */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {(order.apiItems ?? order.items?.map((i) => ({
              id: i.book.id,
              book_id: i.book.id,
              book_title: i.book.title,
              author_name: i.book.authorName,
              price_at_purchase: i.book.price,
              quantity: i.quantity,
              format: i.book.format,
              cover_image: i.book.coverImage,
              delivery_date: i.book.deliveryDate,
            })) ?? []).map((item) => (
              <div key={item.id ?? item.book_id} className="flex gap-3">
                <Link to={`/books/${item.book_id}`} className="shrink-0">
                  <img
                    src={item.cover_image ?? ''}
                    alt={`Cover of ${item.book_title}`}
                    className="rounded object-cover"
                    style={{ width: '80px', height: '110px' }}
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/books/${item.book_id}`}
                    className="text-white font-semibold text-sm hover:text-bw-accent transition-colors line-clamp-1"
                  >
                    {item.book_title}
                  </Link>
                  <p className="text-bw-accent text-xs mt-0.5">by {item.author_name}</p>
                  <p className="text-bw-muted text-xs">{item.format}</p>
                  <p className="text-white font-semibold text-base mt-1">
                    ₹{item.price_at_purchase}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </p>
                  <p className="text-bw-muted text-xs">
                    Delivery by <span className="font-medium">{item.delivery_date}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Gift points earned */}
          {Math.floor(order.total * 0.01) > 0 && (
            <p className="text-center text-bw-accent text-sm mb-5">
              🎁 You earned {Math.floor(order.total * 0.01)} gift points on this order!
            </p>
          )}

          {/* Continue Shopping */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 bg-bw-primary hover:bg-bw-primary-hover text-white font-medium px-6 py-2.5 rounded transition-colors"
            >
              Continue your Shopping
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>
          </div>

          {/* View Orders link */}
          <p className="text-center mt-3">
            <Link to="/orders" className="text-bw-accent text-sm hover:underline">
              View My Orders →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
