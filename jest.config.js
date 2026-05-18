module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        'ionicons/components/(.+)': '<rootDir>/node_modules/ionicons/components/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!@angular|@ionic|@stencil|ionicons|@ngx-translate)'
    ],
};
