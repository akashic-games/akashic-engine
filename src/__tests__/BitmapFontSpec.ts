import { Glyph, BitmapFont, SurfaceUtil } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test BitmapFont", () => {
	it("初期化 - Glyph", () => {
		const code = 300;
		const x = 2;
		const y = 2;
		const width = 10;
		const height = 12;
		const glyph = new Glyph(code, x, y, width, height);
		expect(glyph.code).toBe(code);
		expect(glyph.x).toBe(x);
		expect(glyph.y).toBe(y);
		expect(glyph.width).toBe(width);
		expect(glyph.height).toBe(height);
	});

	it("Glyph#renderingWidth", () => {
		const code = 300;
		const x = 2;
		const y = 2;
		const width = 10;
		const height = 12;
		const glyph = new Glyph(code, x, y, width, height);

		glyph.width = 0;
		expect(glyph.renderingWidth(24)).toBe(0);
		glyph.width = 10;
		glyph.height = 0;
		expect(glyph.renderingWidth(24)).toBe(0);
	});

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
});
