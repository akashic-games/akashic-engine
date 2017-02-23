describe("test Label", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");
	beforeEach(function() {
	});
	afterEach(function() {
	});
	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var bmpfont = new g.BitmapFont({
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
		expect(bmpfont.missingGlyph).toEqual(missingGlyph);

		var label = new g.Label(runtime.scene, "a", bmpfont, 10);
		expect(label.scene).toBe(runtime.scene);
		expect(label.text).toEqual("a");
		expect(label.bitmapFont).toBe(bmpfont);
		expect(label.fontSize).toBe(10);
		expect(label.textColor).toBeUndefined();
		runtime.game.suppressedLogLevel = undefined;
	});
	it("初期化 - ParameterObject", function() {
		var runtime = skeletonRuntime();
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpfont = new g.BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});

		var label = new g.Label({
			scene: runtime.scene,
			text: "a",
			bitmapFont: bmpfont,
			fontSize: 10,
			textAlign: g.TextAlign.Center,
			maxWidth: 100,
			widthAutoAdjust: false,
			width: 50,
			height: 20,
			textColor: "white"
		});
		expect(label.scene).toBe(runtime.scene);
		expect(label.text).toEqual("a");
		expect(label.bitmapFont).toBe(bmpfont);
		expect(label.fontSize).toBe(10);
		expect(label.textAlign).toBe(g.TextAlign.Center);
		expect(label.maxWidth).toBe(100);
		expect(label.widthAutoAdjust).toBe(false);
		expect(label.width).toBe(50);
		expect(label.height).toBe(10); // height 指定は無視されて fontSize で上書きされる
		expect(label.textColor).toBe("white");
	});
	it("初期化 - missMissingGlyph", function() {
		var runtime = skeletonRuntime();
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = null;

		var bmpfont = new g.BitmapFont({
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
	it("初期化 - fontSize = 0", function() {
		var runtime = skeletonRuntime();
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var bmpfont = new g.BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		var label = new g.Label({
			scene: runtime.scene,
			text: "a",
			bitmapFont: bmpfont,
			fontSize: 0,
			textAlign: 0,
			maxWidth: 100
		});
		expect(label.textAlign).toBe(0);
		expect(label.widthAutoAdjust).toBe(true);
		expect(label.width).toBe(0);
		expect(label.height).toBe(0);
	});
	it("glyphForCharacter", function() {
		var runtime = skeletonRuntime();
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = null;

		var bmpfont = new g.BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		expect(bmpfont.glyphForCharacter(37564).code).toBe(37564);
		expect(bmpfont.glyphForCharacter(-1)).toBeNull();
	});
	it("aligning", function() {
		var runtime = skeletonRuntime();
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height);
		var width = 32;
		var height = 64;
		var map = {97: {"x": 0, "y": 1}}; // "a".charCodeAt(0) === 97
		var missingGlyph = null;

		var bmpfont = new g.BitmapFont({
			src: imageAsset,
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		var label = new g.Label({
			scene: runtime.scene,
			text: "a",
			bitmapFont: bmpfont,
			fontSize: 10,
			textAlign: g.TextAlign.Center,
			maxWidth: 100,
			widthAutoAdjust: false,
			width: 50,
			height: 20,
		});
		label.aligning(100, g.TextAlign.Center);
		expect(label.width).toBe(100);
		expect(label.widthAutoAdjust).toBe(false);
		expect(label.textAlign).toBe(g.TextAlign.Center);
	});
	it("キャッシュのテスト", function(){
		var runtime = skeletonRuntime();
		var r = new mock.Renderer();
		var width = 512;
		var height = 350;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpfont = new g.BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: 35,
			defaultGlyphHeight: 50,
			missingGlyph: missingGlyph
		});
		var label = new g.Label({
			scene: runtime.scene,
			text: "a",
			bitmapFont: bmpfont,
			fontSize: 10,
		});
		label.render(r);
		label.fontSize = 0;
		label.height = 0;
		label.width = 0;
		label.invalidate();
		label.render(r);
		var count = label._renderer.methodCallHistory.filter(function(elem) {return elem === "drawImage";}).length;
		var bmpfont2 = new g.BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: 0,
			defaultGlyphHeight: 0,
			missingGlyph: missingGlyph
		});
		var label2 = new g.Label({
			scene: runtime.scene,
			text: "b",
			bitmapFont: bmpfont2,
			fontSize: 10,
		});
		label2.render(r);
		label2.fontSize = 20;
		label2.invalidate();
		label2.render(r);
		var count2 = label2._renderer.methodCallHistory.filter(function(elem) {return elem === "drawImage";}).length;
		var label3 = new g.Label({
			scene: runtime.scene,
			text: "c",
			bitmapFont: bmpfont,
			fontSize: 10,
		});
		label3.render(r);
		label3.text = "";
		label3.invalidate();
		label3.render(r);
		var count3 = label3._renderer.methodCallHistory.filter(function(elem) {return elem === "drawImage";}).length;
		expect(count).toBe(1);
		expect(count2).toBe(0);
		expect(count3).toBe(1);
	});
	it("renderCache - textColor", function(){
		var runtime = skeletonRuntime();
		var r = new mock.Renderer();
		var width = 512;
		var height = 350;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		var bmpfont = new g.BitmapFont({
			src: runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", width, height),
			map: map,
			defaultGlyphWidth: width,
			defaultGlyphHeight: height,
			missingGlyph: missingGlyph
		});
		var label = new g.Label({scene: runtime.scene, text: "a", bitmapFont: bmpfont, fontSize: 10, textColor: "blue"});
		label.render(r);

		var cr = label._cache.createdRenderer;

		expect(cr.methodCallParamsHistory("setCompositeOperation").length).toBe(1);
		expect(cr.methodCallParamsHistory("setCompositeOperation")[0])
			.toEqual({operation: g.CompositeOperation.SourceAtop});

		expect(cr.methodCallParamsHistory("fillRect").length).toBe(1);
		expect(cr.methodCallParamsHistory("fillRect")[0])
			.toEqual({x: 0, y:0, width: label.width, height: label.height, cssColor: "blue"});
	});
});
