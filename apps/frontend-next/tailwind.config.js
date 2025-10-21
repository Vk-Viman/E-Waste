/***************************
 Tailwind CSS Config
***************************/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
