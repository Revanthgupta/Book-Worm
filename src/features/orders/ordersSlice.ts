import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../../services/axiosClient';
import type { Order, ApiOrderItem, OrderStatus } from '../../types/order';

// ── API response shape ────────────────────────────────────────────────────────

interface ApiOrder {
  id: string;
  user_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  redeemed_points_amount: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  coupon_code: string | null;
  address_id: string | null;
  delivery_date: string;
  points_awarded: boolean;
  created_at: string;
  items: ApiOrderItem[];
}

function mapApiOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    userId: o.user_id,
    apiItems: o.items,
    subtotal: o.subtotal,
    tax: o.tax,
    discount: o.discount,
    redeemedPointsAmount: o.redeemed_points_amount,
    total: o.total,
    status: o.status,
    paymentMethod: o.payment_method,
    pointsAwarded: o.points_awarded,
    deliveryDate: o.delivery_date,
    createdAt: new Date(o.created_at).getTime(),
  };
}

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  const res = await axiosClient.get<ApiOrder[]>('/orders');
  return res.data.map(mapApiOrder);
});

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOne',
  async (orderId: string) => {
    const res = await axiosClient.get<ApiOrder>(`/orders/${orderId}`);
    return mapApiOrder(res.data);
  },
);

export const cancelOrderApi = createAsyncThunk(
  'orders/cancelApi',
  async (orderId: string) => {
    const res = await axiosClient.post<ApiOrder>(`/orders/${orderId}/cancel`);
    return mapApiOrder(res.data);
  },
);

export const buyAgainApi = createAsyncThunk(
  'orders/buyAgain',
  async (orderId: string) => {
    await axiosClient.post(`/orders/${orderId}/buy-again`);
    return orderId;
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

interface OrdersState {
  orders: Order[];
  loading: boolean;
}

const initialState: OrdersState = { orders: [], loading: false };

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload);
    },
    cancelOrder(state, action: PayloadAction<string>) {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.status = 'Cancelled';
      }
    },
    markPointsAwarded(state, action: PayloadAction<string>) {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.pointsAwarded = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state) => { state.loading = false; })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) {
          state.orders[idx] = action.payload;
        } else {
          state.orders.unshift(action.payload);
        }
      })
      .addCase(cancelOrderApi.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) {
          state.orders[idx] = action.payload;
        }
      });
  },
});

export const { addOrder, cancelOrder, markPointsAwarded } = ordersSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectOrdersByUser =
  (userId: string) =>
  (state: { orders: OrdersState }): Order[] =>
    state.orders.orders.filter((o) => o.userId === userId);

export const selectOrderById =
  (orderId: string) =>
  (state: { orders: OrdersState }): Order | undefined =>
    state.orders.orders.find((o) => o.id === orderId);

export default ordersSlice.reducer;
