import { FontFamily, TextAlign, TextBaseline, SystemLabel } from "..";
import { skeletonRuntime } from "./helpers";

describe("test SystemLabel", () => {
	it("初期化", () => {
		const runtime = skeletonRuntime();

		const systemLabel = new SystemLabel({
			scene: runtime.scene,
			text: "The quick brown fox jumps over the lazy dog",
			fontSize: 10,
			textAlign: TextAlign.Center,
			textBaseline: TextBaseline.Alphabetic,
			maxWidth: 100,
			textColor: "red",
			fontFamily: FontFamily.SansSerif,
			width: 50,
			height: 20
		});

		expect(systemLabel.scene).toBe(runtime.scene);
		expect(systemLabel.text).toBe("The quick brown fox jumps over the lazy dog");
		expect(systemLabel.fontSize).toBe(10);
		expect(systemLabel.textAlign).toBe(TextAlign.Center);
		expect(systemLabel.textBaseline).toBe(TextBaseline.Alphabetic);
		expect(systemLabel.maxWidth).toBe(100);
		expect(systemLabel.textColor).toBe("red");
		expect(systemLabel.fontFamily).toBe(FontFamily.SansSerif);
		expect(systemLabel.strokeWidth).toBe(0);
		expect(systemLabel.strokeColor).toBe("black");
		expect(systemLabel.strokeOnly).toBe(false);
	});
	it("初期化 - 輪郭の指定", () => {
		const runtime = skeletonRuntime();

		const systemLabel = new SystemLabel({
			scene: runtime.scene,
			text: "The quick brown fox jumps over the lazy dog",
			fontSize: 10,
			textAlign: TextAlign.Center,
			textBaseline: TextBaseline.Alphabetic,
			maxWidth: 100,
			textColor: "red",
			fontFamily: FontFamily.SansSerif,
			width: 50,
			height: 20,
			strokeWidth: 2,
			strokeColor: "yellow",
			strokeOnly: true
		});

		expect(systemLabel.strokeWidth).toBe(2);
		expect(systemLabel.strokeColor).toBe("yellow");
		expect(systemLabel.strokeOnly).toBe(true);
	});
});
