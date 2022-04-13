module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        'airbnb-base',
        'plugin:sonarjs/recommended',
        'plugin:node/recommended',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
        'plugin:import/recommended',
    ],
    plugins: [
        'promise',
        'import',
        'node',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
        'prettier/prettier': 'error',
        'import/extensions': [0, { js: "always" }],
        indent: 'off',
        'no-underscore-dangle': 1
    },
};
