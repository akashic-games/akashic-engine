describe("test Renderer", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("test name", function() {
		var renderer = new g.Renderer();
		//nothing to do
	});

	it("clear", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.clear()}).toThrowError("PureVirtualError");
	});

	it("drawImage", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.drawImage(null, 0, 0, 0, 0, 0, 0)}).toThrowError("PureVirtualError");
	});

	it("translate", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.translate(0, 0)}).toThrowError("PureVirtualError");
	});

	it("transform", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.transform([0])}).toThrowError("PureVirtualError");
	});

	it("opacity", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.opacity()}).toThrowError("PureVirtualError");
	});

	it("save", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.save()}).toThrowError("PureVirtualError");
	});

	it("restore", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.restore()}).toThrowError("PureVirtualError");
	});

	it("fillRect", function() {
		var renderer = new g.Renderer();
		expect(function(){renderer.fillRect(0, 0, 480, 480, "red")}).toThrowError("PureVirtualError");
	});
});
