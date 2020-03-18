import { DynamicFont, FontFamily, FontWeight, Game, SurfaceAtlasSet } from "..";
import { skeletonRuntime } from "./helpers";

declare const g: { game: Game };

describe("test DynamicFont", () => {
	it("初期化", () => {
		const runtime = skeletonRuntime();

		const font = new DynamicFont({
			game: runtime.game,
			fontFamily: FontFamily.SansSerif,
			size: 20,
			hint: {},
			fontColor: "white",
			fontWeight: FontWeight.Bold,
			strokeWidth: 1,
			strokeColor: "red",
			strokeOnly: true
		});
		expect(font.fontFamily).toBe(FontFamily.SansSerif);
		expect(font.size).toBe(20);
		expect(font.fontColor).toBe("white");
		expect(font.fontWeight).toBe(FontWeight.Bold);
		expect(font.strokeWidth).toBe(1);
		expect(font.strokeColor).toBe("red");
		expect(font.strokeOnly).toBe(true);
		expect(font._atlasSet.getAtlasUsedSize()).toEqual({
			height: 512,
			width: 512
		});

		expect(font._atlasSet.getMaxAtlasNum()).toEqual(SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM);
	});
	it("初期化 - Given hint", () => {
		const runtime = skeletonRuntime();

		const font = new DynamicFont({
			game: runtime.game,
			fontFamily: FontFamily.SansSerif,
			size: 20,
			hint: {
				initialAtlasWidth: 1000,
				initialAtlasHeight: 2000,
				maxAtlasWidth: 3000,
				maxAtlasHeight: 4000,
				maxAtlasNum: 5
			},
			fontColor: "white",
			fontWeight: FontWeight.Bold,
			strokeWidth: 1,
			strokeColor: "red",
			strokeOnly: true
		});
		expect(font.fontFamily).toBe(FontFamily.SansSerif);
		expect(font.size).toBe(20);
		expect(font.fontColor).toBe("white");
		expect(font.fontWeight).toBe(FontWeight.Bold);
		expect(font.strokeWidth).toBe(1);
		expect(font.strokeColor).toBe("red");
		expect(font.strokeOnly).toBe(true);
		expect(font.hint).toEqual({
			initialAtlasWidth: 1000,
			initialAtlasHeight: 2000,
			maxAtlasWidth: 3000,
			maxAtlasHeight: 4000,
			maxAtlasNum: 5
		});
		expect(font._atlasSet.getAtlasUsedSize()).toEqual({
			height: 2000,
			width: 1000
		});
		expect(font._atlasSet.getMaxAtlasNum()).toEqual(5);
	});
	it("初期化 - ParameterObject, 文字列配列によるフォントファミリ指定", () => {
		const runtime = skeletonRuntime();

		const param = {
			game: runtime.game,
			fontFamily: ["no-such-font", "Mock明朝"],
			size: 20
		};
		const font = new DynamicFont(param);
		expect(font.fontFamily).toBe(param.fontFamily);
		expect(font.size).toBe(font.size);
	});
	it("初期化 - ParameterObject, 文字列によるフォントファミリ指定", () => {
		const runtime = skeletonRuntime();

		const param = {
			game: runtime.game,
			fontFamily: "Mock明朝",
			size: 20
		};
		const font = new DynamicFont(param);
		expect(font.fontFamily).toBe(param.fontFamily);
		expect(font.size).toBe(font.size);
	});

	it("初期化 - ParameterObjectのgame省略, g.gameがない場合エラーとなる", () => {
		const param = {
			fontFamily: FontFamily.SansSerif,
			size: 20
		};
		try {
			new DynamicFont(param);
		} catch (e) {
			expect(e.message).toBe("GameInAssetContexts#getGameInAssetContext: Not in ScriptAsset.");
			expect(e.name).toEqual("AssertionError");
		}
	});

	it("初期化 - ParameterObjectのgame省略, g.gameが存在する場合は正常にインスタンスが生成される", () => {
		const runtime = skeletonRuntime();
		g.game = runtime.game;
		const param = {
			fontFamily: FontFamily.SansSerif,
			size: 20
		};
		const font = new DynamicFont(param);
		expect(font.fontFamily).toBe(param.fontFamily);
		expect(font.size).toBe(param.size);
	});

	describe("destroy", () => {
		it("DynamicFontがオーナーのSurfaceAtlasSetはDynamoicFontのdestroyで破棄される", () => {
			const df = new DynamicFont({
				game: skeletonRuntime().game,
				fontFamily: "Mock明朝",
				size: 20,
				hint: {
					maxAtlasNum: 2,
					maxAtlasWidth: 100,
					baselineHeight: 20
				}
			});
			df.destroy();
			expect(df._atlasSet.destroyed()).toBeTruthy();
		});
		it("DynamicFont以外がオーナーのSurfaceAtlasSetはDynamoicFontのdestroyで破棄されない", () => {
			const df = new DynamicFont({
				game: skeletonRuntime().game,
				fontFamily: "Mock明朝",
				size: 20
			});
			df.destroy();
			expect(df._atlasSet.destroyed()).toBeFalsy();

			const sas = new SurfaceAtlasSet({ resourceFactory: skeletonRuntime().game.resourceFactory });
			const df2 = new DynamicFont({
				game: skeletonRuntime().game,
				fontFamily: "Mock明朝",
				size: 20,
				surfaceAtlasSet: sas
			});
			df2.destroy();
			expect(df2._atlasSet.destroyed()).toBeFalsy();
		});
	});
});
