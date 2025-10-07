import { Math } from "..";

const PI = globalThis.Math.PI;
const precision = 3; // 比較する精度 (小数点以下の桁数)

describe("Math", () => {
	test("sin(0) ≒ 0", () => {
		expect(Math.sin(0)).toBeCloseTo(0, precision);
	});

	test("sin(π/2) ≒ 1", () => {
		expect(Math.sin(PI / 2)).toBeCloseTo(1, precision);
	});

	test("sin(π) ≒ 0", () => {
		expect(Math.sin(PI)).toBeCloseTo(0, precision);
	});

	test("sin(3π/2) ≒ -1", () => {
		expect(Math.sin((3 * PI) / 2)).toBeCloseTo(-1, precision);
	});

	test("sin(2π) ≒ 0", () => {
		expect(Math.sin(2 * PI)).toBeCloseTo(0, precision);
	});

	test("cos(0) ≒ 1", () => {
		expect(Math.cos(0)).toBeCloseTo(1, precision);
	});

	test("cos(π/2) ≒ 0", () => {
		expect(Math.cos(PI / 2)).toBeCloseTo(0, precision);
	});

	test("cos(π) ≒ -1", () => {
		expect(Math.cos(PI)).toBeCloseTo(-1, precision);
	});

	test("cos(3π/2) ≒ 0", () => {
		expect(Math.cos((3 * PI) / 2)).toBeCloseTo(0, precision);
	});

	test("cos(2π) ≒ 1", () => {
		expect(Math.cos(2 * PI)).toBeCloseTo(1, precision);
	});

	test("sin/cos の標準関数との誤差が小さい", () => {
		for (let i = 0; i <= 360; ++i) {
			const rad = (i * PI) / 180;
			expect(Math.sin(rad)).toBeCloseTo(globalThis.Math.sin(rad), precision);
			expect(Math.cos(rad)).toBeCloseTo(globalThis.Math.cos(rad), precision);
		}
	});
});
