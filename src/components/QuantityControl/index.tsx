interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
}

/**
 * Shared +/− quantity control.
 * Screenshot layout:  [ qty ][ − ][ + ]
 */
const QuantityControl = ({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
}: QuantityControlProps) => (
  <div className="inline-flex items-center border border-line">
    {/* Current quantity */}
    <span className="px-3 py-1.5 text-white text-sm min-w-[2.5rem] text-center select-none">
      {quantity}
    </span>

    {/* Decrease */}
    <button
      type="button"
      onClick={onDecrease}
      disabled={quantity <= min}
      aria-label="Decrease quantity"
      className="px-2.5 py-1.5 border-l border-bw-border text-white hover:bg-bw-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base leading-none"
    >
      −
    </button>

    {/* Increase */}
    <button
      type="button"
      onClick={onIncrease}
      aria-label="Increase quantity"
      className="px-2.5 py-1.5 border-l border-bw-border text-white hover:bg-bw-card transition-colors text-base leading-none"
    >
      +
    </button>
  </div>
);

export default QuantityControl;
