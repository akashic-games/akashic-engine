describe("test AssetManager", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");

	var gameConfiguration = {
		width: 320,
		height: 320,
		fps: 30,
		audio: {
			"user2": {
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
				height: 1,
			},
			bar: {
				type: "image",
				path: "/path2.png",
				virtualPath: "path2.png",
				width: 1,
				height: 1,
			},
			zoo: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "music",
				duration: 1984,
			},
			baz: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "music",
				duration: 42,
				loop: false,
				hint: { streaming: false },
			},
			qux: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "sound",
				duration: 667408,
			},
			quux: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "sound",
				duration: 5972,
				loop: true,
				hint: { streaming: true },
			},
			corge: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user",
				duration: 91,
			},
			grault: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user2",
				duration: 12742,
			},
			garply: {
				type: "audio",
				path: "/path/to/a/file",
				virtualPath: "path/to/a/file",
				systemId: "user2",
				duration: 3474,
				loop: false,
				hint: { streaming: false },
			},
		}
	};

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var game = new mock.Game(gameConfiguration, "/");
		var manager = game._assetManager;

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
		expect(Object.keys(manager._loadings).length).toEqual(0);

		expect(manager.configuration.zoo.systemId).toEqual("music");
		expect(manager.configuration.zoo.duration).toEqual(gameConfiguration.assets.zoo.duration);
		expect(manager.configuration.zoo.loop).toEqual(true);
		expect(manager.configuration.zoo.hint).toEqual({ streaming: true });

		expect(manager.configuration.baz.systemId).toEqual("music");
		expect(manager.configuration.baz.duration).toEqual(gameConfiguration.assets.baz.duration);
		expect(manager.configuration.baz.loop).toEqual(false);
		expect(manager.configuration.baz.hint).toEqual({ streaming: false });

		expect(manager.configuration.qux.systemId).toEqual("sound");
		expect(manager.configuration.qux.duration).toEqual(gameConfiguration.assets.qux.duration);
		expect(manager.configuration.qux.loop).toEqual(false);
		expect(manager.configuration.qux.hint).toEqual({ streaming: false });

		expect(manager.configuration.quux.systemId).toEqual("sound");
		expect(manager.configuration.quux.duration).toEqual(gameConfiguration.assets.quux.duration);
		expect(manager.configuration.quux.loop).toEqual(true);
		expect(manager.configuration.quux.hint).toEqual({ streaming: true });

		expect(manager.configuration.corge.systemId).toEqual("user");
		expect(manager.configuration.corge.duration).toEqual(gameConfiguration.assets.corge.duration);
		expect(manager.configuration.corge.loop).toEqual(false);
		expect(manager.configuration.corge.hint).toEqual({});

		expect(manager.configuration.grault.systemId).toEqual("user2");
		expect(manager.configuration.grault.duration).toEqual(gameConfiguration.assets.grault.duration);
		expect(manager.configuration.grault.loop).toEqual(true);
		expect(manager.configuration.grault.hint).toEqual({ streaming: true });

		expect(manager.configuration.garply.systemId).toEqual("user2");
		expect(manager.configuration.garply.duration).toEqual(gameConfiguration.assets.garply.duration);
		expect(manager.configuration.garply.loop).toEqual(false);
		expect(manager.configuration.garply.hint).toEqual({ streaming: false });
	});

	it("rejects illegal configuration", function () {
		expect(function () { new mock.Game(); }).toThrowError("AssertionError");
		var illegalConf = {
			foo: {
				type: "image",
				virtualPath: "foo.png",
				// no path given
			}
		};
		expect(function () { new mock.Game({ width: 320, height: 320, assets: illegalConf }); }).toThrowError("AssertionError");

		var illegalConf2 = {
			foo: {
				type: "image",
				path: "/foo.png",
				width: 1,
				// no virtualPath given
			}
		};
		expect(function () { new mock.Game({ width: 320, height: 320, assets: illegalConf2 }); }).toThrowError("AssertionError");

		var illegalConf3 = {
			foo: {
				type: "image",
				path: "/foo.png",
				virtualPath: "foo.png",
				width: 1,
				// no height given
			}
		};
		expect(function () { new mock.Game({ width: 320, height: 320, assets: illegalConf3 }); }).toThrowError("AssertionError");

		var legalConf = {
			foo: {
				type: "image",
				path: "/foo.png",
				virtualPath: "foo.png",
				width: 1,
				height: 1,
			}
		};
		expect(function () { new mock.Game({ width: "320" /* not a number */, height: 320, assets: legalConf }, "/foo/bar/"); }).toThrowError("AssertionError");
		expect(function () { new mock.Game({ width: 320, height: "320" /* not a number */, assets: legalConf }, "/foo/bar/"); }).toThrowError("AssertionError");
		expect(function () { new mock.Game({ width: 320, height: 320, fps: "60" /* not a number */, assets: legalConf }, "/foo/bar/"); }).toThrowError("AssertionError");
		expect(function () { new mock.Game({ width: 320, height: 320, fps: 120 /* out of (0-60] */, assets: legalConf }, "/foo/bar/"); }).toThrowError("AssertionError");
	});

	it("loads/unloads an asset", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = game._assetManager;

		var handler = {
			_onAssetLoad: function (a) {
				expect(a.id).toBe("foo");
				expect(a.destroyed()).toBe(false);
				manager.unrefAsset("foo");
				expect(a.destroyed()).toBe(true);
				done();
			},
			_onAssetError: function (a, err, mgr) {
				fail("asset load error: should not fail");
				done();
			}
		};
		expect(manager.requestAsset("foo", handler)).toBe(true);
	});


	it("loads assets", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = game._assetManager;

		var handler = {
			_onAssetLoad: function (a) {
				expect(a.id).toBe("foo");
				done();
			},
			_onAssetError: function (a, err, mgr) {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(["foo"], handler);
	});

	it("loads assets multiple times", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		var manager = game._assetManager;
		var innerAssets = ["foo", "bar"];
		var outerAssets = ["foo"];

		var loadedNames = [];
		var handlerInner = {
			_onAssetLoad: function (a) {
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
			_onAssetError: function (a, err, mgr) {
				fail("asset load error: should not fail");
				done();
			}
		};

		var handlerOuter = {
			_onAssetLoad: function (a) {
				manager.requestAssets(innerAssets, handlerInner);
			},
			_onAssetError: function (a, err, mgr) {
				fail("asset load error: should not fail");
				done();
			}
		};
		manager.requestAssets(outerAssets, handlerOuter);
	});

	it("handles loading failure", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = game._assetManager;
		var assetIds = ["foo", "zoo"];

		var failureCounts = {};
		var loadCount = 0;
		var handler = {
			_onAssetLoad: function (a) {
				expect(failureCounts[a.id]).toBe(2);
				++loadCount;
				if (loadCount === assetIds.length) {
					expect(manager._countLoadingAsset()).toBe(0);
					done();
				}
			},
			_onAssetError: function (a, err, mgr) {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id))
					failureCounts[a.id] = 0;
				++failureCounts[a.id];
				manager.retryLoad(a);
			}
		};

		game.resourceFactory.withNecessaryRetryCount(2, function () {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("handles loading failure - never success", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = game._assetManager;
		var assetIds = ["foo", "zoo"];

		var failureCounts = {};
		var gaveUpCount = 0;
		var handler = {
			_onAssetLoad: function (a) {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: function (a, err, mgr) {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id))
					failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(g.AssetManager.MAX_ERROR_COUNT + 1);
					expect(function () { manager.retryLoad(a); }).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					manager.retryLoad(a);
				}

				if (gaveUpCount === 2) {
					setTimeout(function () {
						expect(manager._countLoadingAsset()).toBe(0);
						done();
					}, 0);
				}
			}
		};

		game.resourceFactory.withNecessaryRetryCount(g.AssetManager.MAX_ERROR_COUNT + 1, function () {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("handles loading failure - non-retriable", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = game._assetManager;
		var assetIds = ["foo", "zoo"];

		var failureCounts = {};
		var gaveUpCount = 0;
		var handler = {
			_onAssetLoad: function (a) {
				fail("should not succeed to load");
				done();
			},
			_onAssetError: function (a, err, mgr) {
				expect(mgr).toBe(manager);
				if (!failureCounts.hasOwnProperty(a.id))
					failureCounts[a.id] = 0;
				++failureCounts[a.id];

				if (!err.retriable) {
					expect(failureCounts[a.id]).toBe(1);
					expect(function () { manager.retryLoad(a); }).toThrowError("AssertionError");
					++gaveUpCount;
				} else {
					manager.retryLoad(a);
				}

				if (gaveUpCount === 2) {
					setTimeout(function () {
						expect(manager._countLoadingAsset()).toBe(0);
						done();
					}, 0);
				}
			}
		};

		game.resourceFactory.withNecessaryRetryCount(-1, function () {
			manager.requestAssets(assetIds, handler);
		});
	});

	it("can be instanciated without configuration", function () {
		var game = new mock.Game(gameConfiguration);
		var manager = new g.AssetManager(game);
		expect(manager.configuration).toEqual({});
		expect(manager.destroyed()).toBe(false);

		manager.destroy();
		expect(manager.destroyed()).toBe(true);
	});

	it("loads dynamically defined assets", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = new g.AssetManager(game);
		manager.requestAsset({
			id: "testDynamicAsset",
			type: "image",
			width: 10,
			height: 24,
			uri: "http://dummy.example/unused-name.png"
		}, {
			_onAssetError: function () {
				done.fail();
			},
			_onAssetLoad: function (asset) {
				expect(asset.id).toBe("testDynamicAsset");
				expect(asset.width).toBe(10);
				expect(asset.height).toBe(24);
				expect(asset.asSurface() instanceof g.Surface).toBe(true);
				expect(manager._assets["testDynamicAsset"]).toBe(asset);
				expect(manager._refCounts["testDynamicAsset"]).toBe(1);

				manager.requestAssets(["testDynamicAsset"], {
					_onAssetError: function () {
						done.fail();
					},
					_onAssetLoad: function (asset2) {
						expect(asset2).toBe(asset);
						expect(manager._refCounts["testDynamicAsset"]).toBe(2);

						manager.unrefAsset(asset2);
						expect(manager._refCounts["testDynamicAsset"]).toBe(1);
						manager.unrefAssets(["testDynamicAsset"]);
						expect(manager._refCounts["testDynamicAsset"]).toBe(undefined);  // 0 のエントリは削除される

						expect(asset2.destroyed()).toBe(true);
						done();
					}
				});
			}
		});
	});

	it("releases assets when destroyed", function (done) {
		var game = new mock.Game(gameConfiguration);
		var manager = new g.AssetManager(game);
		manager.requestAsset({
			id: "testDynamicAsset",
			type: "image",
			width: 10,
			height: 24,
			uri: "http://dummy.example/unused-name.png"
		}, {
			_onAssetError: function () {
				done.fail();
			},
			_onAssetLoad: function (asset) {
				expect(asset.destroyed()).toBe(false);
				manager.destroy();
				expect(manager.destroyed()).toBe(true);
				expect(asset.destroyed()).toBe(true);
				done();
			}
		});
	});
});
