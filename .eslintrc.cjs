module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    parserOptions: {
        ecmaFeatures: {
            modules: true
        }
    },
    extends: [
        'airbnb',
        'prettier',
        'eslint:recommended'
    ],
    rules: {
        'no-console': ['error', { allow: ['warn', 'error'] }],
        curly: [2, 'all'],
        'keyword-spacing': ['error', { before: true }],
        semi: 1,
        'no-unexpected-multiline': 0,
        'array-element-newline': [1, 'consistent'],
        'class-methods-use-this': 0,
        'import/prefer-default-export': 0,
        'no-void': 0,
        'import/no-relative-packages': 0,
        'import/no-unresolved': 0,
        'import/extensions': 0,
        'no-plusplus': 0,
        'no-bitwise': 0,
        'no-param-reassign': ['error', { props: false }],
        'no-multiple-empty-lines': [2, { max: 1, maxBOF: 1 }],
        'prefer-destructuring': 0,
        camelcase: ['error', { allow: ['^UNSAFE_'] }],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    '**/*.test.*',
                    '**/*.stories.*',
                    'jest.setup.js',
                    '**/handlers.ts',
                    '**/testUtils.tsx',
                    '**/server.ts'
                ]
            }
        ]
    },
    ignorePatterns: [
        'dist',
        '.eslintrc.cjs',
        'package.json'
    ],
};