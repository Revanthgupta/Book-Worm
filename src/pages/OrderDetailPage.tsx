import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectOrderById, cancelOrderApi, buyAgainApi, fetchOrderById } from '../features/orders/ordersSlice';
import { loadCartFromApi } from '../features/cart/cartSlice';
import { StatusBadge } from '../features/orders/OrderCard';
import { useEffect } from 'react';

// Stable snapshot of "now" — initialised once per page module load.
let _pageLoadTime = 0;
function getPageLoadTime() {
  if (_pageLoadTime === 0) _pageLoadTime = Date.now();
  return _pageLoadTime;
}

// ── OrderDetailPage ───────────────────────────────────────────────────────────
const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userId = useAppSelector((s) => s.auth.user?.id ?? '');
  const order = useAppSelector(id ? selectOrderById(id) : () => undefined);
  const now = getPageLoadTime();

  // Load this specific order from API if not yet in store
  useEffect(() => {
    if (id && !order) {
      dispatch(fetchOrderById(id));
    }
  }, [id, order, dispatch]);

  // 404 guard
  if (!order) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <Link to="/orders" className="text-bw-accent hover:underline text-sm">
          ← Back to My Orders
        </Link>
        <p className="text-bw-muted text-lg mt-8 text-center">Order not found.</p>
      </div>
    );
  }

  const isOwner = order.userId === userId;
  const canCancel =
    isOwner &&
    order.status !== 'Cancelled' &&
    order.status !== 'Delivered' &&
    now < order.createdAt + 48 * 60 * 60 * 1000;

  const handleCancel = async () => {
    if (!canCancel) return;
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await dispatch(cancelOrderApi(order.id));
    }
  };

  const handleBuyAgain = async () => {
    await dispatch(buyAgainApi(order.id));
    await dispatch(loadCartFromApi());
    navigate('/cart');
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
  });

  const hoursLeft = Math.max(
    0,
    Math.floor((order.createdAt + 48 * 60 * 60 * 1000 - now) / (60 * 60 * 1000)),
  );

  // Support both legacy and API items
  const displayItems = order.apiItems
    ? order.apiItems.map((i) => ({
        id: i.id,
        bookId: i.book_id,
        title: i.book_title,
        authorName: i.author_name,
        price: i.price_at_purchase,
        quantity: i.quantity,
        format: i.format,
        coverImage: i.cover_image ?? '',
        deliveryDate: i.delivery_date,
        categories: [] as string[],
      }))
    : (order.items ?? []).map((i) => ({
        id: i.book.id,
        bookId: i.book.id,
        title: i.book.title,
        authorName: i.book.authorName,
        price: i.book.price,
        quantity: i.quantity,
        format: i.book.format,
        coverImage: i.book.coverImage,
        deliveryDate: i.book.deliveryDate,
        categories: i.book.categories as string[],
      }));

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-6">
        <Link to="/orders" className="text-bw-accent hover:underline">My Orders</Link>
        <span className="text-bw-muted">/</span>
        <span className="text-bw-muted truncate">{order.id}</span>
      </div>

      {/* Order header */}
      <div className="bg-bw-card p-5 border border-bw-border mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-semibold text-xl">Order {order.id}</h1>
            <p className="text-bw-muted text-sm mt-1">Placed on {formattedDate}</p>
            <p className="text-bw-muted text-sm mt-0.5">
              Payment: <span className="capitalize">{order.paymentMethod.replace('-', ' ')}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.status} />
            <span className="text-white font-bold text-xl">₹{order.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t border-bw-border grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-bw-muted text-xs">Subtotal</p>
            <p className="text-white text-sm font-medium">₹{order.subtotal.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-bw-muted text-xs">Tax (12%)</p>
            <p className="text-white text-sm font-medium">₹{order.tax.toFixed(0)}</p>
          </div>
          {order.discount > 0 && (
            <div>
              <p className="text-bw-muted text-xs">Discount</p>
              <p className="text-green-400 text-sm font-medium">−₹{order.discount.toFixed(0)}</p>
            </div>
          )}
          <div>
            <p className="text-bw-muted text-xs">Total</p>
            <p className="text-white text-sm font-bold">₹{order.total.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-bw-card border border-bw-border mb-5 divide-y divide-bw-border">
        {displayItems.map((item) => (
          <div key={item.id} className="flex gap-4 p-4">
            <Link to={`/books/${item.bookId}`} className="shrink-0">
              <img
                src={item.coverImage}
                alt={`Cover of ${item.title}`}
                className="object-cover"
                style={{ width: '108px', height: '112px' }}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/books/${item.bookId}`}
                className="text-white font-semibold text-base hover:text-bw-accent transition-colors"
              >
                {item.title}
              </Link>
              <p className="text-ink text-sm mt-0.5">by{' '}<span className="text-link underline hover:text-link-hover">{item.authorName}</span></p>
              <p className="text-bw-muted text-xs mt-1">{item.format}</p>
              <p className="text-white font-semibold mt-2">
                ₹{item.price}{item.quantity > 1 ? <span className="text-bw-muted text-sm"> × {item.quantity}</span> : ''}
              </p>
              <p className="text-bw-muted text-xs">
                Delivery by <span className="font-semibold text-white">{item.deliveryDate}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 48h cancellation info */}
      {order.status !== 'Cancelled' && order.status !== 'Delivered' && isOwner && (
        <div className="bg-bw-card p-4 border border-bw-border mb-5">
          {canCancel ? (
            <p className="text-bw-muted text-sm">
              ⏱ Cancellation available for the next{' '}
              <span className="text-white font-medium">{hoursLeft}h</span>
            </p>
          ) : (
            <p className="text-bw-muted text-sm">
              ⚠ The 48-hour cancellation window for this order has passed.
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleBuyAgain}
          className="bg-bw-primary hover:bg-bw-primary-hover text-white font-medium px-6 py-2.5 transition-colors"
        >
          Buy Again
        </button>

        {canCancel && (
          <button
            onClick={handleCancel}
            className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 font-medium px-6 py-2.5 transition-colors"
          >
            Cancel Order
          </button>
        )}

        <Link
          to="/orders"
          className="border border-bw-border text-bw-muted hover:text-white font-medium px-6 py-2.5 transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
