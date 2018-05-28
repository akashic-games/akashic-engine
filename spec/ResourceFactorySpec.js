var g = require('../lib/main.node.js');
var mock = require("./helpers/mock");

describe("ResourceFactory", function() {
	var resourceFactory = new mock.ResourceFactory();
	describe("createTrimmedSurface", function() {
		it("can trim a surface in specified area", function() {
			var surface = new mock.Surface(100, 100);
			var trimmedArea = {
				x: 35,
				y: 40,
				width: 30,
				height: 20
			};
			var trimmedSurface = resourceFactory.createTrimmedSurface(surface, trimmedArea);
			expect(trimmedSurface).toBeDefined();
			expect(trimmedSurface.width).toBe(30);
			expect(trimmedSurface.height).toBe(20);
		});
		it("can create clone of specified surface", function() {
			var surface = new mock.Surface(100, 100);
			var trimmedSurface = resourceFactory.createTrimmedSurface(surface);
			expect(trimmedSurface).toBeDefined();
			expect(trimmedSurface.width).toBe(100);
			expect(trimmedSurface.height).toBe(100);
		});
	});
});