/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        38: '9.5rem', // w-38 = 152px (close to 151px target for related book cover)
      },
      colors: {
        // ── Carbon G100 global tokens ─────────────────────────────────────────
        page:   '#161616',
        rule:   '#8d8d8d',
        danger: '#da1e28',

        // link / accent — updated to match spec (#78a9ff default, #a6c8ff hover)
        link:   { DEFAULT: '#78a9ff', hover: '#a6c8ff' },

        ink:    { DEFAULT: '#f4f4f4', soft: '#c6c6c6', dim: '#6f6f6f' },

        // ── Carbon / IBM Design System tokens ─────────────────────────────────
        surface: '#262626',   // page / active tab background
        field:   '#393939',   // inputs + inactive tabs
        line:    '#525252',   // tab dividers
        muted:   '#a8a8a8',   // placeholder / inactive text
        brand:   { DEFAULT: '#0f62fe', hover: '#0353e9' },  // primary blue

        // Star colour
        star:    '#f1c21b',

        // Neutral (Wishlist button)
        neutral: { DEFAULT: '#6f6f6f', hover: '#606060' },

        // ── Legacy bw-* tokens (rest of the app — kept for backward compat) ──
        bw: {
          bg:              '#111827',
          card:            '#262626',
          input:           '#393939',
          border:          '#374151',
          muted:           '#a8a8a8',
          accent:          '#60a5fa',
          primary:         '#3b82f6',
          'primary-hover': '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
