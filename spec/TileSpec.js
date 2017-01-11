describe("test Tile", function() {

	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	var updated = false;

	beforeAll(function() {
		var superMethod = g.Tile.prototype._onUpdate;
		g.Tile.prototype._onUpdate = function() {
			superMethod.call(this);
			updated = true;
		}
	});

	beforeEach(function() {
		updated = false;
	});

	afterEach(function() {
	});

	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var surface = new g.Surface(480, 480);
		var tileData = [[0]];
		var tile = new g.Tile(runtime.scene, surface, 32, 48, tileData);
		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);
		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - 動画サーフェス", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var surface = new mock.Surface(480, 480, {}, true);
		var tileData = [[0]];
		var tile = new g.Tile(runtime.scene, surface, 32, 48, tileData);

		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);
		expect(tile._beforeTileChips).toEqual(tile.tileChips);

		tile.update.fire();
		expect(updated).toBe(false);
		surface.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(true);
		updated = false;
		surface.animatingStopped.fire();
		tile.update.fire();
		expect(updated).toBe(false);

		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - 動画サーフェス(再生中)", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var surface = new mock.Surface(480, 480, {isPlaying: true}, true);
		var tileData = [[0]];
		var tile = new g.Tile(runtime.scene, surface, 32, 48, tileData);

		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);
		expect(tile._beforeTileChips).toEqual(tile.tileChips);

		tile.update.fire();
		expect(updated).toBe(true);

		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - ParameterObject", function() {
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var tileData = [[0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});
		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);
	});

	it("初期化 - ParameterObject, 動画サーフェス", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480, {}, true);
		expect(surface.isPlaying()).toBe(false);
		var tileData = [[0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});
		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);

		tile.update.fire();
		expect(updated).toBe(false);
		surface.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(true);
		updated = false;
		surface.animatingStopped.fire();
		tile.update.fire();
		expect(updated).toBe(false);
	});

	it("初期化 - ParameterObject, 動画サーフェス(再生中)", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480, {isPlaying: true}, true);
		expect(surface.isPlaying()).toBe(true);
		var tileData = [[0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});
		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);

		tile.update.fire();
		expect(updated).toBe(true);
	});

	it("停止中の動画サーフェスへの切り替え", function() {
		var runtime = skeletonRuntime();
		var surface1 = new mock.Surface(480, 480, {isPlaying: false}, true);
		var surface2 = new mock.Surface(480, 480, {isPlaying: false}, true);
		var tileData = [[0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface1,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});

		surface1.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(true);

		tile.tileChips = surface2;
		tile.invalidate();
		updated = false;

		surface1.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(false);

		surface2.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(true);
	});

	it("再生中の動画サーフェスへの切り替え", function() {
		var runtime = skeletonRuntime();
		var surface1 = new mock.Surface(480, 480, {isPlaying: false}, true);
		var surface2 = new mock.Surface(480, 480, {isPlaying: true}, true);
		var tileData = [[0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface1,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});

		surface1.animatingStarted.fire();
		tile.update.fire();
		expect(updated).toBe(true);

		tile.tileChips = surface2;
		tile.invalidate();
		updated = false;

		tile.update.fire();
		expect(updated).toBe(true);
	});

	it("render", function(){
		jasmine.addMatchers(require("./helpers/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData
		});
		var r = new mock.Renderer();

		tile.tiledata = tileData;
		tile.invalidate();
		tile.render(r);
		expect(
			tile._renderer.methodCallHistory.filter(function(elem) {return elem === "drawImage";}).length
		).toBe(6);
		tile._renderer.clearMethodCallHistory();

		tile.tileData = null;
		tile.invalidate();
		expect(function(){ tile.render(r); }).toThrowError("AssertionError");
	});

	it("render validation", function(){
		jasmine.addMatchers(require("./helpers/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 0,
			tileHeight: 0,
			tileData: tileData
		});
		var r = new mock.Renderer();

		//tile.tileData = tileData;
		tile.invalidate();
		tile.render(r);
		expect(
			tile._renderer.methodCallParamsHistory("drawImage").length
		).toBe(0);
		var count = 0;
		for (var y = 0; y < tile.tileData.length; y++) {
			var row = tile.tileData[y];
			for (var x = 0; x < row.length; x++) {
				var t = row[x];
				if (t < 0) {
					count += 1;
				}
			}
		}
		expect(count).toBe(0);
	});

	it("_tilesInRow更新", function() {
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new g.Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData
		});
		tile.tileWidth = 16;
		tile.invalidate();
		expect(tile._tilesInRow).toBe(30);
		var surface2 = new g.Surface(320, 320);
		tile.tileChips = surface2;
		tile.invalidate();
		expect(tile._tilesInRow).toBe(20);
	});
});
