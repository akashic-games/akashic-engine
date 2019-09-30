var g = require("../lib/main.node.js");
describe("test Object2D", function () {
	var e;

	beforeEach(function () {
		e = new g.Object2D();
	});
	afterEach(function () {
	});

	it("初期化", function () {
		expect(e.x).toEqual(0);
		expect(e.y).toEqual(0);
		expect(e.width).toEqual(0);
		expect(e.height).toEqual(0);
		expect(e.opacity).toEqual(1);
		expect(e.scaleX).toEqual(1);
		expect(e.scaleY).toEqual(1);
		expect(e.angle).toEqual(0);
		expect(e.compositeOperation).toBeUndefined();
		expect(e.anchorX).toBeUndefined();
		expect(e.anchorY).toBeUndefined();
		expect(e._matrix).toBeUndefined();
	});

	it("初期化 - ParameterObject", function () {
		var e = new g.Object2D({});
		expect(e.x).toEqual(0);
		expect(e.y).toEqual(0);
		expect(e.width).toEqual(0);
		expect(e.height).toEqual(0);
		expect(e.opacity).toEqual(1);
		expect(e.scaleX).toEqual(1);
		expect(e.scaleY).toEqual(1);
		expect(e.angle).toEqual(0);
		expect(e.compositeOperation).toBeUndefined();
		expect(e.anchorX).toBeUndefined();
		expect(e.anchorY).toBeUndefined();
		expect(e._matrix).toBeUndefined();

		var e = new g.Object2D({
			x: 1,
			y: 2,
			width: 3,
			height: 4,
			opacity: 0.2,
			scaleX: 0.4,
			scaleY: 1.2,
			angle: 10,
			compositeOperation: g.CompositeOperation.SourceAtop,
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
		expect(e.compositeOperation).toEqual(g.CompositeOperation.SourceAtop);
		expect(e.anchorX).toBe(0);
		expect(e.anchorY).toBe(1);
		expect(e._matrix).toBeUndefined();
	});

	it("moveTo", function () {
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

		var pos = { x: 1, y: 1};
		e.moveTo(pos);
		expect(e.x).toEqual(1);
		expect(e.y).toEqual(1);
	});

	it("moveTo - AssertionError", function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		var pos = { x: 1, y: 1};
		expect(function(){e.moveTo(-1, pos)}).toThrowError("AssertionError");
	});

	it("moveToEntity", function () {
		var e2 = new g.Object2D();
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

	it("moveBy", function () {
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

	it("resizeTo", function () {
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

		var size = { width: 100, height: 100};
		e.resizeTo(size);
		expect(e.width).toEqual(100);
		expect(e.height).toEqual(100);
	});

	it("resizeTo - AssertionError", function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));

		var size = { width: 100, height: 100};
		expect(function(){e.resizeTo(100, size)}).toThrowError("AssertionError");
	});

	it("resizeToEntity", function () {
		var e2 = new g.Object2D();
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

	it("resizeBy", function () {
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

	it("scale", function () {
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

	it("anchor", function () {
		e.anchor(1, 0);
		expect(e.anchorX).toBe(1);
		expect(e.anchorY).toBe(0);
		e.anchor(0.5, 0.5);
		expect(e.anchorX).toBe(0.5);
		expect(e.anchorY).toBe(0.5);
	});

	it("getMatrix", function () {
		var scarecrow = g.Util.createMatrix();

		expect(e.getMatrix()).toEqual(scarecrow);

		e.scale(2);
		e._matrix._modified = true;
		scarecrow = g.Util.createMatrix(0, 0, 2, 2, 0);
		expect(e.getMatrix()).toEqual(scarecrow);
		expect(e._matrix._modified).toBe(false);

		e.scale(1);
		e._matrix._modified = true;
		scarecrow = g.Util.createMatrix();
		expect(e.getMatrix()).toEqual(scarecrow);
		expect(e._matrix._modified).toBe(false);

		e.resizeTo(20, 20);
		e.moveTo(10, 10);
		e.anchor(1, 1);
		e._matrix._modified = true;
		var expected = new g.PlainMatrix();
		expected.updateWithAnchor(20, 20, 1, 1, 0, 10, 10, 1, 1);
		expect(e.getMatrix()._matrix).toEqual(expected._matrix);
		expect(e._matrix._modified).toBe(false);
	});
});

