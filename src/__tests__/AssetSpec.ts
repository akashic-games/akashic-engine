import { MusicAudioSystem, VideoSystem } from "..";
import { AudioAsset, Game, VideoAsset } from "./helpers";

describe("test Asset", () => {
	it("AudioAsset 初期化", () => {
		const id = "id";
		const path = "path";
		const duration = 1984;
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = new MusicAudioSystem({
			id: "music",
			audioSystemManager: game._audioSystemManager,
			resourceFactory: game.resourceFactory
		});
		const hint = { streaming: true };
		const asset = new AudioAsset(0, id, path, duration, system, true, hint);
		expect(asset.id).toBe(id);
		expect(asset.path).toBe(path);
		expect(asset.originalPath).toBe(path);
		expect(asset.duration).toBe(duration);
		expect(asset._system).toBe(system);
		expect(asset.loop).toBe(true);
		expect(asset.hint).toBe(hint);
	});

	it("VideoAsset 初期化", () => {
		const id = "id";
		const path = "path";
		const width = 320;
		const height = 240;
		const system = new VideoSystem();
		const loop = true;
		const useRealSize = false;
		const asset = new VideoAsset(id, path, width, height, system, loop, useRealSize);
		expect(asset.id).toBe(id);
		expect(asset.path).toBe(path);
		expect(asset.originalPath).toBe(path);
		expect(asset.width).toBe(width);
		expect(asset.height).toBe(height);
		expect(asset.realWidth).toBe(0);
		expect(asset.realHeight).toBe(0);
		expect(asset._system).toBe(system);
		expect(asset._loop).toBe(loop);
		expect(asset._useRealSize).toBe(useRealSize);
	});

	it("VideoAsset 破棄", () => {
		const id = "id";
		const path = "path";
		const width = 320;
		const height = 240;
		const system = new VideoSystem();
		const loop = true;
		const useRealSize = false;
		const asset = new VideoAsset(id, path, width, height, system, loop, useRealSize);
		asset.destroy();
		expect(asset.destroyed()).toBe(true);
		expect(asset._system).toBeUndefined();
	});
});
