import prettierConfig from 'eslint-config-prettier';

export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                HTMLElement: 'readonly',
                CustomEvent: 'readonly',
                Event: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                performance: 'readonly'
            }
        }
    },
    prettierConfig
];
