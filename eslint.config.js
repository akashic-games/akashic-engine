const eslintConfig = require("@akashic/eslint-config");
const prettier = require("eslint-plugin-prettier");

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
