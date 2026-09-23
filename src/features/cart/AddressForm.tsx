import { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import type { Address } from '../../types/cart';
import { emptyAddress } from '../../types/cart';

interface AddressFormProps {
  value: Address;
  onChange: (addr: Address) => void;
  errors: Partial<Record<keyof Address, string>>;
}

const COUNTRY_CODES = ['+91', '+1', '+44', '+61', '+81', '+49'];

const Field = ({
  label,
  id,
  children,
  error,
  span = 1,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  error?: string;
  /** Grid column span at the sm breakpoint and up: 1 (narrow) or 2 (wide). */
  span?: 1 | 2;
}) => (
  <div className={`flex flex-col gap-1 ${span === 2 ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
    <label htmlFor={id} className="text-ink-soft text-xs">
      {label}
    </label>
    {children}
    {error && <p className="text-danger text-xs">{error}</p>}
  </div>
);

const inputCls =
  'w-full bg-field border-b border-rule px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand';

/** Map API address response → frontend Address type */
function mapApiAddress(a: {
  first_name: string;
  last_name: string;
  address_line: string;
  email: string;
  city: string;
  pin: string;
  phone: string;
  phone_country_code: string;
  state: string;
  country: string;
}): Address {
  return {
    firstName: a.first_name,
    lastName: a.last_name,
    addressLine: a.address_line,
    email: a.email,
    city: a.city,
    pin: a.pin,
    phone: a.phone,
    phoneCountryCode: a.phone_country_code,
    state: a.state,
    country: a.country,
  };
}

const AddressForm = ({ value, onChange, errors }: AddressFormProps) => {
  const [useSaved, setUseSaved] = useState(false);

  // Load first saved address from API when "Use Saved Address" is toggled on
  useEffect(() => {
    if (!useSaved) return;
    axiosClient
      .get<Array<{
        first_name: string; last_name: string; address_line: string;
        email: string; city: string; pin: string; phone: string;
        phone_country_code: string; state: string; country: string;
      }>>('/addresses')
      .then((res) => {
        if (res.data.length > 0) {
          onChange(mapApiAddress(res.data[0]));
        }
      })
      .catch(() => {
        // API unavailable — silently ignore
      });
  }, [useSaved, onChange]);

  const set = (field: keyof Address, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <section className="bg-surface p-4 sm:p-6">
      <h2 className="text-ink font-semibold mb-4">Address</h2>

      {/* "Use Saved Address" checkbox */}
      <label className="flex items-center gap-2 text-ink-soft text-sm cursor-pointer mb-4 select-none">
        <input
          type="checkbox"
          checked={useSaved}
          onChange={(e) => {
            setUseSaved(e.target.checked);
            if (!e.target.checked) onChange(emptyAddress);
          }}
          className="w-4 h-4 accent-brand"
        />
        Use Saved Address
      </label>

      {/* Row 1: First Name (1) | Last Name (1) | Address (2) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <Field label="First Name" id="addr-first" error={errors.firstName}>
          <input
            id="addr-first"
            type="text"
            value={value.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            placeholder="First Name"
            className={inputCls}
          />
        </Field>
        <Field label="Last Name" id="addr-last" error={errors.lastName}>
          <input
            id="addr-last"
            type="text"
            value={value.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            placeholder="Last Name"
            className={inputCls}
          />
        </Field>
        <Field label="Address" id="addr-line" error={errors.addressLine} span={2}>
          <input
            id="addr-line"
            type="text"
            value={value.addressLine}
            onChange={(e) => set('addressLine', e.target.value)}
            placeholder="Address Line 2"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Row 2: e-mail (2) | City (1) | Pin (1) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <Field label="e-mail" id="addr-email" error={errors.email} span={2}>
          <input
            id="addr-email"
            type="email"
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="e-mail"
            className={inputCls}
          />
        </Field>
        <Field label="City" id="addr-city" error={errors.city}>
          <input
            id="addr-city"
            type="text"
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="City"
            className={inputCls}
          />
        </Field>
        <Field label="Pin" id="addr-pin" error={errors.pin}>
          <input
            id="addr-pin"
            type="text"
            value={value.pin}
            onChange={(e) => set('pin', e.target.value)}
            placeholder="000000"
            maxLength={6}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Row 3: Phone Number (2) | State (1) | Country (1) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Phone Number" id="addr-phone" error={errors.phone} span={2}>
          <div className="flex gap-2">
            {/* Country code selector */}
            <select
              value={value.phoneCountryCode}
              onChange={(e) => set('phoneCountryCode', e.target.value)}
              aria-label="Phone country code"
              className="bg-field border-b border-rule px-2 py-2 text-sm text-ink w-20 shrink-0 focus:outline-none focus:border-brand"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c} value={c} className="bg-field">
                  {c}
                </option>
              ))}
            </select>
            <input
              id="addr-phone"
              type="tel"
              value={value.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="12345678890"
              className={`${inputCls} flex-1`}
            />
          </div>
        </Field>
        <Field label="State" id="addr-state" error={errors.state}>
          <input
            id="addr-state"
            type="text"
            value={value.state}
            onChange={(e) => set('state', e.target.value)}
            placeholder="State"
            className={inputCls}
          />
        </Field>
        <Field label="Country" id="addr-country" error={errors.country}>
          <select
            id="addr-country"
            value={value.country}
            onChange={(e) => set('country', e.target.value)}
            className="w-full bg-field border-b border-rule px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
          >
            <option value="India" className="bg-field">India</option>
            <option value="USA" className="bg-field">USA</option>
            <option value="UK" className="bg-field">UK</option>
            <option value="Australia" className="bg-field">Australia</option>
            <option value="Canada" className="bg-field">Canada</option>
          </select>
        </Field>
      </div>
    </section>
  );
};



export default AddressForm;