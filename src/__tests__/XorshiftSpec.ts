import { Xorshift } from "..";
import { customMatchers } from "./helpers";
/* eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
const RefXorshift = require("xorshift").constructor; // require と変数名でエラーとなるが、型定義がないのでコメントで無効とする。

expect.extend(customMatchers);

describe("test XorshiftRandomGenerator", () => {
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
		const generator = Xorshift.deserialize({
			_state0U: 100,
			_state0L: 101,
			_state1U: 102,
			_state1L: 103
		});
		const ref = new RefXorshift([100, 101, 102, 103]) as Xorshift;
		for (let i = 0; i < 100; ++i) {
			expect(generator.random()).toEqual(ref.random());
		}
	});
});
