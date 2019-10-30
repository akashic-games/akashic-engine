import { Sprite } from "..";
import { Renderer, skeletonRuntime, Surface } from "./helpers";

describe("test Sprite", () => {
	let updated = false;

	class MonitorSprite extends Sprite {
		_onUpdate(): void {
			super._onUpdate();
			updated = true;
		}
	}

	beforeEach(() => {
		updated = false;
	});

	it("初期化", () => {
		const runtime = skeletonRuntime();
		const surface = new Surface(480, 480);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(32);
		expect(sprite.srcHeight).toEqual(48);
		expect(sprite.srcX).toEqual(0);
		expect(sprite.srcY).toEqual(0);
		expect(sprite.surface).toEqual(surface);
		expect(sprite._beforeSurface).toEqual(sprite.surface);

		sprite.invalidate();
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		sprite.srcWidth = 10;
		sprite.srcHeight = 10;
		sprite.invalidate();
		expect(sprite.srcWidth).toEqual(10);
		expect(sprite.srcHeight).toEqual(10);

		const surface2 = new Surface(16, 32);
		const sprite2 = new MonitorSprite({
			scene: runtime.scene,
			src: surface2
		});
		expect(sprite2.width).toEqual(16);
		expect(sprite2.height).toEqual(32);
		expect(sprite2.srcWidth).toEqual(16);
		expect(sprite2.srcHeight).toEqual(32);
		expect(sprite2.srcX).toEqual(0);
		expect(sprite2.srcY).toEqual(0);
		expect(sprite2.surface).toBe(surface2);
		expect(sprite2._beforeSurface).toEqual(sprite2.surface);
	});

	it("初期化 - 動画サーフェス", () => {
		const runtime = skeletonRuntime();

		const surface = new Surface(16, 32, {}, true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface
		});

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
	});

	it("初期化 - 動画サーフェス(再生中)", () => {
		const runtime = skeletonRuntime();

		const surface = new Surface(16, 32, { isPlaying: true }, true);
		expect(surface.isPlaying()).toBe(true);
		expect(surface.isDynamic).toBe(true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface
		});

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
	});

	it("初期化 - ParameterObject", () => {
		const runtime = skeletonRuntime();
		const surface = new Surface(480, 480);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2
		});
		expect(sprite.width).toEqual(32);
		expect(sprite.height).toEqual(48);
		expect(sprite.srcWidth).toEqual(16);
		expect(sprite.srcHeight).toEqual(24);
		expect(sprite.srcX).toEqual(1);
		expect(sprite.srcY).toEqual(2);
		expect(sprite.surface).toEqual(surface);

		const surface2 = new Surface(48, 128);
		const sprite2 = new MonitorSprite({
			scene: runtime.scene,
			src: surface2
		});
		expect(sprite2.width).toEqual(48);
		expect(sprite2.height).toEqual(128);
		expect(sprite2.srcWidth).toEqual(48);
		expect(sprite2.srcHeight).toEqual(128);
		expect(sprite2.srcX).toEqual(0);
		expect(sprite2.srcY).toEqual(0);
		expect(sprite2.surface).toBe(surface2);
	});

	it("初期化 - ParameterObject, 動画サーフェス", () => {
		const runtime = skeletonRuntime();
		const surface = new Surface(16, 32, {}, true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2
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

	it("初期化 - ParameterObject, 動画サーフェス(再生中)", () => {
		const runtime = skeletonRuntime();
		const surface = new Surface(16, 32, { isPlaying: true }, true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24,
			srcX: 1,
			srcY: 2
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

	it("キャッシュのテスト", () => {
		const runtime = skeletonRuntime();
		const r = new Renderer();
		const surface = new Surface(480, 480);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48
		});
		sprite.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "drawImage", "restore"]);
	});
	it("キャッシュのテスト - zero srcWidth/srcHeight", () => {
		const runtime = skeletonRuntime();
		const r = new Renderer();
		const surface = new Surface(480, 480);
		const sprite = new MonitorSprite({
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
			"translate" // このあとにdrawImageが呼ばれていないことを確認
		]);
	});
	it("キャッシュのテスト - matrix", () => {
		const runtime = skeletonRuntime();
		const r = new Renderer();
		const surface = new Surface(480, 480);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface,
			width: 32,
			height: 48,
			srcWidth: 16,
			srcHeight: 24
		});
		sprite.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "save", "transform", "drawImage", "restore", "restore"]);
	});

	it("停止中の動画サーフェスへの切り替え", () => {
		const runtime = skeletonRuntime();

		const surface1 = new Surface(16, 32, { isPlaying: false }, true);
		const surface2 = new Surface(16, 32, { isPlaying: false }, true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface1
		});

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

	});

	it("再生中の動画サーフェスへの切り替え", () => {
		const runtime = skeletonRuntime();

		const surface1 = new Surface(16, 32, { isPlaying: false }, true);
		const surface2 = new Surface(16, 32, { isPlaying: true }, true);
		const sprite = new MonitorSprite({
			scene: runtime.scene,
			src: surface1
		});

		surface1.animatingStarted.fire();
		sprite.update.fire();
		expect(updated).toBe(true);

		sprite.surface = surface2;
		sprite.invalidate();
		updated = false;

		sprite.update.fire();
		expect(updated).toBe(true);
	});
});
