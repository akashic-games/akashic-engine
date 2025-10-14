import { Math } from "..";
import type { MathInitializeOption } from "..";

const PI = globalThis.Math.PI;

describe("Math", () => {
	describe("when initialize() is not called", () => {
		test("calling sin() throws an uninitialized error", () => {
			expect(() => Math.sin(0)).toThrow("Math.sin: module not initialized. Call g.Math.initialize() before calling this function.");
		});
		test("calling cos() throws an uninitialized error", () => {
			expect(() => Math.cos(0)).toThrow("Math.cos: module not initialized. Call g.Math.initialize() before calling this function.");
		});
	});

	test("should return a value closer to the reference implementation with wholePeriod", () => {
		const reference = globalThis.Math.sin(PI); // 理論値ほぼ 0

		Math.initialize({ wholePeriod: true });
		const approx4 = Math.sin(PI);

		Math.initialize({ wholePeriod: false });
		const approx6 = Math.sin(PI);

		const error4 = globalThis.Math.abs(reference - approx4);
		const error6 = globalThis.Math.abs(reference - approx6);

		expect(error6).toBeLessThan(error4); // イテレーション回数が少ないほうが 0 に近いことを期待
	});

	describe.each([
		["default", undefined, { precision: 3 }],
		["high table size", { tableSize: 8192 * 16 }, { precision: 4 }]
	] satisfies [string, MathInitializeOption | undefined, { precision: number }][])("%o", (_, option, { precision }) => {
		beforeEach(() => {
			Math.initialize(option);
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

		test("should have small errors compared to the reference implementation", () => {
			for (let i = 0; i <= 360; ++i) {
				const rad = (i * PI) / 180;
				expect(Math.sin(rad)).toBeCloseTo(globalThis.Math.sin(rad), precision);
				expect(Math.cos(rad)).toBeCloseTo(globalThis.Math.cos(rad), precision);
			}
		});
	});
});
