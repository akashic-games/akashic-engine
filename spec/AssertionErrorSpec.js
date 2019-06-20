describe("test AssertionError", function() {
	var g = require('../lib');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var message = "test message";

		var error = g.ExceptionFactory.createAssertionError(message);
		expect(error.message).toEqual(message);
		expect(error.name).toEqual("AssertionError");
	});
});
