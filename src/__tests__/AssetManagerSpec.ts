import type { AssetConfigurationMap } from "@akashic/game-configuration";
import type {
	AssetGenerationConfiguration,
	AssetManagerLoadHandler,
	AudioAssetConfigurationBase,
	AudioSystem,
	DynamicAssetConfiguration,
	GameConfiguration,
	Asset,
	ScriptAsset,
	ImageAsset,
	ImageAssetConfigurationBase
} from "..";
import { AssetManager } from "..";
import { PartialImageAsset } from "../auxiliary/PartialImageAsset";
import type { AudioAsset, Renderer } from "./helpers";
import { customMatchers, Game, Surface } from "./helpers";

expect.extend(customMatchers);

describe("test AssetManager", () => {
	const gameConfiguration: GameConfiguration = {
		width: 320,
		height: 320,
		fps: 30,
		main: "mainScene",
		audio: {
			user2: {
				loop: true,
				hint: { streaming: true }
			}
		},
		assets: {
			foo: {
				type: "image",
				path: "/path1.png",
				virtualPath: "path1.png",
				width: 1,
				height: 1
			},
			bar: {
				type: "image",
				path: "/path2.png",
				virtualPath: "path2.png",
				width: 1,
				height: 1,
				hint: {
					untainted: true
				}
			},
			sliced: {
				type: "image",
				path: "/path3.png",
				virtualPath: "path3.png",
				width: 10,
				height: 10,
				slice: {
					x: 2,
					y: 3,
					width: 4,
					height: 5
				}
			},
			sliced2: {
				type: "image",
				path: "/path3.png",
				virtualPath: "path3-slice1.png",
				width: 10,
				height: 10,
				slice: [3, 1, 6, 8]
			},
			zoo: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "music",
				duration: 1984
			},
			baz: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "music",
				duration: 42,
				loop: false,
				hint: { streaming: false }
			},
			qux: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "sound",
				duration: 667408
			},
			quux: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "sound",
				duration: 5972,
				loop: true,
				hint: { streaming: true }
			},
			corge: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "music",
				duration: 1984,
				offset: 100
			}
		}
	};

	it("初期化", () => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._assetManager;
		const assets = gameConfiguration.assets as AssetConfigurationMap;

		expect(manager.configuration.foo.path).toBe(assets.foo.path);
		expect(manager.configuration.bar.path).toBe(assets.bar.path);
		expect(manager.configuration.sliced.path).toBe(assets.sliced.path);
		expect(manager.configuration.sliced2.path).toBe(assets.sliced2.path);
		expect(manager.configuration.zoo.path).toBe(assets.zoo.path);
		expect(manager.configuration.baz.path).toBe(assets.baz.path);
		expect(manager.configuration.qux.path).toBe(assets.qux.path);
		expect(manager.configuration.quux.path).toBe(assets.quux.path);

		expect(Object.keys(manager._assets).length).toEqual(0);
		expect(Object.keys(manager._liveAssetVirtualPathTable).length).toEqual(0);
		expect(Object.keys(manager._liveAssetPathTable).length).toEqual(0);
		expect(Object.keys(manager._refCounts).length).toEqual(0);
		expect(Object.keys((manager as any)._loadings).length).toEqual(0);

		expect(manager.configuration.zoo.type).toEqual("audio");
		const zooAsset = manager.configuration.zoo as AudioAssetConfigurationBase;
		expect(zooAsset.systemId).toEqual("music");
		expect(zooAsset.duration).toEqual((assets.zoo as AudioAssetConfigurationBase).duration);
		expect(zooAsset.loop).toEqual(true);
		expect(zooAsset.hint).toEqual({ streaming: true });
		expect(zooAsset.offset).toEqual(undefined);

		expect(manager.configuration.baz.type).toEqual("audio");
		const bazAsset = manager.configuration.baz as AudioAssetConfigurationBase;
		expect(bazAsset.systemId).toEqual("music");
		expect(bazAsset.duration).toEqual((assets.baz as AudioAssetConfigurationBase).duration);
		expect(bazAsset.loop).toEqual(false);
		expect(bazAsset.hint).toEqual({ streaming: false });
		expect(bazAsset.offset).toEqual(undefined);

		expect(manager.configuration.qux.type).toEqual("audio");
		const quxAsset = manager.configuration.qux as AudioAssetConfigurationBase;
		expect(quxAsset.systemId).toEqual("sound");
		expect(quxAsset.duration).toEqual((assets.qux as AudioAssetConfigurationBase).duration);
		expect(quxAsset.loop).toEqual(false);
		expect(quxAsset.hint).toEqual({ streaming: false });
		expect(quxAsset.offset).toEqual(undefined);

		expect(manager.configuration.quux.type).toEqual("audio");
		const quuxAsset = manager.configuration.quux as AudioAssetConfigurationBase;
		expect(quuxAsset.systemId).toEqual("sound");
		expect(quuxAsset.duration).toEqual((assets.quux as AudioAssetConfigurationBase).duration);
		expect(quuxAsset.loop).toEqual(true);
		expect(quuxAsset.hint).toEqual({ streaming: true });
		expect(quuxAsset.offset).toEqual(undefined);

		expect(manager.configuration.corge.type).toEqual("audio");
		const corgeAsset = manager.configuration.corge as AudioAssetConfigurationBase;
		expect(corgeAsset.systemId).toEqual("music");
		expect(corgeAsset.duration).toEqual((assets.corge as AudioAssetConfigurationBase).duration);
		expect(corgeAsset.loop).toEqual(true);
		expect(corgeAsset.offset).toBe(100);
	});

	it("rejects illegal configuration", () => {
		const illegalConf = {
			foo: {
				type: "image",
				virtualPath: "foo.png"
				// no path given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf, main: "mainScene" })).toThrowError("AssertionError");

		const illegalConf2 = {
			foo: {
				type: "image",
				path: "/foo.png",
				width: 1
				// no virtualPath given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf2, main: "mainScene" })).toThrowError("AssertionError");

		const illegalConf3 = {
			foo: {
				type: "image",
				path: "/foo.png",
				virtualPath: "foo.png",
				width: 1
				// no height given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf3, main: "mainScene" })).toThrowError("AssertionError");

		const legalConf: { [id: string]: ImageAssetConfigurationBase } = {
			foo: {
				type: "image",
				path: "/foo.png",
				virtualPath: "foo.png",
				width: 1,
				height: 1
			}
		};
		expect(() => {
			return new Game(
				{
					width: "320" as any /* not a number */,
					height: 320,
					assets: legalConf,
					main: "mainScene"
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");
		expect(() => {
			return new Game(
				{
					width: 320,
					height: "320" as any /* not a number */,
					assets: legalConf,
					main: "mainScene"
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");
		expect(() => {
			return new Game(
				{
					width: 320,
					height: 320,
					fps: "60" as any /* not a number */,
					assets: legalConf,
					main: "mainScene"
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");
		expect(() => {
			return new Game(
				{
					width: 320,
					height: 320,
					fps: 120 /* out of (0-60] */,
					assets: legalConf,
					main: "mainScene"
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");

		const audioIllegalConf: { [id: string]: AudioAssetConfigurationBase } = {
			corge: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user" as any, // `music` と `sound` 以外のsystemIdはエラーとなる
				duration: 91
			}
		};
		expect(() => new Game({ width: 320, height: 320, assets: audioIllegalConf, main: "mainScene" })).toThrowError("AssertionError");
	});

	it("loads/unloads an asset", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;

		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: (a: ImageAsset) => {
				expect(a.id).toBe("foo");
				expect(a.hint).toBeUndefined();
				expect(a.destroyed()).toBe(false);
				manager.unrefAsset("foo");
				expect(a.destroyed()).toBe(true);
				done();
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};
		expect(manager.requestAsset("foo", handler)).toBe(true);
	});

	it("loads assets", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;

		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: (a: ImageAsset) => {
				expect(a.id).toBe("bar");
				expect(a.hint).toEqual({ untainted: true });
				done();
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(["bar"], handler);
	});

	it("loads assets multiple times", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._assetManager;
		const innerAssets = ["foo", "bar"];
		const outerAssets = ["foo"];

		const loadedNames: string[] = [];
		const handlerInner: AssetManagerLoadHandler = {
			_onAssetLoad: a => {
				loadedNames.push(a.id);
				if (loadedNames.length === 2) {
					expect(loadedNames.indexOf("foo")).not.toBe(-1);
					expect(loadedNames.indexOf("bar")).not.toBe(-1);
					expect(manager._refCounts.foo).toBe(2);
					expect(manager._refCounts.bar).toBe(1);
					expect(manager._assets).toHaveProperty("foo");
					expect(manager._assets).toHaveProperty("bar");
					expect(manager._liveAssetVirtualPathTable["path1.png"].id).toBe("foo");
					expect(manager._liveAssetVirtualPathTable["path2.png"].id).toBe("bar");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("/path/to/a/file");
					expect(manager._liveAssetPathTable["/path1.png"]).toBe("path1.png");
					expect(manager._liveAssetPathTable["/path2.png"]).toBe("path2.png");
					expect(manager._liveAssetPathTable).not.toHaveProperty("path/to/a/file");

					manager.unrefAssets(innerAssets);
					expect(manager._refCounts.foo).toBe(1);
					expect(manager._refCounts).not.toHaveProperty("bar");
					expect(manager._assets.foo).not.toBe(undefined);
					expect(manager._assets.bar).toBe(undefined);
					expect(manager._liveAssetVirtualPathTable["path1.png"].id).toBe("foo");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path2.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path/to/a/file");
					expect(manager._liveAssetPathTable["/path1.png"]).toBe("path1.png");
					expect(manager._liveAssetPathTable).not.toHaveProperty("/path2.png");
					expect(manager._liveAssetPathTable).not.toHaveProperty("/path/to/a/file");

					manager.unrefAssets(outerAssets);
					expect(manager._refCounts).not.toHaveProperty("foo");
					expect(manager._refCounts).not.toHaveProperty("bar");
					expect(manager._assets.foo).toBe(undefined);
					expect(manager._assets.bar).toBe(undefined);
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path1.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path2.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path/to/a/file");
					expect(manager._liveAssetPathTable).not.toHaveProperty("/path1.png");
					expect(manager._liveAssetPathTable).not.toHaveProperty("/path2.png");
					expect(manager._liveAssetPathTable).not.toHaveProperty("/path/to/a/file");
					expect(a.destroyed()).toBe(true);
					done();
				}
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};

		const handlerOuter: AssetManagerLoadHandler = {
			_onAssetLoad: () => {
				manager.requestAssets(innerAssets, handlerInner);
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(outerAssets, handlerOuter);
	});

	it("should normalize the dynamic asset configuration", async () => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._assetManager;

		function requestAsset(conf: DynamicAssetConfiguration): Promise<AudioAsset> {
			return new Promise((resolve, reject) => {
				manager.requestAsset(conf, { _onAssetError: e => reject(e), _onAssetLoad: (a: AudioAsset) => resolve(a) });
			});
		}

		const asset1 = await requestAsset({
			id: "test-dynamic-audio-asset-1",
			uri: "test-dynamic-audio-asset-1-uri",
			type: "audio",
			duration: 1234,
			systemId: "sound"
		});
		expect(asset1.hint).toEqual({
			streaming: false // hint 属性が補完されていることを確認
		});

		const asset2 = await requestAsset({
			id: "test-dynamic-audio-asset-2",
			uri: "test-dynamic-audio-asset-2-uri",
			type: "audio",
			duration: 1234,
			systemId: "music"
		});
		expect(asset2.hint).toEqual({
			streaming: true // hint 属性が補完されていることを確認
		});
	});

	it("can instantiate the asset from asset generation", async () => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._assetManager;

		function requestAsset(conf: AssetGenerationConfiguration): Promise<AudioAsset> {
			return new Promise((resolve, reject) => {
				manager.requestAsset(conf, { _onAssetError: e => reject(e), _onAssetLoad: (a: AudioAsset) => resolve(a) });
			});
		}

		const asset = await requestAsset({
			type: "vector-image",
			id: "test-vector-image-asset-from-asset-generation",
			data: "<svg></svg>"
		});

		expect(asset.type).toBe("vector-image");
		expect(asset.path).toBeDefined();
		expect(asset.id).toBe("test-vector-image-asset-from-asset-generation");
	});

	it("can instantiate PartialImageAsset", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;

		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: (a: ImageAsset) => {
				expect(a.id).toBe("sliced");
				expect(a).toBeInstanceOf(PartialImageAsset);
				expect(a.width).toBe(4); // 値は gameConfiguration.assets.sliced に由来。width ではなく slice.width が入る
				expect(a.height).toBe(5); // 同上
				const surface = a.asSurface();
				expect(surface.width).toBe(4);
				expect(surface.height).toBe(5);
				const history = (surface.renderer() as Renderer).methodCallParamsHistory("drawImage");
				expect(history.length).toBe(1);
				expect(history[0].surface).toBe((a as PartialImageAsset)._src.asSurface());
				expect(history[0]).toMatchObject({
					offsetX: 2,
					offsetY: 3,
					width: 4,
					height: 5,
					canvasOffsetX: 0,
					canvasOffsetY: 0
				});
				done();
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(["sliced"], handler);
	});

	it("can instantiate PartialImageAsset with shortened form", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;

		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: (a: ImageAsset) => {
				expect(a.id).toBe("sliced2");
				expect(a).toBeInstanceOf(PartialImageAsset);
				expect(a.width).toBe(6); // 値は gameConfiguration.assets.sliced2 に由来。width ではなく slice.width が入る
				expect(a.height).toBe(8); // 同上
				const surface = a.asSurface();
				expect(surface.width).toBe(6);
				expect(surface.height).toBe(8);
				const history = (surface.renderer() as Renderer).methodCallParamsHistory("drawImage");
				expect(history.length).toBe(1);
				expect(history[0].surface).toBe((a as PartialImageAsset)._src.asSurface());
				expect(history[0]).toMatchObject({
					offsetX: 3,
					offsetY: 1,
					width: 6,
					height: 8,
					canvasOffsetX: 0,
					canvasOffsetY: 0
				});
				done();
			},
			_onAssetError: () => {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(["sliced2"], handler);
	});

	it("handles loading failure", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;
		const assetIds = ["foo", "zoo"];

		const failureCounts: { [id: string]: number } = {};
		let loadCount = 0;
		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: a => {
				expect(failureCounts[a.id]).toBe(2);
				++loadCount;
				if (loadCount === assetIds.length) {
					expect(manager._countLoadingAsset()).toBe(0);
					done();
				}
			},
			_onAssetError: (a, _err, callback) => {
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];
				callback(a);
			}
		};

		game.resourceFactory.withNecessaryRetryCount(2, () => {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("handles loading failure - never success", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;
		const assetIds = ["foo", "zoo"];

		const failureCounts: { [id: string]: number } = {};
		let gaveUpCount = 0;
		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: () => {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: (a, err, callback) => {
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(AssetManager.MAX_ERROR_COUNT + 1);
					expect(() => {
						callback(a);
					}).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					callback(a);
				}

				if (gaveUpCount === 2) {
					setTimeout(() => {
						expect(manager._countLoadingAsset()).toBe(0);
						done();
					}, 0);
				}
			}
		};

		game.resourceFactory.withNecessaryRetryCount(AssetManager.MAX_ERROR_COUNT + 1, () => {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("handles loading failure - non-retriable", done => {
		const game = new Game(gameConfiguration);
		const manager = game._assetManager;
		const assetIds = ["foo", "zoo"];

		const failureCounts: { [id: string]: number } = {};
		let gaveUpCount = 0;
		const handler: AssetManagerLoadHandler = {
			_onAssetLoad: () => {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: (a, err, callback) => {
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(1);
					expect(() => {
						callback(a);
					}).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					callback(a);
				}

				if (gaveUpCount === 2) {
					setTimeout(() => {
						expect(manager._countLoadingAsset()).toBe(0);
						done();
					}, 0);
				}
			}
		};

		game.resourceFactory.withNecessaryRetryCount(-1, () => {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("can be instantiated without configuration", () => {
		const game = new Game(gameConfiguration);
		const manager = new AssetManager(game);
		expect(manager.configuration).toEqual({});
		expect(manager.destroyed()).toBe(false);

		manager.destroy();
		expect(manager.destroyed()).toBe(true);
	});

	it("loads dynamically defined assets", done => {
		const game = new Game(gameConfiguration);
		const manager = new AssetManager(game);
		manager.requestAsset(
			{
				id: "testDynamicAsset",
				type: "image",
				width: 10,
				height: 24,
				uri: "http://dummy.example/unused-name.png"
			},
			{
				_onAssetError: () => {
					done.fail();
				},
				_onAssetLoad: (asset: ImageAsset) => {
					expect(asset.id).toBe("testDynamicAsset");
					expect(asset.width).toBe(10);
					expect(asset.height).toBe(24);
					expect(asset.asSurface() instanceof Surface).toBe(true);
					expect(manager._assets.testDynamicAsset).toBe(asset);
					expect(manager._refCounts.testDynamicAsset).toBe(1);

					manager.requestAssets(["testDynamicAsset"], {
						_onAssetError: () => {
							done.fail();
						},
						_onAssetLoad: asset2 => {
							expect(asset2).toBe(asset);
							expect(manager._refCounts.testDynamicAsset).toBe(2);

							manager.unrefAsset(asset2);
							expect(manager._refCounts.testDynamicAsset).toBe(1);
							manager.unrefAssets(["testDynamicAsset"]);
							expect(manager._refCounts.testDynamicAsset).toBe(undefined); // 0 のエントリは削除される

							expect(asset2.destroyed()).toBe(true);
							done();
						}
					});
				}
			}
		);
	});

	it("releases assets when destroyed", done => {
		const game = new Game(gameConfiguration);
		const manager = new AssetManager(game);
		manager.requestAsset(
			{
				id: "testDynamicAsset",
				type: "image",
				width: 10,
				height: 24,
				uri: "http://dummy.example/unused-name.png"
			},
			{
				_onAssetError: () => {
					done.fail();
				},
				_onAssetLoad: asset => {
					expect(asset.destroyed()).toBe(false);
					manager.destroy();
					expect(manager.destroyed()).toBe(true);
					expect(asset.destroyed()).toBe(true);
					done();
				}
			}
		);
	});

	it("reuse instantiated asset if it's in destroyRequested", done => {
		const assetMap: AssetConfigurationMap = {
			testAsset: {
				type: "audio",
				duration: 100,
				path: "/path/to/real/file",
				virtualPath: "path/to/virtual/file",
				systemId: "sound"
			}
		};

		const game = new Game(gameConfiguration);
		const manager = new AssetManager(game, assetMap);

		manager.requestAsset("testAsset", {
			_onAssetError: () => {
				done.fail();
			},
			_onAssetLoad: () => {
				const asset = manager.peekLiveAssetByAccessorPath("/path/to/virtual/file", "audio") as AudioAsset;
				asset._inUse = true; // NOTE: AudioSystem#requestDestroy() 時に破棄されないように inUse() フラグを立てる
				const _asset = asset;
				const system = asset._system as AudioSystem;
				manager.unrefAsset("testAsset");
				expect(system.getDestroyRequestedAsset(asset.id)).not.toBeNull();
				manager.requestAsset("testAsset", {
					_onAssetError: () => {
						done.fail();
					},
					_onAssetLoad: () => {
						const asset = manager.peekLiveAssetByAccessorPath("/path/to/virtual/file", "audio") as AudioAsset;
						expect(asset).toBe(_asset);
						expect(system.getDestroyRequestedAsset(asset.id)).toBeNull();
						done();
					}
				});
			}
		});
	});

	describe("accessorPath", () => {
		// AssetManager のメソッドは配列の順序は保証しないので、このテストは全体的に実装依存になっていることに注意。
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
					offset: 1000,
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
				}
			},
			moduleMainScripts: {
				"@akashic-extension/some-library": "node_modules/@akashic-extension/some-library/lib/index.js"
			}
		};

		it("can resolve patterns to asset IDs", () => {
			const game = new Game(gameConfiguration);
			const manager = game._assetManager;

			expect(manager.resolvePatternsToAssetIds(["/assets/**/*"])).toEqual([
				"id-assets/stage01/bgm01",
				"id-assets/stage01/se01",
				"id-assets/stage01/boss.png",
				"id-assets/stage01/map.json",
				"id-assets/chara01/image.png"
			]);

			expect(manager.resolvePatternsToAssetIds(["@akashic-extension/some-library/**/*"])).toEqual([
				"node_modules/@akashic-extension/some-library/lib/index.js",
				"node_modules/@akashic-extension/some-library/assets/image.png",
				"node_modules/@akashic-extension/some-library/assets/boss.png"
			]);
		});

		it("can resolve a filter to asset IDs", () => {
			const game = new Game(gameConfiguration);
			const manager = game._assetManager;
			expect(manager.resolvePatternsToAssetIds([s => /\/stage\d+\//.test(s)])).toEqual([
				"id-assets/stage01/bgm01",
				"id-assets/stage01/se01",
				"id-assets/stage01/boss.png",
				"id-assets/stage01/map.json"
			]);
		});

		it("can resolve patterns to asset IDs", () => {
			const game = new Game(gameConfiguration);
			const manager = game._assetManager;
			expect(manager.resolvePatternsToAssetIds(["/assets/**/*"])).toEqual([
				"id-assets/stage01/bgm01",
				"id-assets/stage01/se01",
				"id-assets/stage01/boss.png",
				"id-assets/stage01/map.json",
				"id-assets/chara01/image.png"
			]);
		});

		it("can resolve multiple patterns/filters to asset IDs", () => {
			const game = new Game(gameConfiguration);
			const manager = game._assetManager;
			expect(manager.resolvePatternsToAssetIds(["**/*.js", s => /\/bgm\d+$/.test(s)])).toEqual([
				"id-script/main.js",
				"node_modules/@akashic-extension/some-library/lib/index.js",
				"id-assets/stage01/bgm01"
			]);
		});

		function setupAssetLoadedGame(
			assetIds: string[],
			fail: (arg: any) => void,
			callback: (arg: { manager: AssetManager; game: Game }) => void
		): void {
			const game = new Game(gameConfiguration);
			const manager = game._assetManager;
			let count = 0;
			manager.requestAssets(assetIds, {
				_onAssetLoad: () => {
					if (++count < assetIds.length) return;
					callback({ game, manager });
				},
				_onAssetError: () => {
					fail("asset load error: should not fail");
				}
			});
		}

		it("can peek live assets by IDs", done => {
			const assetIds = ["id-script/main.js", "id-assets/stage01/se01", "id-assets/chara01/image.png"];
			setupAssetLoadedGame(
				assetIds,
				s => done.fail(s),
				({ manager }) => {
					// live でも type が合わなければエラー
					expect(() => manager.peekLiveAssetById("id-script/main.js", "image")).toThrowError("AssertionError");
					const mainjs = manager.peekLiveAssetById("id-script/main.js", "script") as ScriptAsset;
					expect(mainjs.type).toBe("script");
					expect(mainjs.path).toBe("script/main.js");
					expect(typeof mainjs.execute).toBe("function");

					// 読んでない (live でない) アセットはエラー
					expect(() => manager.peekLiveAssetById("id-assets/stage01/bgm01", "text")).toThrowError("AssertionError");
					expect(() => manager.peekLiveAssetById("id-assets/stage01/bgm01", "audio")).toThrowError("AssertionError");

					expect(() => manager.peekLiveAssetById("id-assets/stage01/se01", "text")).toThrowError("AssertionError");
					const se01 = manager.peekLiveAssetById("id-assets/stage01/se01", "audio") as AudioAsset;
					expect(se01.type).toBe("audio");
					expect(se01.path).toBe("assets/stage01/se01");
					expect(se01.offset).toBe(1000);
					expect(se01.duration).toBe(10000);
					done();
				}
			);
		});

		it("can peek live assets by accessorPath", done => {
			const assetIds = [
				"id-script/main.js",
				"id-assets/stage01/se01",
				"id-assets/chara01/image.png",
				"node_modules/@akashic-extension/some-library/assets/boss.png"
			];
			setupAssetLoadedGame(
				assetIds,
				s => done.fail(s),
				({ manager }) => {
					// live でも type が合わなければエラー
					expect(() => manager.peekLiveAssetByAccessorPath("/script/main.js", "image")).toThrowError("AssertionError");
					const mainjs = manager.peekLiveAssetByAccessorPath("/script/main.js", "script") as ScriptAsset;
					expect(mainjs.type).toBe("script");
					expect(mainjs.path).toBe("script/main.js");
					expect(typeof mainjs.execute).toBe("function");

					// 読んでない (live でない) アセットはエラー
					expect(() => manager.peekLiveAssetByAccessorPath("/assets/stage01/bgm01", "text")).toThrowError("AssertionError");
					expect(() => manager.peekLiveAssetByAccessorPath("/assets/stage01/bgm01", "audio")).toThrowError("AssertionError");

					expect(() => manager.peekLiveAssetByAccessorPath("/assets/stage01/se01", "text")).toThrowError("AssertionError");
					const se01 = manager.peekLiveAssetByAccessorPath("/assets/stage01/se01", "audio") as AudioAsset;
					expect(se01.type).toBe("audio");
					expect(se01.path).toBe("assets/stage01/se01");
					expect(se01.duration).toBe(10000);

					const boss = manager.peekLiveAssetByAccessorPath(
						"@akashic-extension/some-library/assets/boss.png",
						"image"
					) as ImageAsset;
					expect(boss.type).toBe("image");
					expect(boss.path).toBe("node_modules/@akashic-extension/some-library/assets/boss.png");
					expect(boss.width).toBe(324);
					expect(boss.height).toBe(196);

					// "/" 始まりでないのはエラー
					expect(() => manager.peekLiveAssetByAccessorPath("assets/stage01/se01", "audio")).toThrowError("AssertionError");
					done();
				}
			);
		});

		function extractAssetProps(asset: Asset): { id: string; type: string; path: string } {
			return { id: asset.id, type: asset.type, path: asset.path };
		}

		it("can peek live assets by a pattern", done => {
			const assetIds = [
				"id-script/main.js",
				"id-assets/stage01/bgm01",
				"id-assets/stage01/se01",
				"id-assets/stage01/boss.png",
				"id-assets/stage01/map.json",
				"id-assets/chara01/image.png",
				"node_modules/@akashic-extension/some-library/assets/image.png",
				"node_modules/@akashic-extension/some-library/assets/boss.png"
			];
			setupAssetLoadedGame(
				assetIds,
				s => done.fail(s),
				({ manager }) => {
					expect(manager.peekAllLiveAssetsByPattern("/script/main.js", "image")).toEqual([]);
					const result0 = manager.peekAllLiveAssetsByPattern("/script/main.js", "script");
					expect(result0.length).toBe(1);
					expect(extractAssetProps(result0[0])).toEqual({ id: "id-script/main.js", type: "script", path: "script/main.js" });

					const result1 = manager.peekAllLiveAssetsByPattern("/assets/stage01/*", null).map(extractAssetProps);
					expect(result1.length).toEqual(4);
					expect(result1[0]).toEqual({ id: "id-assets/stage01/bgm01", type: "audio", path: "assets/stage01/bgm01" });
					expect(result1[1]).toEqual({ id: "id-assets/stage01/se01", type: "audio", path: "assets/stage01/se01" });
					expect(result1[2]).toEqual({ id: "id-assets/stage01/boss.png", type: "image", path: "assets/stage01/boss.png" });
					expect(result1[3]).toEqual({ id: "id-assets/stage01/map.json", type: "text", path: "assets/stage01/map.json" });

					const result2 = manager.peekAllLiveAssetsByPattern("**/*", "audio").map(extractAssetProps);
					expect(result2.length).toEqual(2);
					expect(result2[0]).toEqual({ id: "id-assets/stage01/bgm01", type: "audio", path: "assets/stage01/bgm01" });
					expect(result2[1]).toEqual({ id: "id-assets/stage01/se01", type: "audio", path: "assets/stage01/se01" });

					const result3 = manager.peekAllLiveAssetsByPattern("/*/*/*.png", "image").map(extractAssetProps);
					expect(result3.length).toEqual(2);
					expect(result3[0]).toEqual({ id: "id-assets/stage01/boss.png", type: "image", path: "assets/stage01/boss.png" });
					expect(result3[1]).toEqual({ id: "id-assets/chara01/image.png", type: "image", path: "assets/chara01/image.png" });

					const result4 = manager
						.peekAllLiveAssetsByPattern("@akashic-extension/some-library/*/*.png", "image")
						.map(extractAssetProps);
					expect(result4).toEqual([
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
					done();
				}
			);
		});

		it("can peek live assets by a filter", done => {
			const assetIds = [
				"id-script/main.js",
				"id-assets/stage01/bgm01",
				"id-assets/stage01/se01",
				"id-assets/stage01/boss.png",
				"id-assets/stage01/map.json",
				"id-assets/chara01/image.png",
				"node_modules/@akashic-extension/some-library/assets/image.png",
				"node_modules/@akashic-extension/some-library/assets/boss.png"
			];
			setupAssetLoadedGame(
				assetIds,
				s => done.fail(s),
				({ manager }) => {
					expect(manager.peekAllLiveAssetsByPattern("/script/main.js", "image")).toEqual([]);
					const result0 = manager.peekAllLiveAssetsByPattern(s => s === "/script/main.js", "script");
					expect(result0.length).toBe(1);
					expect(extractAssetProps(result0[0])).toEqual({ id: "id-script/main.js", type: "script", path: "script/main.js" });

					const result1 = manager.peekAllLiveAssetsByPattern(s => /^\/assets\/stage01\/.*$/.test(s), null).map(extractAssetProps);
					expect(result1.length).toEqual(4);
					expect(result1[0]).toEqual({ id: "id-assets/stage01/bgm01", type: "audio", path: "assets/stage01/bgm01" });
					expect(result1[1]).toEqual({ id: "id-assets/stage01/se01", type: "audio", path: "assets/stage01/se01" });
					expect(result1[2]).toEqual({ id: "id-assets/stage01/boss.png", type: "image", path: "assets/stage01/boss.png" });
					expect(result1[3]).toEqual({ id: "id-assets/stage01/map.json", type: "text", path: "assets/stage01/map.json" });

					const result2 = manager.peekAllLiveAssetsByPattern(() => true, "audio").map(extractAssetProps);
					expect(result2.length).toEqual(2);
					expect(result2[0]).toEqual({ id: "id-assets/stage01/bgm01", type: "audio", path: "assets/stage01/bgm01" });
					expect(result2[1]).toEqual({ id: "id-assets/stage01/se01", type: "audio", path: "assets/stage01/se01" });

					const result3 = manager.peekAllLiveAssetsByPattern(s => /\.png$/.test(s), "image").map(extractAssetProps);
					expect(result3).toEqual([
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
					done();
				}
			);
		});
	});
});
