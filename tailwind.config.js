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
        teal: {
          DEFAULT: "#1D9E75",
          light:   "#e1f5ee",
        },
      },
    },
  },
  plugins: [],
}