import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/authentication/authSlice';
import booksReducer from '../features/books/booksSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/books/wishlistSlice';
import ordersReducer from '../features/orders/ordersSlice';
import paymentReducer from '../features/payment/paymentSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  books: booksReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: ordersReducer,
  payment: paymentReducer,
});

export default rootReducer;
