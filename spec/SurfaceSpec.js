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
		expect(surface.hasVariableResolution).toBe(false);
		expect(surface.xScale).toEqual(1);
		expect(surface.yScale).toEqual(1);
		expect(surface.contentReset).toBeUndefined();
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
		expect(surface.hasVariableResolution).toBe(false);
		expect(surface.xScale).toEqual(1);
		expect(surface.yScale).toEqual(1);
		expect(surface.contentReset).toBeUndefined();
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

		var optionalFlag = 1;
		var drawable = {};
		var surface = new g.Surface(width, height, drawable, optionalFlag);
		expect(surface.width).toEqual(width);
		expect(surface.height).toEqual(height);
		expect(surface._drawable).toEqual(drawable);
		expect(surface.isDynamic).toBe(true);
		expect(surface.animatingStarted.constructor).toBe(g.Trigger);
		expect(surface.animatingStopped.constructor).toBe(g.Trigger);
		expect(surface.hasVariableResolution).toBe(false);
		expect(surface.xScale).toEqual(1);
		expect(surface.yScale).toEqual(1);
		expect(surface.contentReset).toBeUndefined();
	});

	it("初期化 - able to redraw", function() {
		var width = 1;
		var height = 2;

		var optionalFlag = 2;
		var drawable = {};
		var surface = new g.Surface(width, height, drawable, optionalFlag);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface._drawable).toBe(drawable);
		expect(surface.isDynamic).toBe(false);
		expect(surface.animatingStarted).toBeUndefined();
		expect(surface.animatingStopped).toBeUndefined();
		expect(surface.hasVariableResolution).toBe(true);
		expect(surface.xScale).toBe(1);
		expect(surface.yScale).toBe(1);
		expect(surface.contentReset.constructor).toBe(g.Trigger);
	});

	it("初期化 - dynamic contents and able to redraw", function() {
		var width = 1;
		var height = 2;

		var optionalFlag = 3;
		var drawable = {};
		var surface = new g.Surface(width, height, drawable, optionalFlag);
		expect(surface.width).toBe(width);
		expect(surface.height).toBe(height);
		expect(surface._drawable).toBe(drawable);
		expect(surface.isDynamic).toBe(true);
		expect(surface.animatingStarted.constructor).toBe(g.Trigger);
		expect(surface.animatingStopped.constructor).toBe(g.Trigger);
		expect(surface.hasVariableResolution).toBe(true);
		expect(surface.xScale).toBe(1);
		expect(surface.yScale).toBe(1);
		expect(surface.contentReset.constructor).toBe(g.Trigger);
	});

	it("destroy surface, and destroy triggers", function() {
		var width = 1;
		var height = 2;
		var optionalFlag = 3;
		var drawable = {};
		var surface = new g.Surface(width, height, drawable, optionalFlag);
		expect(surface.animatingStarted.constructor).toBe(g.Trigger);
		expect(surface.animatingStopped.constructor).toBe(g.Trigger);
		expect(surface.contentReset.constructor).toBe(g.Trigger);
		expect(surface.destroyed()).toBe(false);
		surface.destroy();
		expect(surface.animatingStarted._handlers).toBe(null);
		expect(surface.animatingStopped._handlers).toBe(null);
		expect(surface.contentReset._handlers).toBe(null);
		expect(surface.destroyed()).toBe(true);
	});
});
