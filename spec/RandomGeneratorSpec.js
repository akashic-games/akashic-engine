describe("test RandomGenerator", function() {
	var g = require('../lib/');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var generator = new g.RandomGenerator(1);
		expect(generator.seed).toEqual(1);
	});
});
