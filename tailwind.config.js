/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ocean: {
          950: "#031a3d",
          900: "#042C53",
          800: "#0C447C",
          600: "#185FA5",
          400: "#378ADD",
          100: "#E6F1FB",
          50:  "#f0f6fd",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          dark:    "#E8543C",
          light:   "#FFE8E8",
        },
        koral: {
          50: "#F5F8FF",
          100: "#E8F0FF",
          200: "#C9DBFF",
          300: "#9DBDFF",
          400: "#6F9BFF",
          500: "#4F7CFF",
          600: "#2F5DFF",
          700: "#2447CC",
          800: "#1B3599",
          900: "#122466",
        },
        teal: {
          DEFAULT: "#1D9E75",
          light:   "#e1f5ee",
        },
      },
    },
  },
  plugins: [],
}