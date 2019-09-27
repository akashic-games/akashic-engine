import { customMatchers } from "./helpers";
import { Xorshift } from "..";
const RefXorshift = require("xorshift").constructor; // tslint:disable-line: no-var-requires

describe.skip("test XorshiftRandomGenerator", () => {
	beforeEach(() => {
		expect.extend(customMatchers);
	});

	it("Xorshift - nextInt", () => {
		// この関数のマジックナンバーは単にテスト用であり他に依存しない

		for (let i = 0; i < 10; ++i) {
			const generator = new Xorshift(i);
			const count = [0, 0, 0];
			for (let j = 0; j < 100; ++j) {
				count[generator.nextInt(0, 3)] += 1;
			}
			expect(count[0] + count[1] + count[2]).toBe(100);
			expect(count[0]).not.toBe(0);
			expect(count[1]).not.toBe(0);
			expect(count[2]).not.toBe(0);
		}
	});

	it("Xorshift - vs reference implementation", () => {
		const generator = new Xorshift(0);
		(generator as any)._state0U = 100;
		(generator as any)._state0L = 101;
		(generator as any)._state1U = 102;
		(generator as any)._state1L = 103;
		const ref = new RefXorshift([100, 101, 102, 103]);
		const result = [];
		const refResult = [];
		for (let i = 0; i < 1000; ++i) {
			result.push(generator.random());
			refResult.push(ref.random());
		}
		expect(result).toEqual(refResult);
	});
});
