import { customMatchers, Surface } from "./helpers";

expect.extend(customMatchers);

describe("test Surface", () => {
	it("初期化", () => {
		const width = 1;
		const height = 2;

		const surface = new Surface(width, height);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
	});

	it("初期化 - enable drawable", () => {
		const width = 1;
		const height = 2;

		const surface = new Surface(width, height, true);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface._drawable).toBe(true);
	});

	it("初期化 - invalid params", () => {
		expect(() => new Surface(1.1, 2)).toThrowError("AssertionError");
		expect(() => new Surface(1, 2.1)).toThrowError("AssertionError");
	});
});
