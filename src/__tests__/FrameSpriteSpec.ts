import { FrameSprite, Sprite } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test FrameSprite", () => {
	it("初期化", () => {
		const runtime = skeletonRuntime();
		const surface = new Surface(480, 480);
		const frameSprite = new FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			frameNumber: 1,
			frames: [1, 3, 4],
			interval: 15
		});
		expect(frameSprite.width).toBe(32);
		expect(frameSprite.height).toBe(48);
		expect(frameSprite.srcWidth).toBe(32);
		expect(frameSprite.srcHeight).toBe(48);
		expect(frameSprite.frameNumber).toBe(1);
		expect(frameSprite.frames).toEqual([1, 3, 4]);
		expect(frameSprite.interval).toBe(15);
	});

	it("start", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sp = new FrameSprite({
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
		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(2);
		expect(sp._lastUsedIndex).toBe(5);
		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(3);
		expect(sp._lastUsedIndex).toBe(6);
		expect(sp._timer).toBeDefined();
	});

	it("stop", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sp = new FrameSprite({
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

	it("destroy", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sp = new FrameSprite({
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

	it("frame/frameNumber", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sp = new FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});

		sp.frames = [3, 4, 5, 6];
		sp.frameNumber = 1;
		sp.start();
		sp.modified();
		runtime.game.tick(true);
		runtime.game.tick(true);

		expect(sp.frameNumber).toBe(3);
		expect(sp._lastUsedIndex).toBe(6);

		// frames, frameNumber を同時に変更
		sp.frames = [7, 8];
		sp.frameNumber = 0;
		sp.modified();

		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(8);
		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		// frameNumber のみ変更
		sp.frameNumber = 1;
		sp.modified();

		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(8);

		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(7);

		// frames のみ変更
		sp.frames = [10, 11, 12];
		sp.modified();

		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(10);

		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(1);
		expect(sp._lastUsedIndex).toBe(11);

		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(2);
		expect(sp._lastUsedIndex).toBe(12);

		runtime.game.tick(true);
		expect(sp.frameNumber).toBe(0);
		expect(sp._lastUsedIndex).toBe(10);
	});

	it("_free", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sp = new FrameSprite({
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

	it("createBySprite", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sprite = new Sprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		const frame = FrameSprite.createBySprite(sprite);

		expect(frame.srcWidth).toBe(32);
		expect(frame.srcHeight).toBe(48);
	});

	it("loop", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sprite = new FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			frames: [10, 11, 12],
			loop: true
		});
		let isFired = false;
		sprite.finished.add(() => {
			isFired = true;
		});
		sprite.start();
		expect(sprite.frameNumber).toBe(0);
		expect(sprite._lastUsedIndex).toBe(10);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(1);
		expect(sprite._lastUsedIndex).toBe(11);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(2);
		expect(sprite._lastUsedIndex).toBe(12);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(0);
		expect(sprite._lastUsedIndex).toBe(10);
		expect(isFired).toBe(false);
	});

	it("not loop", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 30 });
		const surface = new Surface(480, 480);
		const sprite = new FrameSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			frames: [10, 11, 12],
			loop: false
		});
		let isFired = false;
		sprite.finished.add(() => {
			isFired = true;
		});
		sprite.start();
		expect(sprite.frameNumber).toBe(0);
		expect(sprite._lastUsedIndex).toBe(10);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(1);
		expect(sprite._lastUsedIndex).toBe(11);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(2);
		expect(sprite._lastUsedIndex).toBe(12);
		expect(isFired).toBe(false);

		runtime.game.tick(true);
		expect(sprite.frameNumber).toBe(2);
		expect(sprite._lastUsedIndex).toBe(12);
		expect(isFired).toBe(true);
	});
});
