/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 .28vw .57vw 0 rgba(0, 0, 0, 0.2), 0 .42vw 1.42vw 0 rgba(0, 0, 0, 0.19)', // Add your custom shadow here
      }
    },
  },
  plugins: [],
}

