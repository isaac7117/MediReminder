/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#0d9488',
          600: '#0b7e74',
          700: '#096860',
          800: '#07524c',
          900: '#053c38',
        },
        secondary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        accent: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        alert: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        medical: {
          dark:   '#0f172a',
          navy:   '#1e293b',
          slate:  '#334155',
          mist:   '#f0fdfa',
          ice:    '#f8fafc',
          card:   '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'medical':    '0 1px 3px 0 rgba(13, 148, 136, 0.08), 0 1px 2px -1px rgba(13, 148, 136, 0.08)',
        'medical-md': '0 4px 6px -1px rgba(13, 148, 136, 0.1), 0 2px 4px -2px rgba(13, 148, 136, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(13, 148, 136, 0.1), 0 4px 6px -4px rgba(13, 148, 136, 0.06)',
        'medical-xl': '0 20px 25px -5px rgba(13, 148, 136, 0.1), 0 8px 10px -6px rgba(13, 148, 136, 0.06)',
        'glass':      '0 8px 32px 0 rgba(13, 148, 136, 0.08)',
        'card-hover': '0 12px 28px -5px rgba(13, 148, 136, 0.15), 0 4px 10px -4px rgba(13, 148, 136, 0.08)',
        'inner-glow': 'inset 0 1px 4px 0 rgba(13, 148, 136, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-medical': 'linear-gradient(135deg, #0d9488 0%, #0b7e74 50%, #096860 100%)',
        'gradient-hero':    'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
        'gradient-card':    'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)',
        'gradient-sidebar':  'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        'mesh-pattern':     'radial-gradient(at 40% 20%, rgba(13,148,136,0.08) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(34,197,94,0.06) 0px, transparent 50%)',
      },
      animation: {
        'pulse':        'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce':       'bounce 1s infinite',
        'fade-in':      'fadeIn 0.5s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
        'count-up':     'countUp 0.6s ease-out',
        'glow':         'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(13, 148, 136, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
