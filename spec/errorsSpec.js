describe("Util.distance()", function() {
	var g = require('../lib/');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	function DangerClass() {
		this.toString = function() {
			throw new Error("OMG");
		}
	}

	function DangerClass2() {
		Object.defineProperty(this, "constructor", {
			get: function() { throw new Error("OMG"); }
		});
	}


	it("TypeMismatchError", function() {
		var ex;
		ex = g.ExceptionFactory.createTypeMismatchError("test", "string", {});
		expect(ex.message).toBe("Type mismatch on test, expected type is string, actual type is Object.");
		ex = g.ExceptionFactory.createTypeMismatchError("hoge", "number", new g.Asset("a", "b"));
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number, actual type is Asset.");
		ex = g.ExceptionFactory.createTypeMismatchError("hoge", "number");
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number.");
		ex = g.ExceptionFactory.createTypeMismatchError("hoge", "number", new DangerClass());
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number, actual type is DangerClass.");
		ex = g.ExceptionFactory.createTypeMismatchError("hoge", "number", new DangerClass2());
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number.");
	});
});
