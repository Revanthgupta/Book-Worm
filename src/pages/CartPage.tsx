import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCartItems, loadCartFromApi } from '../features/cart/cartSlice';
import CartItemCard from '../features/cart/CartItemCard';
import AddressForm from '../features/cart/AddressForm';
import { validateAddress } from '../features/cart/validateAddress';
import CartSummary from '../features/cart/CartSummary';
import Breadcrumb from '../components/Breadcrumb';
import type { Address } from '../types/cart';
import { emptyAddress } from '../types/cart';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);

  // Load cart from API on mount to sync server state
  useEffect(() => {
    dispatch(loadCartFromApi());
  }, [dispatch]);

  const [address, setAddress] = useState<Address>(emptyAddress);
  const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof Address, string>>>({});

  // Memoised so AddressForm doesn't re-render on every parent state change
  const handleAddressChange = useCallback((addr: Address) => {
    setAddress(addr);
    // Clear individual field errors as user types
    setAddrErrors((prev) => {
      const next = { ...prev };
      (Object.keys(addr) as Array<keyof Address>).forEach((k) => {
        if (addr[k]) delete next[k];
      });
      return next;
    });
  }, []);

  const handlePayNow = () => {
    const errors = validateAddress(address);
    if (Object.keys(errors).length > 0) {
      setAddrErrors(errors);
      // Scroll to address section
      document.getElementById('address-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/payment');
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shopping Cart' }]} />
        <h1 className="text-white font-semibold text-2xl mb-8">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-line mb-4" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M9 20a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="text-bw-muted text-lg mb-2">Your cart is empty</p>
          <p className="text-bw-muted text-sm mb-6">Add books from the catalogue to get started.</p>
          <Link
            to="/"
            className="bg-bw-primary hover:bg-bw-primary-hover text-white font-medium px-6 py-2.5 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  const firstBook = items[0].book;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      {/* Breadcrumb matching screenshot: Home / Non-Fiction / Self Help / Joy of Minimalism / Checkout */}
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: firstBook.categories[0] ?? 'Books', to: '/' },
          { label: firstBook.title, to: `/books/${firstBook.id}` },
          { label: 'Checkout' },
        ]}
      />

      <h1 className="text-white font-semibold text-2xl mb-4">Shopping Cart</h1>

      {/* ── Cart items grid ──────────────────────────────────────────────── */}
      <div className="bg-bw-card mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-bw-border">
          {items.map((item) => (
            <CartItemCard key={item.book.id} item={item} />
          ))}
        </div>
      </div>

      {/* ── Address + Summary row ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start" id="address-section">
        {/* Address form — left, takes ~60% */}
        <div className="flex-1 min-w-0">
          <AddressForm
            value={address}
            onChange={handleAddressChange}
            errors={addrErrors}
          />
        </div>

        {/* Grand Total panel — right, fixed width; wide enough for illustration + price column */}
        <div className="lg:w-md shrink-0">
          <CartSummary onPayNow={handlePayNow} />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
