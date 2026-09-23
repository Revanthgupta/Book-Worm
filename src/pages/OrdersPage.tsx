import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectOrdersByUser, fetchOrders } from '../features/orders/ordersSlice';
import OrderCard from '../features/orders/OrderCard';

// ── OrdersPage ────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.user?.id ?? '');
  const orders = useAppSelector(selectOrdersByUser(userId));

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <h1 className="text-white font-semibold text-2xl mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="w-16 h-16 text-bw-border mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-bw-muted text-lg mb-2">No orders yet</p>
          <p className="text-bw-muted text-sm mb-6">
            Browse the catalogue and place your first order.
          </p>
          <Link
            to="/"
            className="bg-brand hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-6 py-2.5 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
