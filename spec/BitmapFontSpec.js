describe("test BitmapFont", function() {
	var g = require('../lib/main.node.js');
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化 - Glyph", function() {
		var code = 300;
		var x = 2;
		var y = 2;
		var width = 10;
		var height = 12;
		var glyph = new g.Glyph(code, x, y, width, height);
		expect(glyph.code).toBe(code);
		expect(glyph.x).toBe(x);
		expect(glyph.y).toBe(y);
		expect(glyph.width).toBe(width);
		expect(glyph.height).toBe(height);
	});

	it("Glyph#renderingWidth", function() {
		var code = 300;
		var x = 2;
		var y = 2;
		var width = 10;
		var height = 12;
		var glyph = new g.Glyph(code, x, y, width, height);

		glyph.width = 0;
		expect(glyph.renderingWidth(24)).toBe(0);
		glyph.width = 10;
		glyph.height = 0;
		expect(glyph.renderingWidth(24)).toBe(0);
	});

	it("初期化 - BitmapFont", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var surface = new g.Surface(480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpFont = new g.BitmapFont({
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

	it("初期化 - BitmapFont given Asset", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		var asset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpFont = new g.BitmapFont({
			src: asset,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		var assetToSurface = g.Util.asSurface(asset);
		expect(bmpFont.surface).toEqual(assetToSurface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - ParamterObject", function() {
		var surface = new g.Surface(480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpFont = new g.BitmapFont({
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

	it("初期化 - ParamterObject given Asset", function() {
		var runtime = skeletonRuntime();
		var asset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpFont = new g.BitmapFont({
			src: asset,
			map: map,
			defaultGlyphWidth: 20,
			defaultGlyphHeight: 30,
			missingGlyph: missingGlyph
		});
		var assetToSurface = g.Util.asSurface(asset);
		expect(bmpFont.surface).toEqual(assetToSurface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - ParamterObject given glyphData", function() {
		var surface = new g.Surface(480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var glyphInfo = {
			map: map,
			width: 20,
			height: 30,
			missingGlyph: missingGlyph
		};

		var bmpFont = new g.BitmapFont({
			src: surface,
			glyphInfo: glyphInfo
		});
		expect(bmpFont.surface).toEqual(surface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});

	it("初期化 - ParamterObject given glyphData(TextAsset)", function() {
		var surface = new g.Surface(480, 480);
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var mockTextAsset = new g.TextAsset("mockId", "mockPath");
		mockTextAsset.data = JSON.stringify({
			"map": map,
			"width": 20,
			"height": 30,
			"missingGlyph": missingGlyph
		});

		var bmpFont = new g.BitmapFont({
			src: surface,
			glyphInfo: mockTextAsset
		});
		expect(bmpFont.surface).toEqual(surface);
		expect(bmpFont.map).toEqual(map);
		expect(bmpFont.missingGlyph).toEqual(missingGlyph);
		expect(bmpFont.defaultGlyphWidth).toEqual(20);
		expect(bmpFont.defaultGlyphHeight).toEqual(30);
	});
});
