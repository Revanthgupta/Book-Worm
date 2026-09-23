import type { CardFormState } from './CreditCardForm';

export const emptyCardForm: CardFormState = {
  cardNumber: '',
  nameOnCard: '',
  cvv: '',
  expiry: '',
};

/** Validate credit or debit card fields. Returns an error object. */
export function validateCard(
  v: CardFormState,
  isDebit = false,
): Partial<Record<keyof CardFormState, string>> {
  const errs: Partial<Record<keyof CardFormState, string>> = {};
  if (!v.cardNumber.replace(/-/g, '').match(/^\d{16}$/))
    errs.cardNumber = `Valid ${isDebit ? 'debit' : 'credit'} card number required`;
  if (!v.nameOnCard.trim()) errs.nameOnCard = 'Name required';
  if (!v.cvv.match(/^\d{3,4}$/)) errs.cvv = 'CVV must be 3–4 digits';
  if (!v.expiry.match(/^(0[1-9]|1[0-2])\/\d{4}$/)) errs.expiry = 'Format: MM/YYYY';
  return errs;
}
