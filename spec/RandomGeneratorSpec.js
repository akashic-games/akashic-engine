describe("test RandomGenerator", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var generator = new g.RandomGenerator(1);
		expect(generator.seed).toEqual(1);
	});

	it("get", function() {
		var generator = new g.RandomGenerator(1);
		expect(function(){generator.get(0, 10)}).toThrowError("PureVirtualError");
	});

	it("serialize", function() {
		var generator = new g.RandomGenerator(1);
		expect(function(){generator.serialize()}).toThrowError("PureVirtualError");
	});
});
