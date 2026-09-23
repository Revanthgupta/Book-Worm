import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storageGet, storageSet, storageRemove } from '../../storage/storageService';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { apiGetMe } from './authService';

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  giftPoints: number;
}

function loadPersistedAuth(): AuthState {
  const user = storageGet<User>(STORAGE_KEYS.USER);
  const giftPoints = storageGet<number>(STORAGE_KEYS.GIFT_POINTS) ?? 0;
  return {
    user: user ?? null,
    isAuthenticated: user !== null,
    giftPoints,
  };
}

const initialState: AuthState = loadPersistedAuth();

// ── Async thunk — refresh current user + gift points from backend ─────────────
// Must be declared BEFORE createSlice so extraReducers can reference it.
export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  return apiGetMe();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      storageSet(STORAGE_KEYS.USER, action.payload);
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.giftPoints = 0;
      storageRemove(STORAGE_KEYS.USER);
      storageRemove(STORAGE_KEYS.GIFT_POINTS);
    },
    addGiftPoints(state, action: PayloadAction<number>) {
      state.giftPoints += action.payload;
      storageSet(STORAGE_KEYS.GIFT_POINTS, state.giftPoints);
    },
    setGiftPoints(state, action: PayloadAction<number>) {
      state.giftPoints = action.payload;
      storageSet(STORAGE_KEYS.GIFT_POINTS, state.giftPoints);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      if (action.payload) {
        // /auth/me returns token: "" — preserve the existing stored token so
        // subsequent requests continue to include the Authorization header.
        const existingToken = state.user?.token;
        state.user = {
          ...action.payload.user,
          token: action.payload.user.token || existingToken,
        };
        state.isAuthenticated = true;
        state.giftPoints = action.payload.giftPoints;
        storageSet(STORAGE_KEYS.USER, state.user);
        storageSet(STORAGE_KEYS.GIFT_POINTS, action.payload.giftPoints);
      }
    });
  },
});

export const { loginSuccess, logout, addGiftPoints, setGiftPoints } = authSlice.actions;
export default authSlice.reducer;
