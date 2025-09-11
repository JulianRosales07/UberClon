/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            100: '#F6F6F6',
            200: '#EEEEEE',
            300: '#E2E2E2',
            400: '#CCCCCC',
            500: '#999999',
            600: '#666666',
            700: '#333333',
          }
        }
      }
    },
  },
  plugins: [],
}