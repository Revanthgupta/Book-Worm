import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectCartTotal,
  selectCartItems,
  clearCart,
} from '../features/cart/cartSlice';
import { addOrder } from '../features/orders/ordersSlice';
import { setGiftPoints } from '../features/authentication/authSlice';
import {
  setPaymentMethod,
  setStatus,
  setLastConfirmedOrderId,
  setRedeemedPoints,
} from '../features/payment/paymentSlice';
import axiosClient from '../services/axiosClient';
import PaymentMethodSelector from '../features/payment/PaymentMethodSelector';
import CreditCardForm from '../features/payment/CreditCardForm';
import type { CardFormState } from '../features/payment/CreditCardForm';
import { emptyCardForm, validateCard } from '../features/payment/validateCard';
import GiftPointsRedemption from '../features/payment/GiftPointsRedemption';
import type { Order } from '../types/order';
import type { PaymentMethod } from '../types/payment';

// ── Book Illustration Background ──────────────────────────────────────────────
// Shared between PaymentPage and ConfirmationPage — exported for reuse.
export const BookIllustrationBackground = () => (
  <div
    className="fixed inset-0 overflow-hidden"
    style={{ backgroundColor: '#0d2137' }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 1440 900"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background gradient shapes */}
      <ellipse cx="1350" cy="80"  rx="180" ry="130" fill="rgba(180,80,20,0.35)" />
      <ellipse cx="100"  cy="820" rx="140" ry="100" fill="rgba(15,60,90,0.45)" />

      {/* Diamond / square decorations */}
      <rect x="580"  y="55"  width="22" height="22" fill="rgba(200,150,50,0.75)" transform="rotate(45 591 66)" />
      <rect x="920"  y="220" width="16" height="16" fill="rgba(200,150,50,0.60)" transform="rotate(45 928 228)" />
      <rect x="250"  y="350" width="14" height="14" fill="rgba(200,80,50,0.55)"  transform="rotate(45 257 357)" />
      <rect x="1100" y="650" width="18" height="18" fill="rgba(200,150,50,0.55)" transform="rotate(45 1109 659)" />
      <rect x="400"  y="750" width="12" height="12" fill="rgba(200,80,50,0.50)"  transform="rotate(45 406 756)" />

      {/* Wavy / organic lines */}
      <path d="M350 200 Q380 150 350 100"  stroke="rgba(180,130,50,0.45)" strokeWidth="2" fill="none" />
      <path d="M1050 700 Q1080 650 1050 600" stroke="rgba(180,130,50,0.35)" strokeWidth="2" fill="none" />

      {/* Large standing book — left centre */}
      <g transform="translate(120,200) rotate(-5)">
        <rect x="0"  y="0"  width="160" height="220" rx="4" fill="#c8783a" />
        <rect x="0"  y="0"  width="16"  height="220" rx="2" fill="rgba(0,0,0,0.25)" />
        <rect x="50" y="40" width="80"  height="10"  rx="2" fill="rgba(200,60,20,0.7)" />
        <rect x="40" y="60" width="90"  height="6"   rx="2" fill="rgba(0,0,0,0.15)" />
      </g>

      {/* Tall thin book — far left top */}
      <g transform="translate(60,90)">
        <rect x="0" y="0" width="50" height="160" rx="3" fill="#2a7aa0" />
        <rect x="0" y="0" width="8"  height="160" rx="2" fill="rgba(0,0,0,0.2)" />
      </g>

      {/* Stacked books — bottom left */}
      <g transform="translate(80,680)">
        <rect x="0"  y="50" width="180" height="28" rx="3" fill="#c8973a" />
        <rect x="10" y="24" width="170" height="28" rx="3" fill="#3a7a9c" />
        <rect x="16" y="0"  width="155" height="26" rx="3" fill="#2a5a7a" />
      </g>

      {/* Open book — bottom right */}
      <g transform="translate(940,680) rotate(3)">
        <rect x="0"   y="0"  width="180" height="130" rx="3" fill="#c8a46e" />
        <rect x="184" y="0"  width="180" height="130" rx="3" fill="#e8d8b5" />
        <rect x="176" y="0"  width="8"   height="130" fill="rgba(0,0,0,0.12)" />
        <line x1="204" y1="30" x2="344" y2="30" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        <line x1="204" y1="50" x2="344" y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        <line x1="204" y1="70" x2="344" y2="70" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        <line x1="204" y1="90" x2="320" y2="90" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
      </g>

      {/* Circle accent — top right */}
      <circle cx="1400" cy="350" r="80" fill="rgba(140,55,20,0.3)" />
    </svg>
  </div>
);

// ── UPI form (local — simple enough to keep inline) ───────────────────────────
const inputCls =
  'w-full bg-field border-b border-rule px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand';

const UpiForm = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1" role="tabpanel">
    <label htmlFor="upi-id" className="text-bw-muted text-xs">UPI ID</label>
    <input
      id="upi-id"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="yourname@upi"
      autoComplete="off"
      className={inputCls}
    />
  </div>
);

