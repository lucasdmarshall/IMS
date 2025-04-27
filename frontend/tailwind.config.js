/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#1e2747', // Lightest dark indigo
          100: '#1a2235', // Light dark indigo
          200: '#161c2d', // Medium dark indigo
          300: '#121826', // Dark indigo
          400: '#0e1420', // Darkest indigo
          500: '#0a101a', // Almost black indigo
          background: '#0e1420', // Main background
          foreground: '#ffffff', // Text color
          muted: '#6b7280', // Muted text color
        },
        primary: {
          50: '#f0f5ff',
          100: '#e6edff',
          200: '#c3dafe',
          300: '#a3bffa',
          400: '#7f9cf5',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
          dark: {
            50: '#3730a3',
            100: '#312e81',
            200: '#2e2d74',
            300: '#2a2a66',
            400: '#262659',
            500: '#22224b',
          }
        }
      },
      backgroundColor: {
        dark: {
          primary: '#1e2747',
          secondary: '#161c2d',
          tertiary: '#121826'
        }
      },
      textColor: {
        dark: {
          primary: '#e5e7eb',
          secondary: '#9ca3af',
          muted: '#6b7280'
        }
      },
      borderColor: {
        dark: {
          primary: '#2d3748',
          secondary: '#4a5568'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-light': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
