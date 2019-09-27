import { ExceptionFactory } from "../../lib";

describe("test AssertionError", () => {
	it("初期化", () => {
		const message = "test message";

		const error = ExceptionFactory.createAssertionError(message);
		expect(error.message).toEqual(message);
		expect(error.name).toEqual("AssertionError");
	});
});
