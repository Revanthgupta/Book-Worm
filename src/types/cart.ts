export interface Address {
  firstName: string;
  lastName: string;
  addressLine: string;
  email: string;
  city: string;
  pin: string;
  phoneCountryCode: string;
  phone: string;
  state: string;
  country: string;
}

export const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  addressLine: '',
  email: '',
  city: '',
  pin: '',
  phoneCountryCode: '+91',
  phone: '',
  state: '',
  country: 'India',
};
