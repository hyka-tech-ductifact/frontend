module.exports = {
    plugins: {
        '@tailwindcss/postcss': {}, // 👈 Aquí estaba el error, antes decía solo 'tailwindcss'
        autoprefixer: {},
    },
}
