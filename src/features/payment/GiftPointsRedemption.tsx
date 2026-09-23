interface GiftPointsRedemptionProps {
  /** Total gift points the authenticated user has available. */
  available: number;
  /** Whether points have already been applied to this checkout. */
  applied: boolean;
  /** Points amount currently deducted from the payable total. */
  redeemedAmount: number;
  /** Called when the user clicks Apply / Remove. */
  onToggle: () => void;
}

/**
 * Gift points redemption row shown on the Payment page.
 * Only rendered when the user has a positive points balance.
 * Displays available balance; Apply toggles the deduction.
 */
const GiftPointsRedemption = ({
  available,
  applied,
  redeemedAmount,
  onToggle,
}: GiftPointsRedemptionProps) => (
  <div className="border border-bw-border rounded p-3 flex items-center justify-between gap-3">
    <span className="text-bw-muted text-xs">
      🎁 Redeem Gift Points{' '}
      <span className="text-white font-medium">(₹{available} available)</span>
    </span>

    <button
      type="button"
      onClick={onToggle}
      className={`text-xs font-medium px-3 py-1.5 transition-colors whitespace-nowrap ${
        applied
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-brand hover:bg-blue-700 active:bg-blue-800 text-white'
      }`}
      aria-pressed={applied}
      aria-label={
        applied
          ? `Remove ₹${redeemedAmount} gift points deduction`
          : `Apply ₹${available} gift points`
      }
    >
      {applied ? `Applied −₹${redeemedAmount}` : 'Apply'}
    </button>
  </div>
);

export default GiftPointsRedemption;
