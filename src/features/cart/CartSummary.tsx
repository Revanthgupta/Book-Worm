import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  selectCartSubtotal,
  selectCartTax,
  selectCartDiscount,
  selectCartTotal,
  selectCartItemCount,
  selectCouponCode,
  selectCouponValid,
  applyCouponApi,
  removeCouponApi,
} from './cartSlice';

interface CartSummaryProps {
  onPayNow: () => void; // triggers address validation in parent
}

/** Mini SVG book illustration — approximates the screenshot's dark-blue panel with floating books */
const CartIllustration = () => (
  <div
    className="w-full h-full min-h-[160px] overflow-hidden"
    style={{ backgroundColor: '#1a3a5c' }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 300 160"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background shapes */}
      <ellipse cx="250" cy="30" rx="80" ry="50" fill="rgba(15,90,120,0.4)" />
      <circle cx="280" cy="140" r="50" fill="rgba(140,60,30,0.25)" />

      {/* Diamond decorations */}
      <rect x="135" y="20" width="10" height="10" fill="rgba(200,150,50,0.7)" transform="rotate(45 140 25)" />
      <rect x="220" y="80" width="8"  height="8"  fill="rgba(200,150,50,0.6)" transform="rotate(45 224 84)" />
      <rect x="20"  y="110" width="9" height="9"  fill="rgba(200,80,60,0.5)"  transform="rotate(45 24 114)" />

      {/* Wavy lines */}
      <path d="M10 80 Q25 60 10 40" stroke="rgba(180,130,50,0.4)" strokeWidth="1.5" fill="none" />

      {/* Stacked books */}
      <g transform="translate(20, 90)">
        <rect x="0" y="30" width="80" height="18" rx="2" fill="#c8973a" />
        <rect x="4" y="12" width="76" height="18" rx="2" fill="#3a7a9c" />
        <rect x="6" y="0"  width="70" height="13" rx="2" fill="#2a5a7a" />
      </g>

      {/* Open book */}
      <g transform="translate(140, 85) rotate(-5)">
        <rect x="0"  y="12" width="70" height="88" rx="2" fill="#c8a46e" />
        <rect x="72" y="12" width="70" height="88" rx="2" fill="#e8d5b0" />
        <rect x="34" y="12" width="4"  height="88" fill="rgba(0,0,0,0.15)" />
      </g>
    </svg>
  </div>
);

const CartSummary = ({ onPayNow }: CartSummaryProps) => {
  const dispatch = useAppDispatch();

  const itemCount = useAppSelector(selectCartItemCount);
  const subtotal  = useAppSelector(selectCartSubtotal);
  const tax       = useAppSelector(selectCartTax);
  const discount  = useAppSelector(selectCartDiscount);
  const total     = useAppSelector(selectCartTotal);
  const couponCode = useAppSelector(selectCouponCode);
  const couponValid = useAppSelector(selectCouponValid);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await dispatch(applyCouponApi(couponInput.trim()));
    if (applyCouponApi.rejected.match(result)) {
      setCouponError('Invalid or inactive coupon code.');
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  return (
    <div className="bg-bw-card overflow-hidden flex flex-col sm:flex-row">
      {/* Illustration — left on sm+, top on mobile */}
      <div className="sm:w-40 shrink-0 self-stretch">
        <CartIllustration />
      </div>

      {/* Price breakdown — right on sm+, bottom on mobile */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <h2 className="text-white font-semibold text-lg">Grand Total</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted">Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="text-ink">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted">Tax</span>
          <span className="text-ink">₹{tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted">Delivery Charges</span>
          <span className="text-ink font-medium">Free</span>
        </div>

        {/* Coupon row */}
        <div className="flex gap-2">
          {couponValid ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-green-400 font-medium">
                ✓ {couponCode} applied
              </span>
              <button
                onClick={() => { dispatch(removeCouponApi()); setCouponError(''); }}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Apply Coupon"
                className="flex-1 bg-field border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-white"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-bw-primary hover:bg-bw-primary-hover text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                Apply
              </button>
            </>
          )}
        </div>
        {couponError && (
          <p className="text-red-400 text-xs -mt-1">{couponError}</p>
        )}

        {/* Discount line — only when coupon applied */}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Discount</span>
            <span className="text-green-400">−₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-line pt-3 flex justify-between">
          <span className="text-ink font-semibold">Total Amount</span>
          <span className="text-ink font-bold text-lg">₹{total.toFixed(2)}</span>
        </div>

        {/* Pay Now */}
        <button
          onClick={() => {
            onPayNow(); // validates address in parent; parent navigates if valid
          }}
          className="w-full flex items-center justify-center gap-2 bg-bw-primary hover:bg-bw-primary-hover text-white font-medium py-2.5 transition-colors mt-1"
        >
          Pay Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
