describe("test Sprite", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	var updated = false;

	beforeAll(function() {
		var superMethod = g.Sprite.prototype._onUpdate;
		g.Sprite.prototype._onUpdate = function() {
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
		var sprite = new g.Sprite(runtime.scene, surface, 32, 48);
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(32);
		expect(sprite.srcHeight).toEqual(48);
		expect(sprite.srcX).toEqual(0);
		expect(sprite.srcY).toEqual(0);
		expect(sprite.surface).toEqual(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);
		expect(sprite.animatingStarted).toBeUndefined();
		expect(sprite.animatingStopped).toBeUndefined();

		sprite.invalidate();
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		sprite.srcWidth = 10;
		sprite.srcHeight = 10;
		sprite.invalidate();
		expect(sprite.srcWidth).toEqual(10);
		expect(sprite.srcHeight).toEqual(10);

		var surface2 = new g.Surface(16, 32);
		var sprite2 = new g.Sprite(runtime.scene, surface2);
		expect(sprite2.width).toEqual(16);
		expect(sprite2.height).toEqual(32);
		expect(sprite2.srcWidth).toEqual(16);
		expect(sprite2.srcHeight).toEqual(32);
		expect(sprite2.srcX).toEqual(0);
		expect(sprite2.srcY).toEqual(0);
		expect(sprite2.surface).toBe(surface2);
		expect(sprite2._beforeSurface).toEqual(sprite2.surface);
		expect(sprite2.animatingStarted).toBeUndefined();
		expect(sprite2.animatingStopped).toBeUndefined();
		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - 動画サーフェス", function() {
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;

		var surface = new mock.Surface(16, 32, {}, true);
		var sprite = new g.Sprite(runtime.scene, surface);

		expect(sprite.width).toEqual(16);
		expect(sprite.height).toEqual(32);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(32);
		expect(sprite.srcX).toEqual(0);
		expect(sprite.srcY).toEqual(0);
		expect(sprite.surface).toBe(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);

		sprite.update.fire();
		expect(updated).toBe(false);
		surface.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);
		updated = false;
		surface.animatingStopped.fire();
		sprite.update.fire();
		expect(updated).toBe(false);

		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - 動画サーフェス(再生中)", function() {
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;

		var surface = new mock.Surface(16, 32, {isPlaying: true}, true);
		expect(surface.isPlaying()).toBe(true);
		expect(surface.isDynamic).toBe(true);
		var sprite = new g.Sprite(runtime.scene, surface);

		expect(sprite.width).toEqual(16);
		expect(sprite.height).toEqual(32);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(32);
		expect(sprite.srcX).toEqual(0);
		expect(sprite.srcY).toEqual(0);
		expect(sprite.surface).toBe(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);

		sprite.update.fire();
		expect(updated).toBe(true);

		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - ParameterObject", function() {
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2,
		});
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(24);
		expect(sprite.srcX).toEqual(1);
		expect(sprite.srcY).toEqual(2);
		expect(sprite.surface).toEqual(surface);

		var surface2 = new g.Surface(48, 128);
		var sprite2 = new g.Sprite({
			scene: runtime.scene,
			src: surface2,
		});
		expect(sprite2.width).toEqual(48);
		expect(sprite2.height).toEqual(128);
		expect(sprite2.srcWidth).toEqual(48);
		expect(sprite2.srcHeight).toEqual(128);
		expect(sprite2.srcX).toEqual(0);
		expect(sprite2.srcY).toEqual(0);
		expect(sprite2.surface).toBe(surface2);
	});

	it("初期化 - ParameterObject, 動画サーフェス", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(16, 32, {}, true);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2,
		});

		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(24);
		expect(sprite.srcX).toEqual(1);
		expect(sprite.srcY).toEqual(2);
		expect(sprite.surface).toEqual(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);

		sprite.update.fire();
		expect(updated).toBe(false);
		surface.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);
		updated = false;
		surface.animatingStopped.fire();
		sprite.update.fire();
		expect(updated).toBe(false);
	});

	it("初期化 - ParameterObject, 動画サーフェス(再生中)", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(16, 32, {isPlaying: true}, true);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2,
		});

		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(24);
		expect(sprite.srcX).toEqual(1);
		expect(sprite.srcY).toEqual(2);
		expect(sprite.surface).toEqual(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);

		sprite.update.fire();
		expect(updated).toBe(true);
	});

	it("キャッシュのテスト", function() {
		var runtime = skeletonRuntime();
		var r = new mock.Renderer();
		var surface = new g.Surface(480, 480);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		sprite.render(r);
		expect(r.methodCallHistory).toEqual([
			"save",
			"translate",
			"drawImage",
			"restore"
		]);
	});
	it("キャッシュのテスト - zero srcWidth/srcHeight", function() {
		var runtime = skeletonRuntime();
		var r = new mock.Renderer();
		var surface = new g.Surface(480, 480);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		sprite.render(r);
		sprite.srcWidth = 0;
		sprite.srcHeight = 0;
		sprite.invalidate();
		sprite.render(r);
		expect(r.methodCallHistory).toEqual([
			"save",
			"translate",
			"drawImage",
			"restore",
			"translate",
			"translate", // このあとにdrawImageが呼ばれていないことを確認
		]);
	});
	it("キャッシュのテスト - matrix", function() {
		var runtime = skeletonRuntime();
		var r = new mock.Renderer();
		var surface = new g.Surface(480, 480);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24
		});
		sprite.render(r);
		expect(r.methodCallHistory).toEqual([
			"save",
			"translate",
			"save",
			"transform",
			"drawImage",
			"restore",
			"restore"
		]);
	});

	it("停止中の動画サーフェスへの切り替え", function() {
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;

		var surface1 = new mock.Surface(16, 32, {isPlaying: false}, true);
		var surface2 = new mock.Surface(16, 32, {isPlaying: false}, true);
		var sprite = new g.Sprite(runtime.scene, surface1);

		surface1.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);

		sprite.surface = surface2;
		sprite.invalidate();
		updated = false;

		surface1.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(false);

		surface2.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);

		runtime.game.suppressedLogLevel = undefined;
	});

	it("再生中の動画サーフェスへの切り替え", function() {
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;

		var surface1 = new mock.Surface(16, 32, {isPlaying: false}, true);
		var surface2 = new mock.Surface(16, 32, {isPlaying: true}, true);
		var sprite = new g.Sprite(runtime.scene, surface1);

		surface1.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);

		sprite.surface = surface2;
		sprite.invalidate();
		updated = false;

		sprite.update.fire();
		expect(updated).toBe(true);

		runtime.game.suppressedLogLevel = undefined;
	});
});
