module.exports = {
	collectCoverage: true,
	coverageDirectory: "coverage",
	collectCoverageFrom: [
		"./src/**/*.ts",
		"!./src/__tests__/**/*.ts"
	],
	coverageReporters: [
		"lcov"
	],
	moduleFileExtensions: [
		"ts",
		"js"
	],
	transform: {
		"^.+\\.ts$": "ts-jest"
	},
	globals: {
		"ts-jest": {
			tsConfig: "tsconfig.jest.json"
		}
	},
	testMatch: [
		"<rootDir>/src/__tests__/*Spec.ts"
	]
};
