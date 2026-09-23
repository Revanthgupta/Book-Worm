import type { Address } from '../../types/cart';

/** Validate address fields — returns an errors object */
export function validateAddress(addr: Address): Partial<Record<keyof Address, string>> {
  const errs: Partial<Record<keyof Address, string>> = {};
  if (!addr.firstName.trim()) errs.firstName = 'Required';
  if (!addr.lastName.trim()) errs.lastName = 'Required';
  if (!addr.addressLine.trim()) errs.addressLine = 'Required';
  if (!addr.email.trim()) errs.email = 'Required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) errs.email = 'Invalid email';
  if (!addr.city.trim()) errs.city = 'Required';
  if (!addr.pin.trim()) errs.pin = 'Required';
  else if (!/^\d{6}$/.test(addr.pin)) errs.pin = '6 digits required';
  if (!addr.phone.trim()) errs.phone = 'Required';
  if (!addr.state.trim()) errs.state = 'Required';
  return errs;
}
