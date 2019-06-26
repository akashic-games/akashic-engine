import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default [
	{
		input: "lib/index.js",
		output: {
			name: "g",
			file: "dist/main.node.js",
			format: "umd"
		},
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
