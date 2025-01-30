const eslintConfig = require("@akashic/eslint-config");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
    ...eslintConfig,
    eslintConfigPrettier,
    {
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
