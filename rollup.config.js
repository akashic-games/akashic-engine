import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-minification";

export default [
	{
		input: "lib/index.js",
		output: {
			name: "g",
			file: "dist/main.js",
			format: "umd"
		},
		plugins: [
			resolve(),
			commonjs()
		]
	},
	{
		input: "lib/index.js",
		output: {
			name: "g",
			file: "dist/main.min.js",
			format: "umd"
		},
		plugins: [
			resolve(),
			commonjs(),
			terser()
		]
	}
];
