import { ExceptionFactory } from "../engine/ExceptionFactory";
import { TextAsset } from "./helpers";

describe("Util.distance()", () => {
	class DangerClass {
		toString(): never {
			throw new Error("OMG");
		}
	}

	class DangerClass2 {
		constructor() {
			Object.defineProperty(this, "constructor", {
				get: () => {
					throw new Error("OMG");
				}
			});
		}
	}

	it("TypeMismatchError", () => {
		let ex;
		ex = ExceptionFactory.createTypeMismatchError("test", "string", {});
		expect(ex.message).toBe("Type mismatch on test, expected type is string, actual type is Object.");
		ex = ExceptionFactory.createTypeMismatchError("hoge", "number", new TextAsset(null!, 0, "a", "b"));
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number, actual type is TextAsset.");
		ex = ExceptionFactory.createTypeMismatchError("hoge", "number");
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number.");
		ex = ExceptionFactory.createTypeMismatchError("hoge", "number", new DangerClass());
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number, actual type is DangerClass.");
		ex = ExceptionFactory.createTypeMismatchError("hoge", "number", new DangerClass2());
		expect(ex.message).toBe("Type mismatch on hoge, expected type is number.");
	});
});
