import { Math } from "..";
import type { MathInitializeOption } from "..";

const PI = globalThis.Math.PI;

describe("Math", () => {
	afterAll(() => {
		Math.reset();
	});

	describe("when initialize() is not called", () => {
		test("calling sin() throws an uninitialized error", () => {
			expect(() => Math.sin(0)).toThrow("Math.sin: module not initialized. Call g.Math.initialize() before calling this function.");
		});
		test("calling cos() throws an uninitialized error", () => {
			expect(() => Math.cos(0)).toThrow("Math.cos: module not initialized. Call g.Math.initialize() before calling this function.");
		});
		test("calling tan() throws an uninitialized error", () => {
			expect(() => Math.tan(0)).toThrow("Math.tan: module not initialized. Call g.Math.initialize() before calling this function.");
		});
	});

	describe("sin, cos", () => {
		test("should produce different results for wholePeriod true vs false", () => {
			// 座標軸上の角度ではない角度を使用して、LUT実装の違いを確認
			const testAngle = PI / 3; // 60度
			const reference = globalThis.Math.sin(testAngle);

			Math.reset({ wholePeriod: true });
			const approxWhole = Math.sin(testAngle);

			Math.reset({ wholePeriod: false });
			const approxQuarter = Math.sin(testAngle);

			// 両者が同じでないことを確認
			expect(approxQuarter).not.toBe(approxWhole);

			// 理論値に近いことを確認
			expect(approxWhole).toBeCloseTo(reference, 3);
			expect(approxQuarter).toBeCloseTo(reference, 3);
		});

		describe.each([
			["default", undefined, { precision: 3 }],
			["high table size", { tableSize: 8192 * 16 }, { precision: 4 }]
		] satisfies [string, MathInitializeOption | undefined, { precision: number }][])("%o", (_, option, { precision }) => {
			beforeEach(() => {
				Math.reset(option);
			});

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

			test("should have small errors compared to the reference implementation", () => {
				for (let i = 0; i <= 360; ++i) {
					const rad = degree2radian(i);
					expect(Math.sin(rad)).toBeCloseTo(globalThis.Math.sin(rad), precision);
					expect(Math.cos(rad)).toBeCloseTo(globalThis.Math.cos(rad), precision);
				}
			});
		});
	});

	describe("tan", () => {
		test("default", () => {
			Math.reset();

			// 絶対値が 1 よりも小さいあたり
			expectTanCloseToReference(-35, 35, 3);
			expectTanCloseToReference(-35 + 180, 35 + 180, 3); // 念の為次周期も検証

			// 絶対値が 1 に近づいてから超えるあたり
			expectTanCloseToReference(35, 75, 2);
			expectTanCloseToReference(-75, -35, 2);
			expectTanCloseToReference(35 + 180, 75 + 180, 2); // 念の為次周期も検証
			expectTanCloseToReference(-75 + 180, -35 + 180, 2);

			// 絶対値が 1 を大きく超えるあたり
			expectTanCloseToReference(75, 85, 1);
			expectTanCloseToReference(-85, -75, 1);
			expectTanCloseToReference(75 + 180, 85 + 180, 1); // 念の為次周期も検証
			expectTanCloseToReference(-85 + 180, -75 + 180, 1);

			// 角度が正接の発散に近い部分では少なくとも減少をしていないことを確認
			let beforeValue = 0;
			for (let i = 85; i <= 89; ++i) {
				const value = Math.tan(degree2radian(i));
				expect(value).toBeGreaterThanOrEqual(beforeValue);
				beforeValue = value;
			}

			// 発散値では少なくともそれよりも手前よりは絶対値が大きいことを確認
			const tan89 = Math.tan(degree2radian(89));
			expect(globalThis.Math.abs(Math.tan(degree2radian(90)))).toBeGreaterThanOrEqual(tan89);
		});

		test("high precision", () => {
			Math.reset({ tableSize: 8192 * 32, iterationNum: 20 });
			const precision = 4;
			for (let i = 0; i <= 35; ++i) {
				const rad = degree2radian(i);
				expect(Math.tan(rad)).toBeCloseTo(globalThis.Math.tan(rad), precision);
			}

			expectTanCloseToReference(0, 35, 4);
		});

		test("wholePeriod: false is closer to the reference implementation than wholePeriod: true for several angles", () => {
			const angles = [0, 30, 45, 60, 80];

			for (const angle of angles) {
				const referenceTan = globalThis.Math.tan(degree2radian(angle));

				Math.reset({ wholePeriod: true });
				const tanWithWholePeriod = Math.tan(degree2radian(angle));

				Math.reset({ wholePeriod: false });
				const tanWithoutWholePeriod = Math.tan(degree2radian(angle));

				const distWith = globalThis.Math.abs(tanWithWholePeriod - referenceTan);
				const distWithout = globalThis.Math.abs(tanWithoutWholePeriod - referenceTan);

				expect(distWithout).toBeLessThanOrEqual(distWith);
			}
		});
	});
});

function expectTanCloseToReference(startDegree: number, endDegree: number, precision: number): void {
	for (let i = startDegree; i <= endDegree; ++i) {
		const rad = degree2radian(i);
		expect(Math.tan(rad)).toBeCloseTo(globalThis.Math.tan(rad), precision);
	}
}

function degree2radian(angle: number): number {
	return (angle * PI) / 180;
}
