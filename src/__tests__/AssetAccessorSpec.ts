import { GameConfiguration, AssetAccessor, AssetLike } from "..";
import { customMatchers, Game, ResourceFactory } from "./helpers";

expect.extend(customMatchers);

describe("test AssetAccessor", () => {
	const gameConfiguration: GameConfiguration = {
		width: 320,
		height: 240,
		fps: 30,
		main: "./script/main.js",
		assets: {
			"id-script/main.js": {
				type: "script",
				path: "script/main.js",
				virtualPath: "script/main.js",
				global: true
			},
			"id-assets/stage01/bgm01": {
				type: "audio",
				path: "assets/stage01/bgm01",
				virtualPath: "assets/stage01/bgm01",
				systemId: "music",
				duration: 10000
			},
			"id-assets/stage01/se01": {
				type: "audio",
				path: "assets/stage01/se01",
				virtualPath: "assets/stage01/se01",
				systemId: "sound",
				duration: 10000
			},
			"id-assets/stage01/boss.png": {
				type: "image",
				path: "assets/stage01/boss.png",
				virtualPath: "assets/stage01/boss.png",
				width: 64,
				height: 64
			},
			"id-assets/stage01/map.json": {
				type: "text",
				path: "assets/stage01/map.json",
				virtualPath: "assets/stage01/map.json"
			},
			"id-assets/chara01/image.png": {
				type: "image",
				path: "assets/chara01/image.png",
				virtualPath: "assets/chara01/image.png",
				width: 32,
				height: 32
			}
		}
	};

	const sampleJSONFileContent = JSON.stringify({
		testValue: true
	});

	const assetIds = [
		"id-script/main.js",
		"id-assets/stage01/bgm01",
		"id-assets/stage01/se01",
		"id-assets/stage01/boss.png",
		"id-assets/stage01/map.json",
		"id-assets/chara01/image.png"
	];

	function setupAssetAccessor(assetIds: string[], fail: (arg: any) => void, callback: (accessor: AssetAccessor) => void) {
		const game = new Game(gameConfiguration);
		(game.resourceFactory as ResourceFactory).scriptContents["assets/stage01/map.json"] = sampleJSONFileContent;

		const manager = game._assetManager;
		const accessor = new AssetAccessor(manager);
		let count = 0;
		manager.requestAssets(assetIds, {
			_onAssetLoad: () => {
				if (++count < assetIds.length) return;
				callback(accessor);
			},
			_onAssetError: (a, err, mgr) => {
				fail("asset load error: should not fail");
			}
		});
	}

	function extractAssetProps(asset: AssetLike): { id: string; type: string; path: string } {
		return { id: asset.id, type: asset.type, path: asset.path };
	}

	it("can get an asset by path", done => {
		setupAssetAccessor(
			assetIds,
			s => done.fail(s),
			accessor => {
				expect(extractAssetProps(accessor.getImage("/assets/stage01/boss.png"))).toEqual({
					id: "id-assets/stage01/boss.png",
					type: "image",
					path: "assets/stage01/boss.png"
				});

				expect(extractAssetProps(accessor.getAudio("/assets/stage01/bgm01"))).toEqual({
					id: "id-assets/stage01/bgm01",
					type: "audio",
					path: "assets/stage01/bgm01"
				});

				expect(extractAssetProps(accessor.getScript("/script/main.js"))).toEqual({
					id: "id-script/main.js",
					type: "script",
					path: "script/main.js"
				});

				expect(extractAssetProps(accessor.getText("/assets/stage01/map.json"))).toEqual({
					id: "id-assets/stage01/map.json",
					type: "text",
					path: "assets/stage01/map.json"
				});

				expect(accessor.getTextContent("/assets/stage01/map.json")).toBe(sampleJSONFileContent);
				expect(accessor.getJSONContent("/assets/stage01/map.json")).toEqual(JSON.parse(sampleJSONFileContent));
				done();
			}
		);
	});

	it("can get multiple assets by pattern", done => {
		setupAssetAccessor(
			assetIds,
			s => done.fail(s),
			accessor => {
				expect(accessor.getAllImages("/assets/**/*").map(extractAssetProps)).toEqual([
					{
						id: "id-assets/stage01/boss.png",
						type: "image",
						path: "assets/stage01/boss.png"
					},
					{
						id: "id-assets/chara01/image.png",
						type: "image",
						path: "assets/chara01/image.png"
					}
				]);

				expect(accessor.getAllImages().map(extractAssetProps)).toEqual([
					{
						id: "id-assets/stage01/boss.png",
						type: "image",
						path: "assets/stage01/boss.png"
					},
					{
						id: "id-assets/chara01/image.png",
						type: "image",
						path: "assets/chara01/image.png"
					}
				]);

				expect(accessor.getAllAudios("/assets/*/*").map(extractAssetProps)).toEqual([
					{
						id: "id-assets/stage01/bgm01",
						type: "audio",
						path: "assets/stage01/bgm01"
					},
					{
						id: "id-assets/stage01/se01",
						type: "audio",
						path: "assets/stage01/se01"
					}
				]);

				expect(accessor.getAllScripts("**/*.js").map(extractAssetProps)).toEqual([
					{
						id: "id-script/main.js",
						type: "script",
						path: "script/main.js"
					}
				]);

				expect(accessor.getAllTexts("/assets/**/*.json").map(extractAssetProps)).toEqual([
					{
						id: "id-assets/stage01/map.json",
						type: "text",
						path: "assets/stage01/map.json"
					}
				]);
				done();
			}
		);
	});

	it("can get an asset by id", done => {
		setupAssetAccessor(
			assetIds,
			s => done.fail(s),
			accessor => {
				expect(extractAssetProps(accessor.getImageById("id-assets/stage01/boss.png"))).toEqual({
					id: "id-assets/stage01/boss.png",
					type: "image",
					path: "assets/stage01/boss.png"
				});

				expect(extractAssetProps(accessor.getAudioById("id-assets/stage01/bgm01"))).toEqual({
					id: "id-assets/stage01/bgm01",
					type: "audio",
					path: "assets/stage01/bgm01"
				});

				expect(extractAssetProps(accessor.getScriptById("id-script/main.js"))).toEqual({
					id: "id-script/main.js",
					type: "script",
					path: "script/main.js"
				});

				expect(extractAssetProps(accessor.getTextById("id-assets/stage01/map.json"))).toEqual({
					id: "id-assets/stage01/map.json",
					type: "text",
					path: "assets/stage01/map.json"
				});

				expect(accessor.getTextContentById("id-assets/stage01/map.json")).toBe(sampleJSONFileContent);
				expect(accessor.getJSONContentById("id-assets/stage01/map.json")).toEqual(JSON.parse(sampleJSONFileContent));
				done();
			}
		);
	});
});
