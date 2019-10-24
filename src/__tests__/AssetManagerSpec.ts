import {
	AssetManager,
	AssetManagerLoadHandler,
	AudioAssetConfigurationBase,
	GameConfiguration,
	ImageAsset,
	ImageAssetConfigurationBase
} from "..";
import { customMatchers, Game, Surface } from "./helpers";

expect.extend(customMatchers);

describe("test AssetManager", () => {
	const gameConfiguration: GameConfiguration = {
		width: 320,
		height: 320,
		fps: 30,
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
				systemId: "user",
				duration: 91
			},
			grault: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user2",
				duration: 12742
			},
			garply: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user2",
				duration: 3474,
				loop: false,
				hint: { streaming: false }
			}
		}
	};

	it("初期化", () => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._assetManager;

		expect(manager.game).toBe(game);

		expect(manager.configuration.foo.path).toBe(gameConfiguration.assets.foo.path);
		expect(manager.configuration.bar.path).toBe(gameConfiguration.assets.bar.path);
		expect(manager.configuration.zoo.path).toBe(gameConfiguration.assets.zoo.path);
		expect(manager.configuration.baz.path).toBe(gameConfiguration.assets.baz.path);
		expect(manager.configuration.qux.path).toBe(gameConfiguration.assets.qux.path);
		expect(manager.configuration.quux.path).toBe(gameConfiguration.assets.quux.path);
		expect(manager.configuration.corge.path).toBe(gameConfiguration.assets.corge.path);
		expect(manager.configuration.grault.path).toBe(gameConfiguration.assets.grault.path);
		expect(manager.configuration.garply.path).toBe(gameConfiguration.assets.grault.path);

		expect(Object.keys(manager._assets).length).toEqual(0);
		expect(Object.keys(manager._liveAssetVirtualPathTable).length).toEqual(0);
		expect(Object.keys(manager._liveAbsolutePathTable).length).toEqual(0);
		expect(Object.keys(manager._refCounts).length).toEqual(0);
		expect(Object.keys((manager as any)._loadings).length).toEqual(0);

		expect(manager.configuration.zoo.systemId).toEqual("music");
		expect(manager.configuration.zoo.duration).toEqual((gameConfiguration.assets.zoo as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.zoo.loop).toEqual(true);
		expect(manager.configuration.zoo.hint).toEqual({ streaming: true });

		expect(manager.configuration.baz.systemId).toEqual("music");
		expect(manager.configuration.baz.duration).toEqual((gameConfiguration.assets.baz as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.baz.loop).toEqual(false);
		expect(manager.configuration.baz.hint).toEqual({ streaming: false });

		expect(manager.configuration.qux.systemId).toEqual("sound");
		expect(manager.configuration.qux.duration).toEqual((gameConfiguration.assets.qux as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.qux.loop).toEqual(false);
		expect(manager.configuration.qux.hint).toEqual({ streaming: false });

		expect(manager.configuration.quux.systemId).toEqual("sound");
		expect(manager.configuration.quux.duration).toEqual((gameConfiguration.assets.quux as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.quux.loop).toEqual(true);
		expect(manager.configuration.quux.hint).toEqual({ streaming: true });

		expect(manager.configuration.corge.systemId).toEqual("user");
		expect(manager.configuration.corge.duration).toEqual((gameConfiguration.assets.corge as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.corge.loop).toEqual(false);
		expect(manager.configuration.corge.hint).toEqual({});

		expect(manager.configuration.grault.systemId).toEqual("user2");
		expect(manager.configuration.grault.duration).toEqual((gameConfiguration.assets.grault as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.grault.loop).toEqual(true);
		expect(manager.configuration.grault.hint).toEqual({ streaming: true });

		expect(manager.configuration.garply.systemId).toEqual("user2");
		expect(manager.configuration.garply.duration).toEqual((gameConfiguration.assets.garply as AudioAssetConfigurationBase).duration);
		expect(manager.configuration.garply.loop).toEqual(false);
		expect(manager.configuration.garply.hint).toEqual({ streaming: false });
	});

	it("rejects illegal configuration", () => {
		expect(() => new Game(undefined!)).toThrowError("AssertionError");
		const illegalConf = {
			foo: {
				type: "image",
				virtualPath: "foo.png"
				// no path given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf })).toThrowError("AssertionError");

		const illegalConf2 = {
			foo: {
				type: "image",
				path: "/foo.png",
				width: 1
				// no virtualPath given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf2 })).toThrowError("AssertionError");

		const illegalConf3 = {
			foo: {
				type: "image",
				path: "/foo.png",
				virtualPath: "foo.png",
				width: 1
				// no height given
			}
		} as any;
		expect(() => new Game({ width: 320, height: 320, assets: illegalConf3 })).toThrowError("AssertionError");

		const legalConf: {[id: string]: ImageAssetConfigurationBase} = {
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
					assets: legalConf
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");
		expect(() => {
			return new Game(
				{
					width: 320,
					height: "320" as any /* not a number */,
					assets: legalConf
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
					assets: legalConf
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
					assets: legalConf
				},
				"/foo/bar/"
			);
		}).toThrowError("AssertionError");
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
			_onAssetError: (a, err, mgr) => {
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
			_onAssetError: (a, err, mgr) => {
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
					expect(manager._liveAbsolutePathTable["/path1.png"]).toBe("path1.png");
					expect(manager._liveAbsolutePathTable["/path2.png"]).toBe("path2.png");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("path/to/a/file");

					manager.unrefAssets(innerAssets);
					expect(manager._refCounts.foo).toBe(1);
					expect(manager._refCounts).not.toHaveProperty("bar");
					expect(manager._assets.foo).not.toBe(undefined);
					expect(manager._assets.bar).toBe(undefined);
					expect(manager._liveAssetVirtualPathTable["path1.png"].id).toBe("foo");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path2.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path/to/a/file");
					expect(manager._liveAbsolutePathTable["/path1.png"]).toBe("path1.png");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("/path2.png");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("/path/to/a/file");

					manager.unrefAssets(outerAssets);
					expect(manager._refCounts).not.toHaveProperty("foo");
					expect(manager._refCounts).not.toHaveProperty("bar");
					expect(manager._assets.foo).toBe(undefined);
					expect(manager._assets.bar).toBe(undefined);
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path1.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path2.png");
					expect(manager._liveAssetVirtualPathTable).not.toHaveProperty("path/to/a/file");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("/path1.png");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("/path2.png");
					expect(manager._liveAbsolutePathTable).not.toHaveProperty("/path/to/a/file");
					expect(a.destroyed()).toBe(true);
					done();
				}
			},
			_onAssetError: (a, err, mgr) => {
				fail("asset load error: should not fail");
				done();
			}
		};

		const handlerOuter: AssetManagerLoadHandler = {
			_onAssetLoad: a => {
				manager.requestAssets(innerAssets, handlerInner);
			},
			_onAssetError: (a, err, mgr) => {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(outerAssets, handlerOuter);
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
			_onAssetError: (a, err, mgr) => {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];
				manager.retryLoad(a);
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
			_onAssetLoad: a => {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: (a, err, mgr) => {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(AssetManager.MAX_ERROR_COUNT + 1);
					expect(() => {
						manager.retryLoad(a);
					}).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					manager.retryLoad(a);
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
			_onAssetLoad: a => {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: (a, err, mgr) => {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id)) failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(1);
					expect(() => {
						manager.retryLoad(a);
					}).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					manager.retryLoad(a);
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

	it("can be instanciated without configuration", () => {
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
});
