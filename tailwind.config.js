/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        azulescuro: "#09435e",
        azulclaro: "#0c73ba",
      },
    },
  },
  plugins: [],
};
