/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#d0faff",
          300: "#63e7f3",
          500: "#1fc7db"
        }
      }
    }
  },
  plugins: [],
};

