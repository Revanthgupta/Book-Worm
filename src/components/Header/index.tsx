import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../features/authentication/authSlice';
import { selectCartItemCount } from '../../features/cart/cartSlice';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, giftPoints } = useAppSelector((s) => s.auth);
  const cartItemCount = useAppSelector(selectCartItemCount);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close mobile nav on outside click
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileNavOpen]);

  // Close mobile nav on Escape
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileNavOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    setMobileNavOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-normal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
      isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-6 py-3 text-base font-normal border-b border-field transition-colors ${
      isActive ? 'text-ink bg-field' : 'text-ink-soft hover:text-ink hover:bg-field'
    }`;

  return (
    <>
      <header className="bg-page border-b border-field sticky top-0 z-50">
        <div className="flex items-center h-10 px-4 gap-3">

          {/* Hamburger — visible below lg (mobile + tablet) */}
          <button
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="lg:hidden text-ink-soft hover:text-ink p-1 transition-colors"
          >
            {mobileNavOpen ? (
              /* X icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Grid / hamburger icon */
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 4h4v4H2V4zm6 0h4v4H8V4zm6 0h4v4h-4V4zM2 10h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zM2 16h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4z" />
              </svg>
            )}
          </button>

          {/* Open-book icon — desktop decorative */}
          <button aria-hidden="true" tabIndex={-1} className="hidden lg:block text-ink-soft p-1 cursor-default">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>

          {/* Brand */}
          <Link
            to="/"
            className="text-ink font-semibold text-sm whitespace-nowrap"
          >
            Book Worm
          </Link>

          {/* Divider — desktop only */}
          <span className="hidden lg:block h-7 w-px bg-field mx-1 shrink-0" aria-hidden="true" />

          {/* Primary nav — desktop only */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary navigation">
            <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>
            <NavLink to="/wishlist" className={navLinkClass}>My Wishlist</NavLink>
            <NavLink to="/writers" className={navLinkClass}>My Writers</NavLink>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Cart icon */}
          <Link
            to="/cart"
            aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}` : ', empty'}`}
            className="relative text-ink-soft hover:text-ink p-1 transition-colors"
          >
            <svg className="w-7 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M7 13H5.4M9 20a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center leading-none"
              >
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Link>

          {/* User icon / dropdown */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="User account menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className="text-ink-soft hover:text-ink p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM19 20a9 9 0 10-14 0" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    aria-label="User account options"
                    className="absolute right-0 mt-2 w-48 bg-surface border border-field shadow-lg py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-field">
                      <p className="text-ink text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-ink-soft text-xs truncate">{user?.email}</p>
                      {giftPoints > 0 && (
                        <p className="text-link text-xs mt-1">
                          🎁 {giftPoints} gift points
                        </p>
                      )}
                    </div>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-ink-soft hover:text-ink hover:bg-field transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in"
                className="text-ink-soft hover:text-ink p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM19 20a9 9 0 10-14 0" />
                </svg>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Mobile/tablet nav drawer — slides in from left, hidden at lg+ */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        />
      )}
      <nav
        id="mobile-nav"
        ref={mobileNavRef}
        aria-label="Mobile navigation"
        className={`lg:hidden fixed top-12 left-0 bottom-0 z-40 w-64 bg-page border-r border-field transform transition-transform duration-200 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavLink to="/orders"  onClick={() => setMobileNavOpen(false)} className={mobileNavLinkClass}>My Orders</NavLink>
        <NavLink to="/wishlist" onClick={() => setMobileNavOpen(false)} className={mobileNavLinkClass}>My Wishlist</NavLink>
        <NavLink to="/writers" onClick={() => setMobileNavOpen(false)} className={mobileNavLinkClass}>My Writers</NavLink>

        {isAuthenticated && (
          <div className="mt-auto border-t border-field">
            <div className="px-6 py-3">
              <p className="text-ink text-sm font-medium truncate">{user?.name}</p>
              <p className="text-ink-soft text-xs truncate">{user?.email}</p>
              {giftPoints > 0 && (
                <p className="text-link text-xs mt-1">🎁 {giftPoints} gift points</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-3 text-sm text-ink-soft hover:text-ink hover:bg-field transition-colors border-t border-field"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
