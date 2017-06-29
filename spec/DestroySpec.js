describe("test Destroy", function() {
	var g = require('../lib/main.node.js');
	var skeletonRuntime = require("./helpers/skeleton");
	var runtime;
	var bmpfont;
	var mock = require("./helpers/mock");
	var imageAsset;

	function createEntities(scene) {
		var entities = [
			new g.E({scene: scene, width: 16, heigth: 16}),
			new g.Sprite({scene: scene, src: new g.Surface(480, 480), width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.FrameSprite({scene: scene, src: new g.Surface(480, 480), width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.Tile({scene: scene, src: new g.Surface(480, 480), tileWidth: 32, tileHeight: 32, tileData: [[0]]}),
			new g.Label({scene: scene, text: " ", font: bmpfont, fontSize: 13}),
			new g.MultiLineLabel({scene: scene, text: " \n \n \n  ", bitmapFont: bmpfont, fontSize: 13, width: 64}),
			new g.Pane({scene: scene, width: 480, height: 48, backgroundImage: imageAsset, backgroundEffector: new g.NinePatchSurfaceEffector(runtime.game)}),
			new g.FilledRect({scene: scene, cssColor: "red", width: 32, height: 32}),
			new g.SystemLabel({scene: scene, fontSize: 13, text: " ", textColor: "red"})
		];
		entities.push(g.Util.createSpriteFromScene(scene, scene));
		entities.push(g.Util.createSpriteFromE(scene, entities[0]));
		return entities;
	}

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		runtime = skeletonRuntime();
		var map = {"32": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		bmpfont = new g.BitmapFont({
			src: new g.Surface(480, 480),
			map: map,
			defaultGlyphWidth: 12,
			defaultGlyphHeight: 12,
			missingGlyph: missingGlyph
		});
		imageAsset = runtime.game.resourceFactory.createImageAsset(null, null, 200, 200);
	});

	afterEach(function() {
	});

	it("auto destroy", function() {
		var scene = runtime.scene;
		var entities = createEntities(scene);
		var r = new mock.Renderer();
		entities.forEach(function(e) {
			if (e.invalidate) 
				e.invalidate();
			else
				e.modified();
			scene.append(e);
		});
		entities.forEach(function(e) {
			e.render(r);
		});

		// 参照保持処理
		// Sprite
		entities[1].__surface = entities[1].surface;
		// FrameSprite
		entities[2].__surface = entities[2].surface;
		// Tile
		entities[3].__tileChips = entities[3].tileChips;
		// Label
		entities[4].__cache = entities[4]._cache;
		// MultiLineLabel
		entities[5].__cache = entities[5]._cache;
		entities[5].__lines = entities[5]._lines;
		// Pane
		entities[6].__cache = entities[6]._cache;
		entities[6].__bgSurface = entities[6]._bgSurface;
		entities[6].__childrenSurface = entities[6]._childrenSurface;

		scene.destroy();
		entities.forEach(function(e) {
			expect(e.destroyed()).toBe(true);
		});
		// Sprite
		expect(entities[1].surface).toBeUndefined();
		expect(entities[1].__surface.destroyed()).toBe(false);
		entities[1].__surface.destroy();
		expect(entities[1].__surface.destroyed()).toBe(true);
		// FrameSprite
		expect(entities[2].surface).toBeUndefined();
		expect(entities[2].__surface.destroyed()).toBe(false);
		entities[2].__surface.destroy();
		expect(entities[2].__surface.destroyed()).toBe(true);
		// Tile
		expect(entities[3].tileChips).toBeUndefined();
		expect(entities[3].__tileChips.destroyed()).toBe(false);
		entities[3].__tileChips.destroy();
		expect(entities[3].__tileChips.destroyed()).toBe(true);
		// Label
		expect(entities[4]._cache).toBeUndefined();
		expect(entities[4].__cache.destroyed()).toBe(true);
		// MultiLineLabel
		expect(entities[5]._cache).toBeUndefined();
		expect(entities[5].__cache.destroyed()).toBe(true);
		expect(entities[5]._lines).toBeUndefined();
		entities[5].__lines.forEach(function(l) {
			expect(l.surface.destroyed()).toBe(true);
		});
		// Pane
		expect(entities[6]._cache).toBeUndefined();
		expect(entities[6].__cache.destroyed()).toBe(true);
		expect(entities[6]._bgSurface).toBeUndefined();
		expect(entities[6].__bgSurface.destroyed()).toBe(true);
		expect(entities[6]._childrenSurface).toBeUndefined();
		expect(entities[6].__childrenSurface.destroyed()).toBe(true);
		// BitmapFontは自動破棄されない
		expect(bmpfont.destroyed()).toBe(false);
		bmpfont.destroy();
		expect(bmpfont.destroyed()).toBe(true);

		expect(scene.destroyed()).toBe(true);
	});

	it("destroy surface", function() {
		var scene = runtime.scene;
		var entities = createEntities(scene);
		var r = new mock.Renderer();
		entities.forEach(function(e) {
			if (e.invalidate) 
				e.invalidate();
			else
				e.modified();
			scene.append(e);
		});
		entities.forEach(function(e) {
			e.render(r);
		});

		function destroyAndCheckProp(e, propName) {
			var tmp = e[propName];
			expect(e[propName].destroyed()).toBe(false);
			e.destroy(true);
			expect(e[propName]).toBeUndefined();
			expect(tmp.destroyed()).toBe(true);
		}
		destroyAndCheckProp(entities[1], "surface");	// Sprite
		destroyAndCheckProp(entities[2], "surface");	// FrameSprite
		destroyAndCheckProp(entities[3], "tileChips");	// Tile
	});

	it("Sprite1つの破棄で複数Spriteが破壊される", function() {
		var scene = runtime.scene;
		var surface = new g.Surface(480, 480);
		var entities = [
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48})
		];
		var r = new mock.Renderer();
		entities.forEach(function(e) {
			scene.append(e);
			e.modified();
		});
		entities.forEach(function(e) {
			e.render(r);
		});
		entities[0].destroy(true);
		entities.forEach(function(e) {
			// entities[1]と[2]のSpriteは壊れているが、destroy扱いにはならない
			expect(e.destroyed()).toBe(e === entities[0]);
			// surfaceのみ破壊されている。（本来あってはいけない状態）
			if (e === entities[0]) {
				expect(e.surface).toBeUndefined();
			} else {
				expect(e.surface.destroyed()).toBe(true);
			}
		});
	});

	it("Scene#destroyでもSurfaceは暗黙破棄されず、明示的に破棄する必要がある", function() {
		var scene = runtime.scene;
		var surface = new g.Surface(480, 480);
		var entities = [
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48}),
			new g.Sprite({scene: scene, src: surface, width: 32, height: 48, srcWidth: 32, srcHeight: 48})
		];
		var r = new mock.Renderer();
		entities.forEach(function(e) {
			scene.append(e);
		});
		entities.forEach(function(e) {
			e.render(r);
		});
		scene.destroy();
		entities.forEach(function(e) {
			expect(e.destroyed()).toBe(true);
			expect(e.surface).toBeUndefined();
		});
		expect(surface.destroyed()).toBe(false);
		surface.destroy();
		expect(surface.destroyed()).toBe(true);
		expect(scene.destroyed()).toBe(true);
	});
});
