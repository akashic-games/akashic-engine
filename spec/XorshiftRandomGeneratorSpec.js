describe("test XorshiftRandomGenerator", function() {
	var g = require('../lib/');
	var spec = require('./support/randomGenerator.js').spec;

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	spec(it, expect, g.XorshiftRandomGenerator);
});
