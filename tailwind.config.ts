import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'baybayin-simple': ['Baybayin Simple', 'sans-serif'],
        'tawbid': ['Tawbid Ukit', 'sans-serif'],
        'kariktan': ['Baybayin Kariktan', 'sans-serif'],
        'filipino': ['Baybayin Filipino', 'sans-serif'],
        'doctrina': ['Doctrina Christiana', 'sans-serif'],
        'rizal': ['Baybayin Jose Rizal', 'sans-serif'],
      },
      animation: {
        gradient: 'gradient 6s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
