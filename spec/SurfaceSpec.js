describe("test Surface", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var width = 1;
		var height = 2;

		var surface = new g.Surface(width, height);
		expect(surface.width).toEqual(width);
		expect(surface.height).toEqual(height);
		expect(surface.isDynamic).toBe(false);
		expect(surface.animatingStarted).toBeUndefined();
		expect(surface.animatingStopped).toBeUndefined();
	});

	it("初期化 - enable drawable", function() {
		var width = 1;
		var height = 2;

		var surface = new g.Surface(width, height, true);
		expect(surface.width).toEqual(width);
		expect(surface.height).toEqual(height);
		expect(surface._drawable).toEqual(true);
		expect(surface.isDynamic).toBe(false);
		expect(surface.animatingStarted).toBeUndefined();
		expect(surface.animatingStopped).toBeUndefined();
	});

	it("初期化 - invalid params", function() {
		var width = 1;
		var height = 2;

		var surface = new g.Surface(width, height, true);
		expect(function(){new g.Surface(1.1, 2)}).toThrowError("AssertionError");
		expect(function(){new g.Surface(1, 2.1)}).toThrowError("AssertionError");
	});

	it("初期化 - dynamic contents", function() {
		var width = 1;
		var height = 2;

		var isDynamic = true;
		var drawable = {};
		var surface = new g.Surface(width, height, drawable, isDynamic);
		expect(surface.width).toEqual(width);
		expect(surface.height).toEqual(height);
		expect(surface._drawable).toEqual(drawable);
		expect(surface.isDynamic).toBe(isDynamic);
		expect(surface.animatingStarted.constructor).toBe(g.Trigger);
		expect(surface.animatingStopped.constructor).toBe(g.Trigger);
	});
});
