import type { PaymentMethod } from '../../types/payment';

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'credit-card', label: 'Credit Card' },
  { id: 'debit-card', label: 'Debit card' },
  { id: 'upi',        label: 'UPI' },
  { id: 'wallet',     label: 'Wallet' },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/**
 * Left-column tab list for the payment modal.
 * Matches the PaymentpageScreen screenshot layout exactly.
 */
const PaymentMethodSelector = ({ selected, onChange }: PaymentMethodSelectorProps) => (
  /* Mobile: horizontal scrollable row across the top.
     sm+: vertical sidebar on the left, fixed width. */
  <div
    className="flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible sm:w-44 sm:shrink-0 border-b sm:border-b-0 sm:border-r border-line"
    role="tablist"
    aria-label="Payment method"
  >
    {METHODS.map((m, idx) => (
      <button
        key={m.id}
        role="tab"
        aria-selected={selected === m.id}
        onClick={() => onChange(m.id)}
        className={`shrink-0 sm:w-full text-left px-4 sm:px-5 py-3 sm:py-5 text-sm transition-colors whitespace-nowrap ${
          idx > 0 ? 'border-l sm:border-l-0 sm:border-t border-line' : ''
        } ${
          selected === m.id
            ? 'text-white font-semibold bg-surface border-b-2 sm:border-b-0 sm:border-l-2 border-brand'
            : 'text-muted bg-field hover:bg-neutral-600/60'
        }`}
      >
        {m.label}
      </button>
    ))}
  </div>
);

export default PaymentMethodSelector;
