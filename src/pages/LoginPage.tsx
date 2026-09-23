import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, setGiftPoints } from '../features/authentication/authSlice';
import { apiLogin } from '../features/authentication/authService';

/** Replicates the dark book-illustration background used on Payment + Confirmation pages */
const BookIllustrationBackground = () => (
  <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#1a3a5c' }}>
    {/* Subtle gradient overlay */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 20% 50%, rgba(14,42,71,0.8) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(10,30,60,0.6) 0%, transparent 50%)',
      }}
    />

    {/* Decorative geometric shapes matching the screenshot */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1060 714"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Large teal background blob top-right */}
      <ellipse cx="900" cy="80" rx="200" ry="120" fill="rgba(15,90,120,0.35)" />
      {/* Large brown/terracotta circle bottom-right */}
      <circle cx="980" cy="580" r="100" fill="rgba(140,60,30,0.3)" />
      {/* Wavy line left */}
      <path d="M80 400 Q120 350 80 300 Q40 250 80 200" stroke="rgba(180,130,50,0.4)" strokeWidth="2" fill="none" />
      {/* Wavy line right-centre */}
      <path d="M760 550 Q800 500 760 450 Q720 400 760 350" stroke="rgba(180,130,50,0.4)" strokeWidth="2" fill="none" />

      {/* Floating diamond shapes */}
      <rect x="510" y="55"  width="14" height="14" fill="rgba(200,150,50,0.7)"  transform="rotate(45 517 62)" />
      <rect x="760" y="180" width="10" height="10" fill="rgba(200,150,50,0.6)"  transform="rotate(45 765 185)" />
      <rect x="280" y="300" width="12" height="12" fill="rgba(200,80,60,0.55)"  transform="rotate(45 286 306)" />
      <rect x="830" y="420" width="11" height="11" fill="rgba(200,150,50,0.65)" transform="rotate(45 835 425)" />
      <rect x="50"  y="500" width="13" height="13" fill="rgba(200,80,60,0.5)"   transform="rotate(45 56 506)" />
      <rect x="640" y="490" width="10" height="10" fill="rgba(200,150,50,0.6)"  transform="rotate(45 645 495)" />

      {/* ── Book illustrations ── */}
      {/* Open book — bottom centre-right */}
      <g transform="translate(540, 540) rotate(-8)">
        <rect x="0"   y="20" width="110" height="140" rx="3" fill="#c8a46e" />
        <rect x="112" y="20" width="110" height="140" rx="3" fill="#e8d5b0" />
        <rect x="55"  y="20" width="4"   height="140" fill="rgba(0,0,0,0.2)" />
        <path d="M5 25 Q60 15 110 25" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
        <path d="M115 25 Q170 15 220 25" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
      </g>

      {/* Stacked books — bottom left */}
      <g transform="translate(30, 530)">
        <rect x="0" y="50"  width="130" height="30" rx="3" fill="#c8973a" />
        <rect x="5" y="20"  width="125" height="30" rx="3" fill="#3a7a9c" />
        <rect x="8" y="0"   width="115" height="22" rx="3" fill="#2a5a7a" />
      </g>

      {/* Standing book — top left */}
      <g transform="translate(150, 50) rotate(5)">
        <rect x="0" y="0" width="100" height="145" rx="4" fill="#c87830" />
        <rect x="3" y="3" width="94"  height="139" rx="3" fill="#a05820" />
        <rect x="5" y="5" width="30"  height="135" rx="2" fill="rgba(180,80,20,0.6)" />
        <rect x="8" y="50" width="84" height="3"   fill="rgba(255,255,255,0.15)" />
        <rect x="8" y="60" width="84" height="3"   fill="rgba(255,255,255,0.1)" />
      </g>
    </svg>
  </div>
);

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Where to go after successful login
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await apiLogin(email, password);
    setLoading(false);
    if (result.success && result.user) {
      dispatch(loginSuccess(result.user));
      if (result.giftPoints !== undefined) {
        dispatch(setGiftPoints(result.giftPoints));
      }
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Illustrated background */}
      <BookIllustrationBackground />

      {/* Centred login card — same dark panel style as Payment/Confirmation */}
      <div
        className="relative z-10 w-full max-w-sm mx-4"
        role="main"
      >
        <div
          className="rounded-lg px-8 py-8"
          style={{ backgroundColor: '#1f2937' }}
        >
          {/* Brand */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 4h4v4H2V4zm6 0h4v4H8V4zm6 0h4v4h-4V4zM2 10h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zM2 16h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4z" />
              </svg>
              <span className="font-bold text-xl tracking-wide">Book Worm</span>
            </Link>
            <p className="text-bw-muted text-sm mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block text-sm text-bw-muted mb-1"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-bw-bg border border-bw-border rounded px-3 py-2.5 text-sm text-white placeholder-bw-muted focus:outline-none focus:ring-1 focus:ring-bw-primary"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="login-password"
                className="block text-sm text-bw-muted mb-1"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-bw-bg border border-bw-border rounded px-3 py-2.5 text-sm text-white placeholder-bw-muted focus:outline-none focus:ring-1 focus:ring-bw-primary"
              />
            </div>

            {/* Error message */}
            {error && (
              <p role="alert" className="text-red-400 text-sm mb-4">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-bw-primary hover:bg-bw-primary-hover disabled:opacity-60 text-white font-medium py-2.5 rounded transition-colors"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
