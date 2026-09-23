export interface CardFormState {
  cardNumber: string;
  nameOnCard: string;
  cvv: string;
  expiry: string;
}

const inputCls =
  'w-full bg-field border-b border-rule px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand';

const labelCls = 'text-white text-sm mb-2 block';

interface CreditCardFormProps {
  value: CardFormState;
  onChange: (v: CardFormState) => void;
  errors: Partial<Record<keyof CardFormState, string>>;
}

/**
 * Credit Card / Debit Card form — 2×2 grid matching the reference screenshot.
 * Row 1: Card Number | Name on Card
 * Row 2: CVV        | Date of Expiry
 */
const CreditCardForm = ({ value, onChange, errors }: CreditCardFormProps) => {
  const set = (field: keyof CardFormState, val: string) =>
    onChange({ ...value, [field]: val });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5" role="tabpanel">
      {/* Row 1 — Card Number */}
      <div className="flex flex-col">
        <label htmlFor="cc-number" className={labelCls}>Card Number</label>
        <input
          id="cc-number"
          type="text"
          value={value.cardNumber}
          onChange={(e) => set('cardNumber', e.target.value)}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxLength={19}
          autoComplete="cc-number"
          className={inputCls}
        />
        {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
      </div>

      {/* Row 1 — Name on Card */}
      <div className="flex flex-col">
        <label htmlFor="cc-name" className={labelCls}>Name on Card</label>
        <input
          id="cc-name"
          type="text"
          value={value.nameOnCard}
          onChange={(e) => set('nameOnCard', e.target.value)}
          placeholder="Name"
          autoComplete="cc-name"
          className={inputCls}
        />
        {errors.nameOnCard && <p className="text-red-400 text-xs mt-1">{errors.nameOnCard}</p>}
      </div>

      {/* Row 2 — CVV */}
      <div className="flex flex-col">
        <label htmlFor="cc-cvv" className={labelCls}>CVV</label>
        <input
          id="cc-cvv"
          type="password"
          value={value.cvv}
          onChange={(e) => set('cvv', e.target.value)}
          placeholder="XXX"
          maxLength={4}
          autoComplete="cc-csc"
          className={inputCls}
        />
        {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
      </div>

      {/* Row 2 — Date of Expiry */}
      <div className="flex flex-col">
        <label htmlFor="cc-expiry" className={labelCls}>Date of Expiry</label>
        <input
          id="cc-expiry"
          type="text"
          value={value.expiry}
          onChange={(e) => set('expiry', e.target.value)}
          placeholder="MM/YYYY"
          maxLength={7}
          autoComplete="cc-exp"
          className={inputCls}
        />
        {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
      </div>
    </div>
  );
};

export default CreditCardForm;
