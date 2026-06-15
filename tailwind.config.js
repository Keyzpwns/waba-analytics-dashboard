/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        paper: '#F5F2EC',
        bone: '#E8E4DA',
        ash: '#8A8680',
        stone: '#1A1A1C',
        graphite: '#2A2A2D',
        ember: '#C73E1D',
        gold: '#D4A24C',
        mint: '#7FB069',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
