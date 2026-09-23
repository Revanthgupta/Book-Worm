import { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchBooks } from './features/books/booksSlice';
import { fetchMe } from './features/authentication/authSlice';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import WritersPage from './pages/WritersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Boot: load catalogue from API; falls back to mockBooks on error
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Boot: sync gift points from backend once on mount — not on every auth change.
  // useRef gate prevents re-firing when isAuthenticated toggles after login.
  const fetchMeCalledRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !fetchMeCalledRef.current) {
      fetchMeCalledRef.current = true;
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      {/* Full-screen pages — NO standard layout (own background) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Public routes inside standard layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:id" element={<ProductDetailPage />} />

        {/* Protected routes — require authentication */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/writers"
          element={
            <ProtectedRoute>
              <WritersPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Full-screen routes — NO standard layout (own illustrated background) */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirmation"
        element={
          <ProtectedRoute>
            <ConfirmationPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