// ── Wallet form (local) ────────────────────────────────────────────────────────
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Google Pay'];

const WalletForm = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2" role="tabpanel">
    <p className="text-bw-muted text-xs">Select Wallet</p>
    <div className="grid grid-cols-2 gap-2">
      {WALLETS.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onChange(w)}
          className={`py-2 px-3 rounded text-sm border transition-colors ${
            value === w
              ? 'border-bw-primary bg-bw-primary/20 text-white'
              : 'border-bw-border text-bw-muted hover:border-bw-primary hover:text-white'
          }`}
          aria-pressed={value === w}
        >
          {w}
        </button>
      ))}
    </div>
  </div>
);

// ── PaymentPage ───────────────────────────────────────────────────────────────
const PaymentPage = () => {
  const dispatch      = useAppDispatch();
  const navigate      = useNavigate();

  const user          = useAppSelector((s) => s.auth.user);
  const giftPoints    = useAppSelector((s) => s.auth.giftPoints);
  const selectedMethod = useAppSelector((s) => s.payment.selectedMethod);
  const cartItems     = useAppSelector(selectCartItems);
  const cartTotal     = useAppSelector(selectCartTotal);

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [redeemedAmt, setRedeemedAmt]   = useState(0);
  const [pointsApplied, setPointsApplied] = useState(false);

  const [cardForm, setCardForm]   = useState<CardFormState>(emptyCardForm);
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardFormState, string>>>({});
  const [upiId, setUpiId]         = useState('');
  const [wallet, setWallet]       = useState('');
  const [upiError, setUpiError]   = useState('');
  const [walletError, setWalletError] = useState('');

  const payableAmount = Math.max(0, cartTotal - redeemedAmt);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMethodChange = (method: PaymentMethod) => {
    dispatch(setPaymentMethod(method));
    // Clear errors from the previous method
    setCardErrors({});
    setUpiError('');
    setWalletError('');
  };

  const handleTogglePoints = () => {
    if (pointsApplied) {
      setRedeemedAmt(0);
      setPointsApplied(false);
      dispatch(setRedeemedPoints(0));
    } else {
      const pts = Math.min(giftPoints, cartTotal);
      setRedeemedAmt(pts);
      setPointsApplied(true);
      dispatch(setRedeemedPoints(pts));
    }
  };

  const handlePayNow = async () => {
    // Per-method validation
    if (selectedMethod === 'credit-card' || selectedMethod === 'debit-card') {
      const errs = validateCard(cardForm, selectedMethod === 'debit-card');
      if (Object.keys(errs).length > 0) { setCardErrors(errs); return; }
    } else if (selectedMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setUpiError('Enter a valid UPI ID (e.g. name@upi)');
        return;
      }
    } else if (selectedMethod === 'wallet') {
      if (!wallet) { setWalletError('Please select a wallet'); return; }
    }

    if (!user) return;

    try {
      // Map frontend payment method names to backend expected values
      const methodMap: Record<string, string> = {
        'credit-card': 'card',
        'debit-card': 'card',
        'upi': 'upi',
        'net-banking': 'netbanking',
        'wallet': 'wallet',
        'cod': 'cod',
      };
      const backendMethod = methodMap[selectedMethod] ?? selectedMethod;
      const cardNumber =
        (selectedMethod === 'credit-card' || selectedMethod === 'debit-card')
          ? cardForm.cardNumber.replace(/\s/g, '')
          : undefined;

      const res = await axiosClient.post<{
        order_id: string;
        status: string;
        subtotal: number;
        tax: number;
        discount: number;
        redeemed_points_amount: number;
        total: number;
        points_awarded: number;
        delivery_date: string;
        payment_method: string;
      }>('/checkout', {
        payment_method: backendMethod,
        card_number: cardNumber,
        redeem_points: pointsApplied,
      });

      const co = res.data;

      // Build a minimal Order record to store locally for ConfirmationPage
      const order: Order = {
        id:            co.order_id,
        userId:        user.id,
        items:         cartItems.map((i) => ({ book: i.book, quantity: i.quantity })),
        subtotal:      co.subtotal,
        tax:           co.tax,
        discount:      co.discount,
        redeemedPointsAmount: co.redeemed_points_amount,
        total:         co.total,
        status:        'Processing',
        createdAt:     Date.now(),
        paymentMethod: co.payment_method,
        pointsAwarded: true,
        deliveryDate:  co.delivery_date,
        pointsEarned:  co.points_awarded,
      };

      dispatch(addOrder(order));
      // Refresh backend gift points balance into Redux
      if (co.points_awarded > 0) {
        dispatch(setGiftPoints(
          (giftPoints - redeemedAmt) + co.points_awarded,
        ));
      }
      dispatch(setLastConfirmedOrderId(co.order_id));
      dispatch(setStatus('success'));
      dispatch(clearCart());
      navigate('/confirmation');
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Payment failed. Please try again.';
      // Show error on the Pay Now button area — use upiError as a generic slot
      setUpiError(detail);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col">
      <BookIllustrationBackground />

      {/* Minimal header — same as ConfirmationPage */}
      <header className="relative z-10 bg-bw-bg border-b border-bw-border">
        <div className="flex items-center h-14 px-4 gap-4">
          <button aria-label="Menu" className="text-bw-muted p-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 4h4v4H2V4zm6 0h4v4H8V4zm6 0h4v4h-4V4zM2 10h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zM2 16h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>
          <span className="text-white font-bold text-lg">Book Worm</span>
          <span className="hidden sm:block text-bw-border text-xl select-none">|</span>
          <nav className="hidden sm:flex items-center gap-6" aria-label="Primary navigation">
            <a href="/orders"   className="text-sm text-bw-muted hover:text-white">My Orders</a>
            <a href="/wishlist" className="text-sm text-bw-muted hover:text-white">My Wishlist</a>
            <a href="/writers"  className="text-sm text-bw-muted hover:text-white">My Writers</a>
          </nav>
        </div>
      </header>

      {/* Centred payment panel — floats over the illustrated background */}
      <div className="relative z-10 flex flex-1 items-start sm:items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
        <div
          className="bg-bw-card w-full overflow-hidden"
          style={{ maxWidth: '780px' }}
          role="dialog"
          aria-label="Complete payment"
          aria-modal="true"
        >
          {/* ── Header row — stack on mobile, row on sm+ ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-5 pb-4 gap-1 sm:gap-0">
            <h1 className="text-white text-lg sm:text-xl font-normal">Complete Payment</h1>
            <span className="text-white font-bold text-base sm:text-lg">
              Payable Amount: ₹{payableAmount.toFixed(0)}
            </span>
          </div>
          {/* Blue separator line */}
          <div className="h-px bg-bw-primary" />

          {/* ── Body: method list top on mobile, left sidebar on sm+ ── */}
          <div className="flex flex-col sm:flex-row min-h-0">
            {/* Method selector — horizontal row on mobile, vertical sidebar on sm+ */}
            <PaymentMethodSelector
              selected={selectedMethod}
              onChange={handleMethodChange}
            />

            {/* Right / bottom panel — active form + actions */}
            <div className="flex-1 px-4 sm:px-8 py-5 sm:py-6 flex flex-col gap-5">
              {/* Credit / Debit card form */}
              {(selectedMethod === 'credit-card' || selectedMethod === 'debit-card') && (
                <CreditCardForm
                  value={cardForm}
                  onChange={(v) => { setCardForm(v); setCardErrors({}); }}
                  errors={cardErrors}
                />
              )}

              {/* UPI form */}
              {selectedMethod === 'upi' && (
                <div>
                  <UpiForm value={upiId} onChange={(v) => { setUpiId(v); setUpiError(''); }} />
                  {upiError && <p className="text-red-400 text-xs mt-1">{upiError}</p>}
                </div>
              )}

              {/* Wallet form */}
              {selectedMethod === 'wallet' && (
                <div>
                  <WalletForm value={wallet} onChange={(v) => { setWallet(v); setWalletError(''); }} />
                  {walletError && <p className="text-red-400 text-xs mt-1">{walletError}</p>}
                </div>
              )}

              {/* Generic error (e.g. checkout API failure) */}
              {selectedMethod !== 'upi' && upiError && (
                <p className="text-red-400 text-xs">{upiError}</p>
              )}

              {/* Gift points redemption — only when balance > 0 */}
              {giftPoints > 0 && (
                <GiftPointsRedemption
                  available={giftPoints}
                  applied={pointsApplied}
                  redeemedAmount={redeemedAmt}
                  onToggle={handleTogglePoints}
                />
              )}

              {/* Pay Now — full-width on mobile, right-aligned fixed width on sm+ */}
              <div className="flex justify-stretch sm:justify-end mt-auto pt-2">
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="w-full sm:w-60 h-12 px-4 flex items-center justify-between bg-brand text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-surface transition-colors"
                >
                  <span className="text-base">Pay Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
