/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0ea5e9',
                secondary: '#3b82f6',
                accent: '#0284c7',
                danger: '#ef4444',
                bgLight: '#f0f9ff',
                brand: {
                    light: '#e0f2fe',
                    DEFAULT: '#0284c7',
                    dark: '#0c4a6e',
                }
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(14, 165, 233, 0.08)',
                'float': '0 20px 25px -5px rgba(14, 165, 233, 0.15), 0 10px 10px -5px rgba(14, 165, 233, 0.04)',
            }
        },
    },
    plugins: [],
}
