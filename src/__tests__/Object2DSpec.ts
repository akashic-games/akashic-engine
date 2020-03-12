import { Object2D, PlainMatrix } from "..";
import { customMatchers } from "./helpers";

expect.extend(customMatchers);

describe("test Object2D", () => {
	let e: Object2D;

	beforeEach(() => {
		e = new Object2D();
	});

	it("初期化", () => {
		expect(e.x).toEqual(0);
		expect(e.y).toEqual(0);
		expect(e.width).toEqual(0);
		expect(e.height).toEqual(0);
		expect(e.opacity).toEqual(1);
		expect(e.scaleX).toEqual(1);
		expect(e.scaleY).toEqual(1);
		expect(e.angle).toEqual(0);
		expect(e.compositeOperation).toBeUndefined();
		expect(e.anchorX).toBe(0);
		expect(e.anchorY).toBe(0);
		expect(e._matrix).toBeUndefined();
	});

	it("初期化 - ParameterObject", () => {
		let e = new Object2D({});
		expect(e.x).toEqual(0);
		expect(e.y).toEqual(0);
		expect(e.width).toEqual(0);
		expect(e.height).toEqual(0);
		expect(e.opacity).toEqual(1);
		expect(e.scaleX).toEqual(1);
		expect(e.scaleY).toEqual(1);
		expect(e.angle).toEqual(0);
		expect(e.compositeOperation).toBeUndefined();
		expect(e.anchorX).toBe(0);
		expect(e.anchorY).toBe(0);
		expect(e._matrix).toBeUndefined();

		e = new Object2D({
			x: 1,
			y: 2,
			width: 3,
			height: 4,
			opacity: 0.2,
			scaleX: 0.4,
			scaleY: 1.2,
			angle: 10,
			compositeOperation: "sourceAtop",
			anchorX: 0,
			anchorY: 1
		});
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(2);
		expect(e.width).toEqual(3);
		expect(e.height).toEqual(4);
		expect(e.opacity).toEqual(0.2);
		expect(e.scaleX).toEqual(0.4);
		expect(e.scaleY).toEqual(1.2);
		expect(e.angle).toEqual(10);
		expect(e.compositeOperation).toEqual("sourceAtop");
		expect(e.anchorX).toBe(0);
		expect(e.anchorY).toBe(1);
		expect(e._matrix).toBeUndefined();
	});

	it("moveTo", () => {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		e.moveTo(1, 1);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(1);
		e.moveTo(-1, -1);
		expect(e.x).toEqual(-1);
		expect(e.y).toEqual(-1);
		e.moveTo(0, -1);
		expect(e.x).toEqual(0);
		expect(e.y).toEqual(-1);

		const pos = { x: 1, y: 1 };
		e.moveTo(pos);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(1);
	});

	it("moveTo - AssertionError", () => {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		const pos = { x: 1, y: 1 };
		expect(() => {
			e.moveTo(-1, pos as any);
		}).toThrowError("AssertionError");
	});

	it("moveToEntity", () => {
		const e2 = new Object2D();
		e.moveTo(e2);
		expect(e.x).toEqual(e2.x);
		expect(e.y).toEqual(e2.y);
		e2.moveTo(500, 500);
		e.moveTo(e2);
		expect(e.x).toEqual(e2.x);
		expect(e.y).toEqual(e2.y);
		e2.moveTo(100, 41000);
		e.moveTo(e2);
		expect(e.x).toEqual(e2.x);
		expect(e.y).toEqual(e2.y);
	});

	it("moveBy", () => {
		e.moveBy(1, 0);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(0);
		e.moveBy(0, 1);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(1);
		e.moveBy(0, -1);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(0);
		e.moveBy(-2, -1);
		expect(e.x).toEqual(-1);
		expect(e.y).toEqual(-1);
	});

	it("resizeTo", () => {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		e.resizeTo(100, 100);
		expect(e.width).toEqual(100);
		expect(e.height).toEqual(100);
		e.resizeTo(-100, 100);
		expect(e.width).toEqual(-100);
		expect(e.height).toEqual(100);
		e.resizeTo(-200, -200);
		expect(e.width).toEqual(-200);
		expect(e.height).toEqual(-200);

		const size = { width: 100, height: 100 };
		e.resizeTo(size);
		expect(e.width).toEqual(100);
		expect(e.height).toEqual(100);
	});

	it("resizeTo - AssertionError", () => {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		const size = { width: 100, height: 100 };
		expect(() => {
			e.resizeTo(100, size as any);
		}).toThrowError("AssertionError");
	});

	it("resizeToEntity", () => {
		const e2 = new Object2D();
		e.resizeTo(e2);
		expect(e.width).toEqual(e2.width);
		expect(e.height).toEqual(e2.height);
		e2.resizeTo(500, 500);
		e.resizeTo(e2);
		expect(e.width).toEqual(e2.width);
		expect(e.height).toEqual(e2.height);
		e2.resizeTo(100, 41000);
		e.resizeTo(e2);
		expect(e.width).toEqual(e2.width);
		expect(e.height).toEqual(e2.height);
	});

	it("resizeBy", () => {
		e.resizeBy(1, 0);
		expect(e.width).toEqual(1);
		expect(e.height).toEqual(0);
		e.resizeBy(0, 1);
		expect(e.width).toEqual(1);
		expect(e.height).toEqual(1);
		e.resizeBy(0, -1);
		expect(e.width).toEqual(1);
		expect(e.height).toEqual(0);
		e.resizeBy(-2, -1);
		expect(e.width).toEqual(-1);
		expect(e.height).toEqual(-1);
	});

	it("scale", () => {
		e.scale(2);
		expect(e.scaleX).toBe(2);
		expect(e.scaleY).toBe(2);
		e.scale(0.5);
		expect(e.scaleX).toBe(0.5);
		expect(e.scaleY).toBe(0.5);
		e.scale(1);
		expect(e.scaleX).toBe(1);
		expect(e.scaleY).toBe(1);
	});

	it("anchor", () => {
		e.anchor(1, 0);
		expect(e.anchorX).toBe(1);
		expect(e.anchorY).toBe(0);
		e.anchor(0.5, 0.5);
		expect(e.anchorX).toBe(0.5);
		expect(e.anchorY).toBe(0.5);
	});

	it("getMatrix", () => {
		let scarecrow = new PlainMatrix();
		expect(e.getMatrix()).toEqual(scarecrow);

		e.scale(2);
		e._matrix._modified = true;
		scarecrow = new PlainMatrix(0, 0, 2, 2, 0, 1, 1);
		expect(e.getMatrix()).toEqual(scarecrow);
		expect(e._matrix._modified).toBe(false);

		e.scale(1);
		e._matrix._modified = true;
		scarecrow = new PlainMatrix();
		expect(e.getMatrix()).toEqual(scarecrow);
		expect(e._matrix._modified).toBe(false);

		e.resizeTo(20, 20);
		e.moveTo(10, 10);
		e.anchor(1, 1);
		e._matrix._modified = true;
		const expected = new PlainMatrix();
		expected.update(20, 20, 1, 1, 0, 10, 10, 1, 1);
		expect(e.getMatrix()._matrix).toEqual(expected._matrix);
		expect(e._matrix._modified).toBe(false);
	});
});
