import { Trigger } from "..";
import { Surface, customMatchers } from "./helpers";

describe("test Surface", () => {
	beforeEach(() => {
		expect.extend(customMatchers);
	});

	it("初期化", () => {
		const width = 1;
		const height = 2;

		const surface = new Surface(width, height);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface.isDynamic).toBe(false);
		expect(surface.animatingStarted).toBeUndefined();
		expect(surface.animatingStopped).toBeUndefined();
	});

	it("初期化 - enable drawable", () => {
		const width = 1;
		const height = 2;

		const surface = new Surface(width, height, true);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface._drawable).toBe(true);
		expect(surface.isDynamic).toBe(false);
		expect(surface.animatingStarted).toBeUndefined();
		expect(surface.animatingStopped).toBeUndefined();
	});

	it("初期化 - invalid params", () => {
		expect(() => new Surface(1.1, 2)).toThrowError("AssertionError");
		expect(() => new Surface(1, 2.1)).toThrowError("AssertionError");
	});

	it("初期化 - dynamic contents", () => {
		const width = 1;
		const height = 2;

		const isDynamic = true;
		const drawable = {};
		const surface = new Surface(width, height, drawable, isDynamic);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface._drawable).toBe(drawable);
		expect(surface.isDynamic).toBe(isDynamic);
		expect(surface.animatingStarted.constructor).toBe(Trigger);
		expect(surface.animatingStopped.constructor).toBe(Trigger);
	});
});
