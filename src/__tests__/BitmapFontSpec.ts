import { BitmapFont, SurfaceUtil } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test BitmapFont", () => {
	it("初期化 - BitmapFont", () => {
		// deprecatedなコンストラクタの動作確認を行う
		const surface = new Surface(480, 480);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		const bmpFont = new BitmapFont({
			src: surface,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		expect(bmpFont.surface).toEqual(surface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - BitmapFont given Asset", () => {
		// deprecatedなコンストラクタの動作確認を行う
		const runtime = skeletonRuntime();
		const asset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		const bmpFont = new BitmapFont({
			src: asset,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		const assetToSurface = SurfaceUtil.asSurface(asset);
		expect(bmpFont.surface).toEqual(assetToSurface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - ParamterObject", () => {
		const surface = new Surface(480, 480);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		const bmpFont = new BitmapFont({
			src: surface,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		expect(bmpFont.surface).toEqual(surface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - ParamterObject given Asset", () => {
		const runtime = skeletonRuntime();
		const asset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		const map = { "37564": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		const bmpFont = new BitmapFont({
			src: asset,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		const assetToSurface = SurfaceUtil.asSurface(asset);
		expect(bmpFont.surface).toEqual(assetToSurface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("can create Glyph by glyphForCharacter", () => {
		const surface = new Surface(480, 480);
		const map = { "11": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		const bmpFont = new BitmapFont({
			src: surface,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		const glyph = bmpFont.glyphForCharacter(11);
		expect(glyph.code).toBe(11);
		expect(glyph.x).toBe(0);
		expect(glyph.y).toBe(1);
		expect(glyph.width).toBe(20);
		expect(glyph.height).toBe(30);
	});
});
