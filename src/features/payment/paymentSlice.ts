import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'wallet';

interface PaymentState {
  selectedMethod: PaymentMethod;
  status: 'idle' | 'processing' | 'success' | 'error';
  lastConfirmedOrderId: string | null;
  redeemedPoints: number; // points applied to current checkout
}

const initialState: PaymentState = {
  selectedMethod: 'credit-card',
  status: 'idle',
  lastConfirmedOrderId: null,
  redeemedPoints: 0,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.selectedMethod = action.payload;
    },
    setStatus(state, action: PayloadAction<PaymentState['status']>) {
      state.status = action.payload;
    },
    setLastConfirmedOrderId(state, action: PayloadAction<string>) {
      state.lastConfirmedOrderId = action.payload;
    },
    setRedeemedPoints(state, action: PayloadAction<number>) {
      state.redeemedPoints = action.payload;
    },
    resetPayment(state) {
      state.status = 'idle';
      state.redeemedPoints = 0;
    },
  },
});

export const {
  setPaymentMethod,
  setStatus,
  setLastConfirmedOrderId,
  setRedeemedPoints,
  resetPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
