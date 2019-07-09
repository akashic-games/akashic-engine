describe("test Asset", function() {
	var g = require('../lib/');
	var mock = require('./helpers/mock');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var id = "id";
		var path = "path";
		var asset = new g.Asset(id, path);
		expect(asset.id).toEqual(id);
		expect(asset.path).toEqual(path);
		expect(asset.originalPath).toEqual(path);
	});

	it("AudioAsset 初期化", function() {
		var id = "id";
		var path = "path";
		var duration = 1984;
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		var hint = { streaming: true };
		var asset = new g.AudioAsset(id, path, duration, system, true, hint);
		expect(asset.id).toBe(id);
		expect(asset.path).toBe(path);
		expect(asset.originalPath).toBe(path);
		expect(asset.duration).toBe(duration);
		expect(asset._system).toBe(system);
		expect(asset.loop).toBe(true);
		expect(asset.hint).toBe(hint);
	});

	it("VideoAsset 初期化", function() {
		const id = "id";
		const path = "path";
		const width = 320;
		const height = 240;
		const system = new g.VideoSystem();
		const loop = true;
		const useRealSize = false;
		const asset = new g.VideoAsset(id, path, width, height, system, loop, useRealSize);
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

	it("VideoAsset 破棄", function() {
		const id = "id";
		const path = "path";
		const width = 320;
		const height = 240;
		const system = new g.VideoSystem();
		const loop = true;
		const useRealSize = false;
		const asset = new g.VideoAsset(id, path, width, height, system, loop, useRealSize);
		asset.destroy();
		expect(asset.destroyed()).toBe(true);
		expect(asset._system).toBeUndefined();
	});
});
