import { customMatchers, skeletonRuntime } from "./helpers";
import { FilledRect, LogLevel } from "..";

expect.extend(customMatchers);

describe("test ColorBox", () => {
	it("初期化", () => {
		const runtime = skeletonRuntime();
		const box = new FilledRect({
			scene: runtime.scene,
			cssColor: "red",
			x: 10,
			y: 20,
			width: 48,
			height: 32,
			opacity: 0.4
		});
		expect(box.width).toBe(48);
		expect(box.height).toBe(32);
		expect(box.cssColor).toBe("red");
		expect(box.x).toBe(10);
		expect(box.y).toBe(20);
		expect(box.opacity).toBe(0.4);
	});

	it("初期化 - Mismatch cssColor", () => {
		const runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = LogLevel.Debug;
		expect(() => {
			return new FilledRect({
				scene: runtime.scene,
				cssColor: 0 as any,
				width: 48,
				height: 32
			});
		}).toThrowError("TypeMismatchError");

		expect(() => {
			return new FilledRect({
				scene: runtime.scene,
				cssColor: 0 as any,
				x: 10,
				y: 20,
				width: 48,
				height: 32,
				opacity: 0.4
			});
		}).toThrowError("TypeMismatchError");
		runtime.game.suppressedLogLevel = undefined;
	});
});
