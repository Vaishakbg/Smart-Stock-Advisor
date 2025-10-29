/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e0f3ff",
          200: "#b8e2ff",
          300: "#7fcaff",
          400: "#39a6ff",
          500: "#0d82ff",
          600: "#0064e0",
          700: "#004bb0",
          800: "#003680",
          900: "#01275d"
        }
      }
    }
  },
  plugins: []
};
