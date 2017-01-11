declare var j$: any;
var customMatchers = {
	toHaveProperty: function(util: any, customEqualityTesters: any): any {
		return {
			compare: function(actual: any, expected: any): any {
				if (arguments.length < 2) {
					throw new Error("empty expected");
				}
				if (arguments.length > 2) {
					expected = Array.prototype.slice.call(arguments, 1);
				}
				if (Array.isArray(expected)) {
					var message: string;
					return {
						pass: expected.filter(function(v: string): boolean {
							if (! (v in actual))
								message = "does not contains " + v;
							return v in actual;
						}).length === expected.length,
						message: message
					};
				}
				if (expected in actual) {
					return { pass: true };
				}
				return {
					pass: false,
					message: "doest not contains " + expected
				};
			}
		};
	},
	toHaveUndefinedValue: function(util: any, customEqualityTesters: any): any {
		return {
			compare: function(actual: any, expected: any): any {
				if (arguments.length === 0) {
					throw new Error("empty actual");
				}
				if (arguments.length === 1) {
					expected = Object.keys(actual);
				}
				if (arguments.length > 2) {
					expected = Array.prototype.slice.call(arguments, 1);
				}
				if (Array.isArray(expected)) {
					var message: string;
					return {
						pass: expected.filter(function(v: string): boolean {
							if (! (v in actual))
								message = "does not contains " + v;
							return v in actual;
						}).filter(function(v: string): boolean {
							if (actual[v] !== undefined)
								message = v + " is defined";
							return actual[v] === undefined;
						}).length === expected.length,
						message: message
					};
				}
				if (expected in actual) {
					if (actual[expected] === undefined)
						return { pass: true };

					return { pass: false, message: expected + " is defined" };
				}
				return {
					pass: false,
					message: "doest not contains " + expected
				};
			}
		};
	},
	toThrowError: function(util: any, customEqualityTesters: any): any {
		return {
			compare: function(actual: any, expected: any): any {
				var result = { pass: false, message: "" };
				var threw = false;
				var thrown: any;

				if (typeof actual !== "function") {
					throw new Error("Actual is not a Function");
				}

				try {
					actual();
				} catch (e) {
					threw = true;
					thrown = e;
				}

				if (!threw) {
					result.message = "Expected function to throw an exception.";
					return result;
				}
				if (!(thrown instanceof Error)) {
					result.message = "Expected function to throw an Error";
					return result;
				}

				if (arguments.length === 1) {
					result.pass = true;
					result.message = "Expected function not to throw, but it threw " + j$.pp(thrown) + ".";

					return result;
				}

				if (thrown.name === expected) {
					result.pass = true;
				}

				return result;
			}
		};
	},
	toBeNear: function(util: any, customEqualityTesters: any): any {
		function near(threshold: number, expected: any, actual: any): any {
			if (expected instanceof Array) {
				return expected.every((v: any, i: number) => {
					return near(threshold, v, actual[i]);
				});
			} else {
				return Math.abs(expected - actual) <= Math.pow(10, -threshold);
			}
		}
		return {
			compare: function(actual: any, expected: any, threshold: number = 10): any {
				var result = { pass: false, message: "" };
				if (near(threshold, expected, actual))
					result.pass = true;
				return result;
			}
		};
	}

};

export = customMatchers;
