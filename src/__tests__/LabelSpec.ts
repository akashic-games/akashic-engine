import { BitmapFont, GlyphArea, Label } from "..";
import { Renderer, skeletonRuntime, Surface } from "./helpers";

describe("test Label", () => {
	it("初期化", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph: GlyphArea = { x: 2, y: 3 };
		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});

		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 10,
			textAlign: "center",
			maxWidth: 100,
			widthAutoAdjust: false,
			width: 50,
			height: 20,
			textColor: "white"
		});
		expect(label.scene).toBe(runtime.scene);
		expect(label.text).toEqual("a");
		expect(label.font).toBe(bmpfont);
		expect(label.fontSize).toBe(10);
		expect(label.textAlign).toBe("center");
		expect(label.maxWidth).toBe(100);
		expect(label.widthAutoAdjust).toBe(false);
		expect(label.width).toBe(50);
		expect(label.height).toBe(10); // height 指定は無視されて fontSize で上書きされる
		expect(label.textColor).toBe("white");
	});
	it("初期化 - missMissingGlyph", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };
		// @ts-ignore
		const missingGlyph: GlyphArea = null;

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		expect(bmpfont.surface).not.toBeNull();
		expect(bmpfont.defaultGlyphWidth).toEqual(width);
		expect(bmpfont.defaultGlyphHeight).toEqual(height);
		expect(bmpfont.map).toEqual(map);
		expect(bmpfont.missingGlyph).toBeNull();
	});
	it("初期化 - fontSize = 0", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph: GlyphArea = { x: 2, y: 3 };

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 0,
			textAlign: 0,
			maxWidth: 100
		});
		expect(label.textAlign).toBe(0);
		expect(label.widthAutoAdjust).toBe(true);
		expect(label.width).toBe(0);
		expect(label.height).toBe(0);
	});

	it("初期化 - default fontSize is same as font.size", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph: GlyphArea = { x: 2, y: 3 };

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont
		});
		expect(label.fontSize).toBe(bmpfont.size);
	});

	it("glyphForCharacter", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };
		// @ts-ignore
		const missingGlyph: GlyphArea = null;

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		expect(bmpfont.glyphForCharacter(37564)!.code).toBe(37564);
		expect(bmpfont.glyphForCharacter(-1)).toBeNull();
	});

	it("glyphForCharacter - handle unmapped glyph", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { "37564": { x: 0, y: 1 } };

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 10,
			textAlign: "center",
			maxWidth: 100,
			widthAutoAdjust: false,
			width: 50,
			height: 20,
			textColor: "white"
		});
		bmpfont.glyphForCharacter = () => {
			return null;
		}; // g.Font からグリフ情報を得られない状態を模倣する
		label.text = "咫";
		expect(() => {
			label.invalidate();
		}).not.toThrow();
	});
	it("aligning", () => {
		const runtime = skeletonRuntime();
		const width = 32;
		const height = 64;
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		const map = { 97: { x: 0, y: 1 } }; // "a".charCodeAt(0) === 97
		const missingGlyph: GlyphArea = null!;

		const bmpfont = new BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 10,
			textAlign: "center",
			maxWidth: 100,
			widthAutoAdjust: false,
			width: 50,
			height: 20
		});
		label.aligning(100, "center");
		expect(label.width).toBe(100);
		expect(label.widthAutoAdjust).toBe(false);
		expect(label.textAlign).toBe("center");
	});
	it("キャッシュのテスト", () => {
		const runtime = skeletonRuntime();
		const r = new Renderer();
		const width = 512;
		const height = 350;
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph: GlyphArea = { x: 2, y: 3 };
		const bmpfont = new BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: 35,
			defaultGlyphHeight: 50,
			missingGlyph: missingGlyph
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 10
		});
		label.render(r);
		label.fontSize = 0;
		label.height = 0;
		label.width = 0;
		label.invalidate();
		label.render(r);
		const count = (label._renderer as Renderer).methodCallHistory.filter(elem => elem === "drawImage").length;
		const bmpfont2 = new BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: 0,
			defaultGlyphHeight: 0,
			missingGlyph: missingGlyph
		});
		const label2 = new Label({
			scene: runtime.scene,
			text: "b",
			font: bmpfont2,
			fontSize: 10
		});
		label2.render(r);
		label2.fontSize = 20;
		label2.invalidate();
		label2.render(r);
		const count2 = (label2._renderer as Renderer).methodCallHistory.filter(elem => elem === "drawImage").length;
		const label3 = new Label({
			scene: runtime.scene,
			text: "c",
			font: bmpfont,
			fontSize: 10
		});
		label3.render(r);
		label3.text = "";
		label3.invalidate();
		label3.render(r);
		const count3 = (label3._renderer as Renderer).methodCallHistory.filter(elem => elem === "drawImage").length;
		expect(count).toBe(1);
		expect(count2).toBe(0);
		expect(count3).toBe(1);
	});
	it("renderCache - textColor", () => {
		const runtime = skeletonRuntime();
		const r = new Renderer();
		const width = 512;
		const height = 350;
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph: GlyphArea = { x: 2, y: 3 };
		const bmpfont = new BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		const label = new Label({
			scene: runtime.scene,
			text: "a",
			font: bmpfont,
			fontSize: 10,
			textColor: "blue"
		});
		label.render(r);

		const cr = (label._cache as Surface).createdRenderer as Renderer;

		expect(cr.methodCallParamsHistory("setCompositeOperation").length).toBe(1);
		expect(cr.methodCallParamsHistory("setCompositeOperation")[0]).toEqual({
			operation: "source-atop"
		});

		expect(cr.methodCallParamsHistory("fillRect").length).toBe(1);
		expect(cr.methodCallParamsHistory("fillRect")[0]).toEqual({
			x: 0,
			y: 0,
			width: label.width,
			height: label.height,
			cssColor: "blue"
		});
	});
});
