describe("test FrameSprite", function() {
	var g = require('../lib/main.node.js');
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});
	it("初期化", function() {
		var runtime = skeletonRuntime();
		var surface = new g.Surface(480, 480);
		var frameSprite = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			frameNumber: 1,
			frames: [1, 3, 4],
			interval: 15,
		});
		expect(frameSprite.width).toBe(32);
		expect(frameSprite.height).toBe(48);
		expect(frameSprite.srcWidth).toBe(32);
		expect(frameSprite.srcHeight).toBe(48);
		expect(frameSprite.frameNumber).toBe(1);
		expect(frameSprite.frames).toEqual([1, 3, 4]);
		expect(frameSprite.interval).toBe(15);
	});

	it("start", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sp = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});

		sp.frames = [3, 4, 5, 6];
		sp.frameNumber = 1;
		sp.start();

		expect(sp._lastUsedIndex).toBe(0);
		expect(sp.frameNumber).toBe(1);
		sp.modified();
		expect(sp._lastUsedIndex).toBe(4);
		runtime.game.tick();
		expect(sp.frameNumber).toBe(2);
		expect(sp._lastUsedIndex).toBe(5);
		runtime.game.tick();
		expect(sp.frameNumber).toBe(3);
		expect(sp._lastUsedIndex).toBe(6);
		expect(sp._timer).toBeDefined();
	});

	it("stop", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sp = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});

		sp.frames = [3, 4, 5, 6];
		sp.frameNumber = 1;
		sp.start();

		sp.stop();
		expect(sp._timer).toBeUndefined();
	});

	it("destroy", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sp = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});

		sp.frames = [3, 4, 5, 6];
		sp.frameNumber = 1;
		sp.start();

		sp.destroy();
		expect(sp.scene).toBeUndefined();
	});

	it("frame/frameNumber", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sp = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});

		sp.frames = [3, 4, 5, 6];
		sp.frameNumber = 1;
		sp.start();
		sp.modified();
		runtime.game.tick();
		runtime.game.tick();

		expect(sp.frameNumber).toBe(3);
		expect(sp._lastUsedIndex).toBe(6);

		// frames, frameNumber を同時に変更
		sp.frames = [7, 8];
		sp.frameNumber = 0;
		sp.modified();

		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		runtime.game.tick();
		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(8);
		runtime.game.tick();
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		// frameNumber のみ変更
		sp.frameNumber = 1;
		sp.modified();

		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(8);

		runtime.game.tick();
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		// frames のみ変更
		sp.frames = [10, 11, 12];
		sp.modified();

		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(10);

		runtime.game.tick();
		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(11);

		runtime.game.tick();
		expect(sp.frameNumber).toBe(2);
		expect(sp._lastUsedIndex).toBe(12);

		runtime.game.tick();
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(10);
	});

	it("_free", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sp = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		expect(sp._free()).toBeFalsy();
		expect(sp._timer).toBeUndefined();
		sp.start();
		expect(sp._timer).toBeDefined();
		sp._free();
		expect(sp._timer).toBeUndefined();
	});

	it("createBySprite", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sprite = new g.Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		var frame = g.FrameSprite.createBySprite(sprite);

		expect(frame.srcWidth).toBe(32);
		expect(frame.srcHeight).toBe(48);
	});

	it("cutout", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sprite = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			cutoutX: 160,
			cutoutY: 144,
			cutoutWidth: 165,
			frames: [0, 1, 4, 5, 6]
		});
		expect(sprite.frameNumber).toBe(0);
		expect(sprite.srcX).toBe(160);
		expect(sprite.srcY).toBe(144);
		expect(sprite._lastUsedIndex).toBe(0);

		sprite.start();
		runtime.game.tick();
		expect(sprite.frameNumber).toBe(1);
		expect(sprite.srcX).toBe(192);
		expect(sprite.srcY).toBe(144);
		expect(sprite._lastUsedIndex).toBe(1);

		runtime.game.tick();
		expect(sprite.frameNumber).toBe(2);
		expect(sprite.srcX).toBe(288);
		expect(sprite.srcY).toBe(144);
		expect(sprite._lastUsedIndex).toBe(4);

		runtime.game.tick();
		expect(sprite.frameNumber).toBe(3);
		expect(sprite.srcX).toBe(160);
		expect(sprite.srcY).toBe(192);
		expect(sprite._lastUsedIndex).toBe(5);

		runtime.game.tick();
		expect(sprite.frameNumber).toBe(4);
		expect(sprite.srcX).toBe(192);
		expect(sprite.srcY).toBe(192);
		expect(sprite._lastUsedIndex).toBe(6);
	});

	it("reflect change of cutout offset", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		var surface = new g.Surface(480, 480);
		var sprite = new g.FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			cutoutX: 160,
			cutoutY: 144,
			cutoutWidth: 160,
			frames: [0, 5],
			frameNumber: 1
		});
		expect(sprite.frameNumber).toBe(1);
		expect(sprite.srcX).toBe(160);
		expect(sprite.srcY).toBe(192);
		expect(sprite._lastUsedIndex).toBe(5);

		sprite.cutoutX = 320;
		sprite.cutoutY = 240;
		sprite.cutoutWidth = 64;
		sprite.frameNumber = 0;
		sprite.modified();
		expect(sprite.frameNumber).toBe(0);
		expect(sprite.srcX).toBe(320);
		expect(sprite.srcY).toBe(240);
		expect(sprite._lastUsedIndex).toBe(0);

		sprite.start();
		runtime.game.tick();
		expect(sprite.frameNumber).toBe(1);
		expect(sprite.srcX).toBe(352);
		expect(sprite.srcY).toBe(336);
		expect(sprite._lastUsedIndex).toBe(5);
	});
});

