// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#e6f0fa',
            100: '#cce1f5',
            200: '#99c2eb',
            300: '#66a4e1',
            400: '#3385d7',
            500: '#0066cc',
            600: '#0052a3',
            700: '#003d7a',
            800: '#002952',
            900: '#001429',
          },
          secondary: {
            50: '#fee5ee',
            100: '#fecbdd',
            200: '#fd97bb',
            300: '#fc6499',
            400: '#fb3077',
            500: '#dc004e',
            600: '#b0003e',
            700: '#84002f',
            800: '#58001f',
            900: '#2c0010',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
        },
      },
    },
    plugins: [],
  }
