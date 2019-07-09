describe("test Scene", function() {
	var g = require('../lib/');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	var assetsConfiguration = {
		foo: {
			type: "image",
			path: "/path1.png",
			virtualPath: "path1.png",
			width: 1,
			height: 1,
		},
		baa: {
			type: "image",
			path: "/path2.png",
			virtualPath: "path2.png",
			width: 1,
			height: 1,
		}
	};
	var game = new mock.Game({
		width: 320,
		height: 320,
		assets: assetsConfiguration
	});

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化 - SceneParameterObject", function () {
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"],
			local: g.LocalTickMode.InterpolateLocal,
			tickGenerationMode: g.TickGenerationMode.Manual,
			name: "myScene"
		});
		expect(scene.game).toBe(game);
		expect(scene.assetLoaded.length).toEqual(0);
		expect(scene.assetLoadFailed.length).toEqual(0);
		expect(scene.assetLoadCompleted.length).toEqual(0);
		expect(scene.loaded.length).toEqual(0);
		expect(scene.children).not.toBeFalsy();
		expect(scene.children.length).toBe(0);
		expect(scene._sceneAssetHolder._assetIds).toEqual(["foo"]);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(1);
		expect(scene.local).toBe(g.LocalTickMode.InterpolateLocal);
		expect(scene.tickGenerationMode).toBe(g.TickGenerationMode.Manual);
		expect(scene.name).toEqual("myScene");

		expect(scene.update instanceof g.Trigger).toBe(true);
		expect(scene.loaded instanceof g.Trigger).toBe(true);
		expect(scene.assetLoaded instanceof g.Trigger).toBe(true);
		expect(scene.assetLoadFailed instanceof g.Trigger).toBe(true);
		expect(scene.assetLoadCompleted instanceof g.Trigger).toBe(true);
		expect(scene.stateChanged instanceof g.Trigger).toBe(true);
		expect(scene.message instanceof g.Trigger).toBe(true);
		expect(scene.pointDownCapture instanceof g.Trigger).toBe(true);
		expect(scene.pointMoveCapture instanceof g.Trigger).toBe(true);
		expect(scene.pointUpCapture instanceof g.Trigger).toBe(true);
		expect(scene.operation instanceof g.Trigger).toBe(true);
	});

	it("初期化 - Storage", function() {
		var scene = new g.Scene({game: game});
		expect(scene._storageLoader).toBeUndefined();
		var key = {
			region: g.StorageRegion.Values,
			regionKey: "foo.bar",
			gameId: "123",
			userId: "456"
		};
		scene = new g.Scene({game: game, storageKeys: [key]});
		expect(scene._storageLoader).toBeDefined();
		expect(scene.storageValues).toBeDefined();
	});

	it("append", function() {
		var scene1 = new g.Scene({game: game});
		var scene2 = new g.Scene({game: game});
		var e = new g.E({scene: scene1});
		scene1.append(e);
		expect(e.parent).toBe(scene1);
		scene2.append(e);
		expect(e.parent).toBe(scene2);
	});

	it("remove", function() {
		var scene1 = new g.Scene({game: game});
		var scene2 = new g.Scene({game: game});
		var e1 = new g.E({scene: scene1});
		var e2 = new g.E({scene: scene2});
		scene1.append(e1);
		scene2.append(e2);
		expect(e1.parent).toBe(scene1);
		scene1.remove(e1);
		expect(e1.parent).toBeUndefined();
		expect(scene1.remove(e2)).toBe(); // e2 is not child of scene1
		expect(e2.parent).toBe(scene2);
		scene2.remove(e2);
		expect(e2.parent).toBeUndefined();
	});

	it("insertBefore", function() {
		var scene1 = new g.Scene({game: game});
		var scene2 = new g.Scene({game: game});
		var e = new g.E({scene: scene1});
		scene1.insertBefore(e, null);
		expect(e.parent).toBe(scene1);
		scene2.insertBefore(e, null);
		expect(e.parent).toBe(scene2);

		var e2 = new g.E({scene: scene2});
		scene2.insertBefore(e2, e);
		expect(scene2.children[0]).toBe(e2);
		expect(scene2.children[1]).toBe(e);
	});

	it("loads assets", function(done) {
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"],
			name: "SceneToLoadAsset"
		});

		scene._ready.add(function () {
			expect(scene.assets["foo"]).not.toBe(undefined);
			expect(scene.assets["bar"]).toBe(undefined);
			expect(scene.assets["baa"]).not.toBe(undefined);
			done();
		});
		scene._load();
	});

	it("loads storage", function(done) {
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [[{data: "apple"}]];
		var scene = new g.Scene({
			game: game,
			storageKeys: keys,
			name: "SceneLoadsStorage"
		});

		game.storage._registerLoad(function(keys, loader) {
			loader._onLoaded(values);
		});
		scene._ready.add(function () {
			loadedCalled = true;
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.storageValues.get(0)).toBe(values[0]);
			done();
		});
		scene._load();
	});

	it("serializedValues", function(done) {
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [[{data: "apple"}]];

		var scene = new g.Scene({ game: game, storageKeys: keys });

		game.storage._registerLoad(function(keys, loader) {
			loader._onLoaded(values);
		});
		scene._ready.add(function () {
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.serializeStorageValues()).toBe(undefined);
			done();
		});
		scene._load();
	});


	it("loads storage - with serialization", function(done) {
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [[{data: "apple"}]];
		var serializedValues = [[{data: "orange"}]];

		var scene = new g.Scene({game: game, storageKeys: keys, storageValuesSerialization: "myserialization1" });

		game.storage._registerLoad(function(keys, loader) {
			if (!loader._valueStoreSerialization) {
				loader._onLoaded(values);
			} else {
				expect(loader._valueStoreSerialization).toBe("myserialization1");
				loader._onLoaded(serializedValues);
			}
		});
		scene._ready.add(function () {
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.serializeStorageValues()).toBe("myserialization1");
			expect(scene.storageValues.get(0)).toBe(serializedValues[0]);
			done();
		});
		scene._load();
	});

	it("loads assets and storage", function(done) {
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [[{data: "apple"}]];
		var scene = new g.Scene({game: game, storageKeys: keys, assetIds: ["foo", "baa"]});

		game.storage._registerLoad(function(k, l) {
			l._onLoaded(values);
		});

		scene._ready.add(function () {
			expect(scene._storageLoader).toBeDefined();
			expect(scene.storageValues.get(0)).toBe(values[0]);
			expect(scene.assets["foo"]).toBeDefined();
			expect(scene.assets["baa"]).toBeDefined();
			done();
		});
		scene._load();
	});

	it("prefetch - called after _load()", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(function () {
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(false);
			done();
		});

		scene._load();
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(false);

		setTimeout(function () {
			scene.prefetch();
			expect(scene._prefetchRequested).toBe(false); // _load() 後の呼び出しでは prefetch() の呼び出しを無視する
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);    // _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
			game.resourceFactory.flushDelayedAssets();
		}, 0);
	});

	it("prefetch - called twice", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(() => {done()});
		scene.prefetch();
		scene.prefetch();
		game.resourceFactory.flushDelayedAssets();
		setTimeout(function () {
			scene._load();
		}, 0);
	});

	it("prefetch - with no assets", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({game: game});
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(() =>{done()});
		scene.prefetch();
		game.resourceFactory.flushDelayedAssets();
		setTimeout(() => {scene._load()}, 0);
	});

	// prefetch()テストメモ
	//
	// prefetch()が絡んでも、loadedのfireタイミングがおかしくならないことを確認したい。
	// loadedのタイミングに関係するのは、アセット読み込み(prefetch(), _load()が引き起こす)と
	// ストレージ読み込み(_load()が引き起こす)である。関連する事象を以下のように置く:
	//   a) prefetch() 呼び出し
	//   b) _load() 呼び出し
	//   c) アセット読み込み完了
	//   d) ストレージ読み込み完了
	//   e) loaded 発火
	// d は存在しない場合がある。実装から、明らかに次のことが言える。
	//     b -> d        -- (1)
	// ただしここで X -> Y は「YはXの後に生じる」ことを表す。同じく実装から、明らかに_load()後のprefetch()は
	// 単に無視される。したがって (b -> a) のパスを改めて確認する必要はない。テストすべきケースは常に
	//     a -> b        -- (2)
	// (1), (2) から
	//     a -> b -> d   -- (3)
	// また Assetmanager#requestAssets() の呼び出し箇所から、c は a または b の後にのみ生じる。よって (2) から
	//     a -> c        -- (4)
	// さてここで我々が確認すべきことは「e は常に b, c, d すべての後に生じる」である。
	// d が存在しないケースを踏まえると、(3), (4) から、確認すべきケースは次の五つである:
	//     a -> c -> b         -- (5a)
	//     a -> b -> c         -- (5b)
	//     a -> c -> b -> d    -- (5c)
	//     a -> b -> c -> d    -- (5d)
	//     a -> b -> d -> c    -- (5e)
	// このいずれのケースでも、すべての後に e が生じることをテストすればよい。

	// 上記コメント (5a) のケース
	it("prefetch - prefetch-(asset loaded)-_load-loaded", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;
		var ready = false;

		scene._ready.add(function () {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch();  // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets();  // (c)

		setTimeout(function () {
			ready = true;
			scene._load();  // (b)
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(true);
		}, 0);
	});

	// 上記コメント (5b) のケース
	it("prefetch - prefetch-_loaded-(asset loaded)-loaded", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;
		var ready = false;

		scene._ready.add(function () {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(false);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		scene.prefetch();  // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);

		scene._load();  // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);    // _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
		ready = true;
		game.resourceFactory.flushDelayedAssets();  // (c)
	});

	// 上記コメント (5c) のケース
	it("prefetch - prefetch-(asset loaded)-_load-(storage loaded)-loaded", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [{data: "apple"}];
		var scene = new g.Scene({game: game, storageKeys: keys, assetIds: ["foo", "baa"]});
		game.resourceFactory.createsDelayedAsset = true;

		var notifyStorageLoaded = function () {
			fail("storage load not started");
		};
		game.storage._registerLoad(function(k, l) {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});
		var ready = false;

		scene._ready.add(function () {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch();  // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets();  // (c)

		setTimeout(function () {
			scene._load();  // (b)
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(true);

			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			ready = true;
			notifyStorageLoaded(values); // (d)
		}, 0);
	});

	// 上記コメント (5d) のケース
	it("prefetch - prefetch-_load-(asset loaded)-(storage loaded)-loaded", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [[{data: "apple"}]];
		var scene = new g.Scene({game: game, storageKeys: keys, assetIds: ["foo", "baa"]});
		game.resourceFactory.createsDelayedAsset = true;

		var notifyStorageLoaded = function () {
			fail("storage load not started");
		};
		game.storage._registerLoad(function(k, l) {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});
		var ready = false;

		scene._ready.add(function () {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch();  // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);

		scene._load();  // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);

		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets();  // (c)

		setTimeout(function () {
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			ready = true;
			notifyStorageLoaded(values); // (d)
		}, 0);
	});

	// 上記コメント (5e) のケース
	it("prefetch - prefetch-_load-(storage loaded)-(asset loaded)-loaded", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var keys = [{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}];
		var values = [{data: "apple"}];
		var scene = new g.Scene({game: game, storageKeys: keys, assetIds: ["foo", "baa"]});
		game.resourceFactory.createsDelayedAsset = true;

		var notifyStorageLoaded = function () {
			fail("storage load not started");
		};
		game.storage._registerLoad(function(k, l) {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});
		var ready = false;

		scene._ready.add(function () {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch();  // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);

		scene._load();  // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);

		notifyStorageLoaded(values); // (d)

		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		ready = true;
		game.resourceFactory.flushDelayedAssets();  // (c)
	});

	it("loads assets dynamically", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });

		game._loaded.add(function () {
			var scene = new g.Scene({
				game: game,
				assetIds: [
					"foo",
					{
						id: "dynamicImage",
						type: "image",
						width: 10,
						height: 10,
						uri: "http://dummy.unused.example/someImage.png"
					}
				]
			});
			scene.loaded.add(function () {
				var foo = scene.assets["foo"];
				var dynamicImage = scene.assets["dynamicImage"];
				expect(foo instanceof g.ImageAsset).toBe(true);
				expect(foo.id).toBe("foo");
				expect(dynamicImage instanceof g.ImageAsset).toBe(true);
				expect(dynamicImage.width).toBe(10);

				var loaded = false;
				scene.requestAssets([
					"baa",
					{
						id: "zooAudio",
						type: "audio",
						duration: 450,
						uri: "http://dummy.unused.example/zoo",
					}
				], function () {
					loaded = true;
					var baa = scene.assets["baa"];
					var zoo = scene.assets["zooAudio"];
					expect(baa instanceof g.ImageAsset).toBe(true);
					expect(baa.id).toBe("baa");
					expect(baa.width).toBe(1);
					expect(zoo instanceof g.AudioAsset).toBe(true);
					expect(zoo.duration).toBe(450);

					expect(foo.destroyed()).toBe(false);
					expect(dynamicImage.destroyed()).toBe(false);
					expect(baa.destroyed()).toBe(false);
					expect(zoo.destroyed()).toBe(false);

					game.popScene();
					game._flushSceneChangeRequests();
					expect(foo.destroyed()).toBe(true);
					expect(dynamicImage.destroyed()).toBe(true);
					expect(baa.destroyed()).toBe(true);
					expect(zoo.destroyed()).toBe(true);
					done();
				});

				// Scene#requestAssets() のハンドラ呼び出しは Game#tick() に同期しており、実ロードの完了後に tick() が来るまで遅延される。
				// テスト上は tick() を呼び出さないので、 _flushSceneChangeRequests() を呼び続けることで模擬する。
				function flushUntilLoaded() {
					if (loaded) return;
					game._flushSceneChangeRequests();
					setTimeout(flushUntilLoaded, 10);
				}
				flushUntilLoaded();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("does not crash even if destroyed while loading assets", function (done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._load();
		scene.destroy();
		game.resourceFactory.flushDelayedAssets();

		setTimeout(() => {done()}, 0);
	});

	it("handles asset loading failure", function(done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"]
		});

		var failureCount = 0;
		var loadedCount = 0;
		scene.assetLoaded.add(function (asset) {
			expect(asset instanceof g.Asset).toBe(true);
			expect(asset.id).toBe("foo");
			expect(failureCount).toBe(2);
			++loadedCount;
		});
		scene.assetLoadFailed.add(function (failureInfo) {
			expect(failureInfo.asset instanceof g.Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.name).toBe("AssetLoadError");
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			++failureCount;
		});
		scene._ready.add(function () {
			expect(failureCount).toBe(2);
			expect(loadedCount).toBe(1);
			expect(scene.assets["foo"]).not.toBe(undefined);
			done();
		});

		game.resourceFactory.withNecessaryRetryCount(2, function () {
			scene._load();
		});
	});

	it("handles asset loading failure - unhandled", function(done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"]
		});

		scene._ready.add(function () {
			expect(scene.assets["foo"]).not.toBe(undefined);
			done();
		});

		game.resourceFactory.withNecessaryRetryCount(2, function () {
			scene._load();
		});
	});

	it("handles asset loading - retry limit exceed", function(done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"]
		});

		var failureCount = 0;
		scene.assetLoaded.add(function (asset) {
			fail("should not be loaded");
		});
		scene.assetLoadFailed.add(function (failureInfo) {
			expect(failureInfo.asset instanceof g.Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			++failureCount;

			if (!failureInfo.error.retriable) {
				expect(failureInfo.error.name).toBe("AssetLoadError");
				expect(failureCount).toBe(g.AssetManager.MAX_ERROR_COUNT + 1);
				done();
			}
		});
		scene._ready.add(function () {
			fail("should not fire loaded");
		});

		game.resourceFactory.withNecessaryRetryCount(g.AssetManager.MAX_ERROR_COUNT + 1, function () {
			scene._load();
		});
	});

	it("handles asset loading - giving up", function(done) {
		var game = new mock.Game({ width: 320, height: 320, assets: assetsConfiguration });
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"]
		});

		var failureCount = 0;
		scene.assetLoaded.add(function (asset) {
			fail("should not be loaded");
		});
		scene.assetLoadFailed.add(function (failureInfo) {
			expect(failureInfo.asset instanceof g.Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			expect(failureCount).toBe(0);
			++failureCount;

			failureInfo.cancelRetry = true;
			setTimeout(function () {
				expect(game.leftGame).toBe(true);
				done();
			}, 0);
		});
		scene._ready.add(function () {
			fail("should not fire loaded");
		});

		game.resourceFactory.withNecessaryRetryCount(g.AssetManager.MAX_ERROR_COUNT + 1, function () {
			scene._load();
		});
	});

	it("cannot access undeclared assets", function(done) {
		var scene = new g.Scene({
			game: game,
			assetIds: ["foo"]
		});

		scene._ready.add(function () {
			var child = new g.Scene({
				game: game,
				assetIds: ["foo", "baa"]
			});

			child._ready.add(function () {
				expect(scene.assets["foo"]).not.toBe(undefined);
				expect(scene.assets["baa"]).toBe(undefined);
				expect(scene.assets["zoo"]).toBe(undefined);

				expect(child.assets["foo"]).not.toBe(undefined);
				expect(child.assets["baa"]).not.toBe(undefined);
				expect(child.assets["zoo"]).toBe(undefined);
				done();
			});
			child._load();
		});
		scene._load();
	});

	it("modified", function() {
		var scene = new g.Scene({game: game});
		scene.modified();
		expect(scene.game.modified).toEqual(true);
	});

	it("state", function(done) {
		var scene = new g.Scene({game: game});
		var raisedEvent = false;
		var stateChangeHandler = function() {
			raisedEvent = true;
		}
		scene.stateChanged.add(stateChangeHandler);

		var sceneLoaded = function() {
			expect(scene.state).toBe(g.SceneState.Active);
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		}
		var scene2Loaded = function() {
			expect(scene.state).toBe(g.SceneState.Deactive);
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		}
		var steps = [
			function() {
				scene.loaded.add(sceneLoaded);
				game.pushScene(scene);
			},
			function() {
				var scene2 = new g.Scene({game: game});
				scene2.loaded.add(scene2Loaded);
				game.pushScene(scene2);
			},
			function() {
				game.popScene();
				nextStep();
			},
			function() {
				expect(scene.state).toBe(g.SceneState.Active);
				expect(raisedEvent).toBe(true);
				raisedEvent = false;
				nextStep();
			},
			function() {
				game.popScene();
				nextStep();
			},
			function() {
				expect(scene.state).toBe(g.SceneState.Destroyed);
				expect(raisedEvent).toBe(true);
				done();
			}
		];
		var nextStep = function() {
			setTimeout(function() {
				steps[++stepIndex]();
				game._flushSceneChangeRequests();
			}, 0);
		}
		var stepIndex = -1;

		expect(scene.state).toBe(g.SceneState.Standby);
		nextStep();
	});

	it("state - change order and count", function(done) {
		var expected = [
			[ "S1", "Active" ],
			[ "S1", "BeforeDestroyed" ],
			[ "S1", "Destroyed" ],
			[ "S2", "Active" ],
			[ "S2", "Deactive" ],
			[ "S3", "Active" ],
			[ "S3", "BeforeDestroyed" ],
			[ "S3", "Destroyed" ],
			[ "S4", "Active" ],
			[ "S4", "BeforeDestroyed" ],
			[ "S4", "Destroyed" ],
			[ "S2", "Active" ],
			[ "S2", "BeforeDestroyed" ],
			[ "S2", "Destroyed" ]
		];
		var actual = [];
		function stateChangeHandler(state) {
			actual.push([ this._testName, g.SceneState[state] ]);
		}
		function makeScene(name) {
			var scene = new g.Scene({game: game});
			scene._testName = name;
			scene.stateChanged.add(stateChangeHandler, scene);
			return scene;
		}

		var steps = [
			function () {
				var scene1 = makeScene("S1");
				scene1.loaded.add(nextStep);
				game.pushScene(scene1);
			},
			function () {
				var scene2 = makeScene("S2");
				scene2.loaded.add(nextStep);
				game.replaceScene(scene2);
			},
			function () {
				var scene3 = makeScene("S3");
				scene3.loaded.add(nextStep);
				game.pushScene(scene3);
			},
			function () {
				var scene4 = makeScene("S4");
				scene4.loaded.add(nextStep);
				game.replaceScene(scene4);
			},
			function () {
				game.popScene();
				nextStep();
			},
			function () {
				game.popScene();
				nextStep();
			},
			function () {
				expect(actual).toEqual(expected);
				done();
			}
		];
		var nextStep = function() {
			setTimeout(function() {
				steps[++stepIndex]();
				game._flushSceneChangeRequests();
			}, 0);
		};
		var stepIndex = -1;

		nextStep();
	});

	it("createTimer/deleteTimer", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene = runtime.scene;
		var timer = scene.createTimer(100);
		expect(scene._timer._timers.length).toBe(1);
		expect(scene._timer._timers[0]).toBe(timer);
		timer.elapsed.add(function() {
			fail("invalid call");
		}, undefined);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		timer.elapsed.removeAll({ owner: undefined });
		expect(scene._timer._timers.length).toBe(1);
		var success = false;
		timer.elapsed.add(function() {
			success = true;
		});
		game.tick(1);
		expect(success).toBe(true);

		expect(timer.canDelete()).toBe(false);
		timer.elapsed.removeAll();
		expect(timer.canDelete()).toBe(true);

		scene.deleteTimer(timer);
		expect(scene._timer._timers.length).toBe(0);
	});

	it("setInterval/clearInterval", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene1 = game.scene();
		var state1 = false;
		var success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		var holder1 = scene1.setInterval(100, function() {
			if (! state1)
				fail("fail1");
			success1 = true;
		});
		expect(scene1._timer._timers.length).toBe(1);

		game.tick(1);
		game.tick(1);
		game.tick(1);
		state1 = true;
		game.tick(1);
		expect(success1).toBe(true);

		var scene2 = new g.Scene({game: game});
		var success2 = false;
		var state2 = false;
		var state3 = false;
		game.pushScene(scene2);
		game._flushSceneChangeRequests();
		state1 = false;
		var holder2 = scene2.setInterval(50, function() {
			if (! state2)
				fail("fail2");
			success2 = true;
		});
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);
		var holder3 = scene2.setInterval(50, function() {
		});
		expect(scene2._timer._timers.length).toBe(1);
		game.tick(1);
		state2 = true;
		game.tick(1);
		expect(success2).toBe(true);
		game.tick(10);	//どれだけ時間経過してもscene1のtimerは呼ばれない

		scene2.clearInterval(holder3);
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);
		scene1.clearInterval(holder1);
		expect(scene1._timer._timers.length).toBe(0);
		expect(scene2._timer._timers.length).toBe(1);
		scene2.clearInterval(holder2);
		expect(scene1._timer._timers.length).toBe(0);
		expect(scene2._timer._timers.length).toBe(0);
	});

	it("setTimeout - deprecated", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene1 = game.scene();
		var state1 = false;
		var success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		var holder1 = scene1.setTimeout(100, function() {
			if (! state1)
				fail("fail1");
			success1 = true;
		});
		expect(scene1._timer._timers.length).toBe(1);

		game.tick(1);
		game.tick(1);
		game.tick(1);
		state1 = true;
		game.tick(1);
		expect(success1).toBe(true);
		state1 = false;
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		expect(scene1._timer._timers.length).toBe(0);
	});

	it("setTimeout", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene = game.scene();
		var owner = {};
		var callCount = 0;
		var timerId = scene.setTimeout(function () {
			expect(this).toBe(owner);
			callCount++;
		}, 100, owner);

		game.tick(1);
		game.tick(1);
		game.tick(1);
		expect(callCount).toBe(0);
		game.tick(1);
		expect(callCount).toBe(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		expect(callCount).toBe(1);
	});

	it("clearTimeout", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene1 = game.scene();
		var state1 = false;
		var success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		var holder1 = scene1.setTimeout(100, function() {
			fail("fail1");
		});
		expect(scene1._timer._timers.length).toBe(1);
		scene1.clearTimeout(holder1);
		expect(scene1._timer._timers.length).toBe(0);

		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
		game.tick(1);
	});

	it("setInterval - release scene", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320 });
		var game = runtime.game;
		var scene1 = game.scene();
		var state1 = false;
		var success1 = false;
		var state2 = false;
		var success2 = false;

		expect(scene1._timer._timers.length).toBe(0);
		var holder1 = scene1.setInterval(100, function() {
		});
		expect(scene1._timer._timers.length).toBe(1);

		var scene2 = new g.Scene({game: game});
		game.pushScene(scene2);
		game._flushSceneChangeRequests();
		var holder2 = scene2.setInterval(50, function() {
			if (! state2)
				fail("fail2");
			success2 = true;
		});
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);
		var holder3 = scene2.setInterval(50, function() {
		});
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);

		game.popScene();
		game._flushSceneChangeRequests();
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers).toBeUndefined();

		var scene3 = new g.Scene({game: game});
		game.replaceScene(scene3);
		game._flushSceneChangeRequests();
		expect(scene1._timer._timers).toBeUndefined();
	});

	it("setInterval", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320, fps: 32 });
		var game = runtime.game;
		var scene = game.scene();
		var owner = {};
		var callCount = 0;
		var timerId = scene.setInterval(function () {
			expect(this).toBe(owner);
			callCount++;
		}, 100, owner);

		game.tick(1);
		game.tick(1);
		game.tick(1);  // 3/32*1000 = 93.75ms
		expect(callCount).toBe(0);
		game.tick(1);  // 4/32*1000 = 125ms
		expect(callCount).toBe(1);
		game.tick(1);
		game.tick(1);
		expect(callCount).toBe(1);
		game.tick(1);  // 7/32*1000 = 218.75ms
		expect(callCount).toBe(2);
		game.tick(1);
		game.tick(1);
		expect(callCount).toBe(2);
		game.tick(1);  // 10/32*1000 = 312.5ms
		expect(callCount).toBe(3);
	});

	it("isCurrentScene/gotoScene/end", function(done){
		jasmine.addMatchers(require("./helpers/customMatchers"));
		var game = new mock.Game({ width: 320, height: 320 });
		game._loaded.add(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene1 = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game});
			var scene3 = new g.Scene({game: game});

			game.pushScene(scene1);
			game._flushSceneChangeRequests();
			expect(scene1.isCurrentScene()).toBe(true);
			expect(scene2.isCurrentScene()).toBe(false);
			expect(scene3.isCurrentScene()).toBe(false);

			scene1.gotoScene(scene2, true); // push scene2
			game._flushSceneChangeRequests();
			expect(scene1.isCurrentScene()).toBe(false);
			expect(scene2.isCurrentScene()).toBe(true);
			expect(scene3.isCurrentScene()).toBe(false);

			scene2.end();
			game._flushSceneChangeRequests();
			expect(scene1.isCurrentScene()).toBe(true);
			expect(scene3.isCurrentScene()).toBe(false);

			scene1.gotoScene(scene3, false); // replace scene1 to scene3
			game._flushSceneChangeRequests();
			expect(scene3.isCurrentScene()).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("gotoScene - AssertionError", function(done){
		jasmine.addMatchers(require("./helpers/customMatchers"));
		var game = new mock.Game({ width: 320, height: 320 });
		game._loaded.add(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene1 = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game});
			expect(function(){ scene1.gotoScene(scene2); }).toThrowError("AssertionError");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("end - AssertionError", function(done){
		jasmine.addMatchers(require("./helpers/customMatchers"));
		var game = new mock.Game({ width: 320, height: 320 });
		game._loaded.add(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene1 = new g.Scene({game: game});
			expect(function(){ scene1.end(); }).toThrowError("AssertionError");
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
