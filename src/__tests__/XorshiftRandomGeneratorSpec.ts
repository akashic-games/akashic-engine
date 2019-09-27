import { XorshiftRandomGenerator } from "..";
import { customMatchers } from "./helpers";

describe("test XorshiftRandomGenerator", () => {
	beforeEach(() => {
		expect.extend(customMatchers);
	});

	it("初期化", () => {
		const generator = new XorshiftRandomGenerator(1);
		expect(generator.seed).toEqual(1);
	});

	it("初期化 - missed seed", () => {
		expect(() => {
			return new XorshiftRandomGenerator(undefined);
		}).toThrow();
	});

	it("can be serialized", () => {
		// この関数のマジックナンバーは単にテスト用であり他に依存しない

		const generator = new XorshiftRandomGenerator(42);

		for (let i = 0; i < 10; ++i) generator.get(0, 10000);

		const copy1 = XorshiftRandomGenerator.deserialize(generator.serialize());
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));

		const copy2 = XorshiftRandomGenerator.deserialize(copy1.serialize());
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));

		const ser = generator.serialize();
		const copy3 = XorshiftRandomGenerator.deserialize(JSON.parse(JSON.stringify(ser)));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
	});

	it("is distribution within expectation", () => {
		// このテストは厳密な仕様記述ではなく、「10000回やればこれぐらいの範囲になるだろう」という期待値でしかないことに注意
		const generator = new XorshiftRandomGenerator(1);
		const testCases = [[-8, 8], [-8, -4], [-8, 0], [0, 8], [4, 8]];
		testCases.forEach(testCase => {
			const resultMap: number[] = [];
			for (let i = 0; i < 10000; i++) {
				resultMap.push(generator.get(testCase[0], testCase[1]));
			}
			let sum = 0;
			resultMap.forEach(v => {
				expect(v).toBeGreaterThan(testCase[0] - 1);
				expect(v).toBeLessThan(testCase[1] + 1);
				sum += v;
			});
			expect(sum / 10000).toBeGreaterThan((testCase[0] + testCase[1]) / 2 - 1);
			expect(sum / 10000).toBeLessThan((testCase[0] + testCase[1]) / 2 + 1);
		});
	});

	it("is difference within expectation", () => {
		// このテストは厳密な仕様記述ではなく、「10000回やればこれぐらいの分布になるだろう」という期待値でしかないことに注意
		const cycle = 10000;
		const testCases = [[-10, 10], [-26, -6], [-20, 0], [0, 20], [4, 24]];
		// 上記各テストケースの乱数範囲に対応したカイ2乗分布表で危険率0.01の値
		const threshold = 37.5622;
		for (let seed = 0; seed < 5; ++seed) {
			testCases.forEach(testCase => {
				const generator = new XorshiftRandomGenerator(seed);
				const resultMap = new Array(testCase[1] - testCase[0] + 1);
				for (let i = 0; i < cycle; i++) {
					const num = generator.get(testCase[0], testCase[1]) + (0 - testCase[0]);
					if (!resultMap[num]) resultMap[num] = 0;
					++resultMap[num];
				}
				let score = 0;
				const expected = cycle / (testCase[1] - testCase[0] + 1);
				for (let i = 0; i <= testCase[1] - testCase[0]; ++i) {
					score += ((resultMap[i] - expected) * (resultMap[i] - expected)) / expected;
				}
				expect(score).toBeLessThan(threshold);
			});
		}
	});
});
