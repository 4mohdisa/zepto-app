/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: '#F8F9FF',
        surface: '#FFFFFF',
        surfaceSecondary: '#F3F4F6',

        // Brand
        accent: '#295EFF',
        accentLight: '#295EFF1A',

        // Text
        foreground: '#111827',
        mutedText: '#9CA3AF',
        textSecondary: '#6B7280',

        // Borders
        border: '#E5E7EB',

        // Semantic
        success: '#10B981',
        successLight: '#D1FAE5',
        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',

        // Legacy aliases
        primary: '#111827',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
