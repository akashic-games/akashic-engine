import type { Asset, GameConfiguration } from "..";
import { AssetAccessor } from "..";
import { customMatchers, Game } from "./helpers";

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
			},
			"id-assets/icon/icon01.svg": {
				type: "vector-image",
				path: "assets/icon/icon01.svg",
				virtualPath: "assets/icon/icon01.svg",
				width: 64,
				height: 64
			},
			"id-assets/bin/lib01.wasm": {
				type: "binary",
				path: "assets/bin/lib01.wasm",
				virtualPath: "assets/bin/lib01.wasm"
			},
			"node_modules/@akashic-extension/some-library/lib/index.js": {
				type: "script",
				path: "node_modules/@akashic-extension/some-library/lib/index.js",
				virtualPath: "node_modules/@akashic-extension/some-library/lib/index.js",
				global: true
			},
			"node_modules/@akashic-extension/some-library/assets/image.png": {
				type: "image",
				path: "node_modules/@akashic-extension/some-library/assets/image.png",
				virtualPath: "node_modules/@akashic-extension/some-library/assets/image.png",
				width: 2048,
				height: 1024
			},
			"node_modules/@akashic-extension/some-library/assets/boss.png": {
				type: "image",
				path: "node_modules/@akashic-extension/some-library/assets/boss.png",
				virtualPath: "node_modules/@akashic-extension/some-library/assets/boss.png",
				width: 324,
				height: 196
			},
			"node_modules/another-extension/lib/index.js": {
				type: "script",
				path: "node_modules/another-extension/lib/index.js",
				virtualPath: "node_modules/another-extension/lib/index.js",
				global: true
			}
		},
		moduleMainScripts: {
			"@akashic-extension/some-library": "node_modules/@akashic-extension/some-library/lib/index.js",
			"another-extension": "node_modules/another-extension/lib/index.js"
		}
	};

	const sampleJSONFileContent = JSON.stringify({
		testValue: true
	});

	const sampleArrayBufferContent = new ArrayBuffer(8);

	const assetIds = [
		"id-script/main.js",
		"id-assets/stage01/bgm01",
		"id-assets/stage01/se01",
		"id-assets/stage01/boss.png",
		"id-assets/stage01/map.json",
		"id-assets/chara01/image.png",
		"id-assets/icon/icon01.svg",
		"id-assets/bin/lib01.wasm",
		"node_modules/@akashic-extension/some-library/lib/index.js",
		"node_modules/@akashic-extension/some-library/assets/image.png",
		"node_modules/@akashic-extension/some-library/assets/boss.png",
		"node_modules/another-extension/lib/index.js"
	];

	function setupAssetAccessor(assetIds: string[], fail: (arg: any) => void, callback: (accessor: AssetAccessor) => void): void {
		const game = new Game(gameConfiguration);
		game.resourceFactory.scriptContents["assets/stage01/map.json"] = sampleJSONFileContent;
		game.resourceFactory.binaryContents["assets/bin/lib01.wasm"] = sampleArrayBufferContent;

		const manager = game._assetManager;
		const accessor = new AssetAccessor(manager);
		let count = 0;
		manager.requestAssets(assetIds, {
			_onAssetLoad: () => {
				if (++count < assetIds.length) return;
				callback(accessor);
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
			}
		});
	}

	function extractAssetProps(asset: Asset): { id: string; type: string; path: string } {
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

				expect(extractAssetProps(accessor.getVectorImage("/assets/icon/icon01.svg"))).toEqual({
					id: "id-assets/icon/icon01.svg",
					type: "vector-image",
					path: "assets/icon/icon01.svg"
				});

				expect(extractAssetProps(accessor.getBinary("/assets/bin/lib01.wasm"))).toEqual({
					id: "id-assets/bin/lib01.wasm",
					type: "binary",
					path: "assets/bin/lib01.wasm"
				});

				expect(accessor.getTextContent("/assets/stage01/map.json")).toBe(sampleJSONFileContent);
				expect(accessor.getJSONContent("/assets/stage01/map.json")).toEqual(JSON.parse(sampleJSONFileContent));
				expect(accessor.getBinaryData("/assets/bin/lib01.wasm")).toBe(sampleArrayBufferContent);

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
					},
					{
						id: "node_modules/@akashic-extension/some-library/assets/image.png",
						type: "image",
						path: "node_modules/@akashic-extension/some-library/assets/image.png"
					},
					{
						id: "node_modules/@akashic-extension/some-library/assets/boss.png",
						type: "image",
						path: "node_modules/@akashic-extension/some-library/assets/boss.png"
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
					},
					{
						id: "node_modules/@akashic-extension/some-library/lib/index.js",
						type: "script",
						path: "node_modules/@akashic-extension/some-library/lib/index.js"
					},
					{
						id: "node_modules/another-extension/lib/index.js",
						type: "script",
						path: "node_modules/another-extension/lib/index.js"
					}
				]);

				expect(accessor.getAllTexts("/assets/**/*.json").map(extractAssetProps)).toEqual([
					{
						id: "id-assets/stage01/map.json",
						type: "text",
						path: "assets/stage01/map.json"
					}
				]);

				expect(accessor.getAllVectorImages("/assets/**/*").map(extractAssetProps)).toEqual([
					{
						id: "id-assets/icon/icon01.svg",
						type: "vector-image",
						path: "assets/icon/icon01.svg"
					}
				]);

				expect(accessor.getAllVectorImages().map(extractAssetProps)).toEqual([
					{
						id: "id-assets/icon/icon01.svg",
						type: "vector-image",
						path: "assets/icon/icon01.svg"
					}
				]);

				expect(accessor.getAllBinaries().map(extractAssetProps)).toEqual([
					{
						id: "id-assets/bin/lib01.wasm",
						type: "binary",
						path: "assets/bin/lib01.wasm"
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

				expect(extractAssetProps(accessor.getVectorImageById("id-assets/icon/icon01.svg"))).toEqual({
					id: "id-assets/icon/icon01.svg",
					type: "vector-image",
					path: "assets/icon/icon01.svg"
				});

				expect(extractAssetProps(accessor.getBinaryById("id-assets/bin/lib01.wasm"))).toEqual({
					id: "id-assets/bin/lib01.wasm",
					type: "binary",
					path: "assets/bin/lib01.wasm"
				});

				expect(accessor.getTextContentById("id-assets/stage01/map.json")).toBe(sampleJSONFileContent);
				expect(accessor.getJSONContentById("id-assets/stage01/map.json")).toEqual(JSON.parse(sampleJSONFileContent));
				expect(accessor.getBinaryDataById("id-assets/bin/lib01.wasm")).toBe(sampleArrayBufferContent);
				done();
			}
		);
	});

	it("can get assets by path contains the module name", done => {
		setupAssetAccessor(
			assetIds,
			s => done.fail(s),
			accessor => {
				expect(accessor.getAllImages("@akashic-extension/some-library/assets/*.png").map(extractAssetProps)).toEqual([
					{
						id: "node_modules/@akashic-extension/some-library/assets/image.png",
						type: "image",
						path: "node_modules/@akashic-extension/some-library/assets/image.png"
					},
					{
						id: "node_modules/@akashic-extension/some-library/assets/boss.png",
						type: "image",
						path: "node_modules/@akashic-extension/some-library/assets/boss.png"
					}
				]);
				expect(extractAssetProps(accessor.getScript("@akashic-extension/some-library/lib/index.js"))).toEqual({
					id: "node_modules/@akashic-extension/some-library/lib/index.js",
					type: "script",
					path: "node_modules/@akashic-extension/some-library/lib/index.js"
				});
				expect(extractAssetProps(accessor.getScript("another-extension/lib/index.js"))).toEqual({
					id: "node_modules/another-extension/lib/index.js",
					type: "script",
					path: "node_modules/another-extension/lib/index.js"
				});
				expect(() => {
					accessor.getScript("not-exists-library/index.js");
				}).toThrowError();
				done();
			}
		);
	});

	it("can get virtualPath from assetId", done => {
		setupAssetAccessor(
			assetIds,
			s => done.fail(s),
			accessor => {
				expect(accessor.pathOf("id-assets/stage01/bgm01")).toBe("/assets/stage01/bgm01");
				expect(accessor.pathOf("id-assets/icon/icon01.svg")).toBe("/assets/icon/icon01.svg");
				expect(accessor.pathOf("unknown")).toBeNull();
				done();
			}
		);
	});
});
