describe("test PureVirtualError", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var methodName = "testFunc";

		var error = g.ExceptionFactory.createPureVirtualError(methodName);
		expect(error.message).toEqual(methodName + " has no implementation.");
		expect(error.name).toEqual("PureVirtualError");
	});
});
