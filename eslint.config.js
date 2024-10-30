const eslintConfig = require("@akashic/eslint-config");
const prettier = require("eslint-plugin-prettier");
const globals = require("globals");

module.exports = [
    ...eslintConfig,
    {
        plugins: {
            prettier,
        }, 
        files: ["src/**/*.ts"],
        languageOptions: {
            sourceType: "module",
            parserOptions: {
                project: "tsconfig.eslint.json",
            }
        },
        ignores: ["**/*.js", "**/*.d.ts"]
    }
];
