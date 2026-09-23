import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loadCartFromApi } from '../cart/cartSlice';
import { buyAgainApi } from './ordersSlice';
import type { Order, OrderStatus } from '../../types/order';

// ── Status badge ──────────────────────────────────────────────────────────────
const statusColors: Record<OrderStatus, string> = {
  Processing: 'bg-yellow-600/30 text-yellow-400',
  Shipped:    'bg-blue-600/30 text-blue-400',
  Delivered:  'bg-green-600/30 text-green-400',
  Cancelled:  'bg-red-600/30 text-red-400',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
  >
    {status}
  </span>
);

// ── OrderCard ─────────────────────────────────────────────────────────────────
interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleBuyAgain = async () => {
    await dispatch(buyAgainApi(order.id));
    await dispatch(loadCartFromApi());
    navigate('/cart');
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Support both legacy items (full Book) and apiItems (snapshot)
  const displayItems = order.apiItems
    ? order.apiItems.map((i) => ({ coverImage: i.cover_image ?? '', title: i.book_title, id: i.book_id ?? i.id }))
    : (order.items ?? []).map((i) => ({ coverImage: i.book.coverImage, title: i.book.title, id: i.book.id }));

  const itemCount = order.apiItems
    ? order.apiItems.reduce((s, i) => s + i.quantity, 0)
    : (order.items ?? []).reduce((s, i) => s + i.quantity, 0);

  const firstTitle = displayItems[0]?.title ?? 'Unknown item';

  return (
    <div className="bg-bw-card p-5 border border-bw-border">
      {/* Order header: ID + date on left, status + total on right */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-white font-semibold text-sm">{order.id}</p>
          <p className="text-bw-muted text-xs mt-0.5">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-white font-bold">₹{order.total.toFixed(0)}</span>
        </div>
      </div>

      {/* Book cover thumbnails — up to 4, then overflow count */}
      <div className="flex gap-2 flex-wrap mb-4">
        {displayItems.slice(0, 4).map((item) => (
          <img
            key={item.id}
            src={item.coverImage}
            alt={item.title}
            className="object-cover"
            style={{ width: '100px', height: '120px' }}
            title={item.title}
          />
        ))}
        {displayItems.length > 4 && (
          <div
            className="bg-bw-bg border border-bw-border flex items-center justify-center text-bw-muted text-xs"
            style={{ width: '48px', height: '68px' }}
          >
            +{displayItems.length - 4}
          </div>
        )}
      </div>

      {/* Brief item summary */}
      <p className="text-bw-muted text-xs mb-4">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} · {firstTitle}
        {displayItems.length > 1 ? ` and ${displayItems.length - 1} more` : ''}
      </p>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          to={`/orders/${order.id}`}
          className="text-sm text-bw-accent hover:underline"
        >
          View Details →
        </Link>
        <button
          onClick={handleBuyAgain}
          className="text-sm hover:bg-blue-700 active:bg-blue-800 bg-brand text-white px-4 py-1.5 transition-colors"
        >
          Buy Again
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
