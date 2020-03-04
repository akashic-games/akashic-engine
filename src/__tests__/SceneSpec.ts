import { Trigger } from "@akashic/trigger";
import {
	Asset,
	AssetConfiguration,
	AssetManager,
	AudioAsset,
	E,
	ImageAsset,
	LocalTickMode,
	Scene,
	SceneState,
	StorageRegion,
	TickGenerationMode
} from "..";
import { customMatchers, Game, skeletonRuntime } from "./helpers";

expect.extend(customMatchers);

describe("test Scene", () => {
	const assetsConfiguration: { [path: string]: AssetConfiguration } = {
		foo: {
			type: "image",
			path: "/path1.png",
			virtualPath: "path1.png",
			width: 1,
			height: 1
		},
		baa: {
			type: "image",
			path: "/path2.png",
			virtualPath: "path2.png",
			width: 1,
			height: 1
		}
	};
	const game = new Game({
		width: 320,
		height: 320,
		main: "",
		assets: assetsConfiguration
	});

	it("初期化 - SceneParameterObject", () => {
		const scene = new Scene({
			game: game,
			assetIds: ["foo"],
			local: LocalTickMode.InterpolateLocal,
			tickGenerationMode: TickGenerationMode.Manual,
			name: "myScene"
		});
		expect(scene.game).toBe(game);
		expect(scene.assetLoaded.length).toEqual(1);
		expect(scene.assetLoadFailed.length).toEqual(0);
		expect(scene.assetLoadCompleted.length).toEqual(0);
		expect(scene.assetLoadAborted.length).toEqual(1);
		expect(scene.assetHolderLoaded.length).toEqual(0);
		expect(scene.loaded.length).toEqual(0);
		expect(scene.children).not.toBeFalsy();
		expect(scene.children.length).toBe(0);
		expect(scene._assetHolder._assetIds).toEqual(["foo"]);
		expect(scene._assetHolder.waitingAssetsCount).toBe(1);
		expect(scene.local).toBe(LocalTickMode.InterpolateLocal);
		expect(scene.tickGenerationMode).toBe(TickGenerationMode.Manual);
		expect(scene.name).toEqual("myScene");

		expect(scene.update instanceof Trigger).toBe(true);
		expect(scene.loaded instanceof Trigger).toBe(true);
		expect(scene.assetLoaded instanceof Trigger).toBe(true);
		expect(scene.assetLoadFailed instanceof Trigger).toBe(true);
		expect(scene.assetLoadCompleted instanceof Trigger).toBe(true);
		expect(scene.assetLoadAborted instanceof Trigger).toBe(true);
		expect(scene.assetHolderLoaded instanceof Trigger).toBe(true);
		expect(scene.stateChanged instanceof Trigger).toBe(true);
		expect(scene.message instanceof Trigger).toBe(true);
		expect(scene.pointDownCapture instanceof Trigger).toBe(true);
		expect(scene.pointMoveCapture instanceof Trigger).toBe(true);
		expect(scene.pointUpCapture instanceof Trigger).toBe(true);
		expect(scene.operation instanceof Trigger).toBe(true);
	});

	it("初期化 - Storage", () => {
		let scene = new Scene({ game: game });
		expect(scene._storageLoader).toBeUndefined();
		const key = {
			region: StorageRegion.Values,
			regionKey: "foo.bar",
			gameId: "123",
			userId: "456"
		};
		scene = new Scene({ game: game, storageKeys: [key] });
		expect(scene._storageLoader).toBeDefined();
		expect(scene.storageValues).toBeDefined();
	});

	it("append", () => {
		const scene1 = new Scene({ game: game });
		const scene2 = new Scene({ game: game });
		const e = new E({ scene: scene1 });
		scene1.append(e);
		expect(e.parent).toBe(scene1);
		scene2.append(e);
		expect(e.parent).toBe(scene2);
	});

	it("remove", () => {
		const scene1 = new Scene({ game: game });
		const scene2 = new Scene({ game: game });
		const e1 = new E({ scene: scene1 });
		const e2 = new E({ scene: scene2 });
		scene1.append(e1);
		scene2.append(e2);
		expect(e1.parent).toBe(scene1);
		scene1.remove(e1);
		expect(e1.parent).toBeUndefined();
		expect(scene1.remove(e2)).toBeUndefined(); // e2 is not child of scene1
		expect(e2.parent).toBe(scene2);
		scene2.remove(e2);
		expect(e2.parent).toBeUndefined();
	});

	it("insertBefore", () => {
		const scene1 = new Scene({ game: game });
		const scene2 = new Scene({ game: game });
		const e = new E({ scene: scene1 });
		scene1.insertBefore(e, null);
		expect(e.parent).toBe(scene1);
		scene2.insertBefore(e, null);
		expect(e.parent).toBe(scene2);

		const e2 = new E({ scene: scene2 });
		scene2.insertBefore(e2, e);
		expect(scene2.children[0]).toBe(e2);
		expect(scene2.children[1]).toBe(e);
	});

	it("loads assets", done => {
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"],
			name: "SceneToLoadAsset"
		});

		scene._ready.add(() => {
			expect(scene.assets.foo).not.toBeUndefined();
			expect(scene.assets.bar).toBeUndefined();
			expect(scene.assets.baa).not.toBeUndefined();
			expect(scene.asset.getImageById("foo").path).toBe("/path1.png");
			expect(() => scene.asset.getImage("/unexistent.png")).toThrowError("AssertionError");
			done();
		});
		scene._load();
	});

	it("loads storage", done => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const scene = new Scene({
			game: game,
			storageKeys: keys,
			name: "SceneLoadsStorage"
		});

		game.storage._registerLoad((keys, loader) => {
			loader._onLoaded(values);
		});
		scene._ready.add(() => {
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.storageValues.get(0)).toBe(values[0]);
			done();
		});
		scene._load();
	});

	it("serializedValues", done => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];

		const scene = new Scene({ game: game, storageKeys: keys });

		game.storage._registerLoad((keys, loader) => {
			loader._onLoaded(values);
		});
		scene._ready.add(() => {
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.serializeStorageValues()).toBeUndefined();
			done();
		});
		scene._load();
	});

	it("loads storage - with serialization", done => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const serializedValues = [[{ data: "orange" }]];

		const scene = new Scene({
			game: game,
			storageKeys: keys,
			storageValuesSerialization: "myserialization1"
		});

		game.storage._registerLoad((keys, loader) => {
			if (!loader._valueStoreSerialization) {
				loader._onLoaded(values);
			} else {
				expect(loader._valueStoreSerialization).toBe("myserialization1");
				loader._onLoaded(serializedValues);
			}
		});
		scene._ready.add(() => {
			expect(scene._storageLoader._loaded).toBe(true);
			expect(scene.serializeStorageValues()).toBe("myserialization1");
			expect(scene.storageValues.get(0)).toBe(serializedValues[0]);
			done();
		});
		scene._load();
	});

	it("loads assets and storage", done => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const scene = new Scene({
			game: game,
			storageKeys: keys,
			assetIds: ["foo", "baa"]
		});

		game.storage._registerLoad((k, l) => {
			l._onLoaded(values);
		});

		scene._ready.add(() => {
			expect(scene._storageLoader).toBeDefined();
			expect(scene.storageValues.get(0)).toBe(values[0]);
			expect(scene.assets.foo).toBeDefined();
			expect(scene.assets.baa).toBeDefined();
			done();
		});
		scene._load();
	});

	it("prefetch - called after _load()", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(() => {
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(false);
			done();
		});

		scene._load();
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(false);

		setTimeout(() => {
			scene.prefetch();
			expect(scene._prefetchRequested).toBe(false); // _load() 後の呼び出しでは prefetch() の呼び出しを無視する
			expect(scene._assetHolder.waitingAssetsCount).toBe(2); // _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
			game.resourceFactory.flushDelayedAssets();
		}, 0);
	});

	it("prefetch - called twice", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(() => {
			done();
		});
		scene.prefetch();
		scene.prefetch();
		game.resourceFactory.flushDelayedAssets();
		setTimeout(() => {
			scene._load();
		}, 0);
	});

	it("prefetch - with no assets", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({ game: game });
		game.resourceFactory.createsDelayedAsset = true;

		scene._ready.add(() => {
			done();
		});
		scene.prefetch();
		game.resourceFactory.flushDelayedAssets();
		setTimeout(() => {
			scene._load();
		}, 0);
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
	it("prefetch - prefetch-(asset loaded)-_load-loaded", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;
		let ready = false;

		scene._ready.add(() => {
			expect(ready).toBe(true);
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets(); // (c)

		setTimeout(() => {
			ready = true;
			scene._load(); // (b)
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(true);
		}, 0);
	});

	// 上記コメント (5b) のケース
	it("prefetch - prefetch-_loaded-(asset loaded)-loaded", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;
		let ready = false;

		scene._ready.add(() => {
			expect(ready).toBe(true);
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(false);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2);
		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);

		scene._load(); // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2); // _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
		ready = true;
		game.resourceFactory.flushDelayedAssets(); // (c)
	});

	// 上記コメント (5c) のケース
	it("prefetch - prefetch-(asset loaded)-_load-(storage loaded)-loaded", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [{ data: "apple" }];
		const scene = new Scene({
			game: game,
			storageKeys: keys,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		let notifyStorageLoaded = (...args: any[]) => {
			fail("storage load not started");
		};
		game.storage._registerLoad((k, l) => {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});

		let ready = false;
		scene._ready.add(() => {
			expect(ready).toBe(true);
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets(); // (c)

		setTimeout(() => {
			scene._load(); // (b)
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(true);

			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			ready = true;
			notifyStorageLoaded(values); // (d)
		}, 0);
	});

	// 上記コメント (5d) のケース
	it("prefetch - prefetch-_load-(asset loaded)-(storage loaded)-loaded", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const scene = new Scene({
			game: game,
			storageKeys: keys,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		let notifyStorageLoaded = (...args: any[]) => {
			fail("storage load not started");
		};
		game.storage._registerLoad((k, l) => {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});
		let ready = false;

		scene._ready.add(() => {
			expect(ready).toBe(true);
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2);

		scene._load(); // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);

		expect(scene._assetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets(); // (c)

		setTimeout(() => {
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			ready = true;
			notifyStorageLoaded(values); // (d)
		}, 0);
	});

	// 上記コメント (5e) のケース
	it("prefetch - prefetch-_load-(storage loaded)-(asset loaded)-loaded", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [{ data: "apple" }];
		const scene = new Scene({
			game: game,
			storageKeys: keys,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		let notifyStorageLoaded = (...args: any[]) => {
			fail("storage load not started");
		};
		game.storage._registerLoad((k, l) => {
			notifyStorageLoaded = l._onLoaded.bind(l);
		});

		let ready = false;
		scene._ready.add(() => {
			expect(ready).toBe(true);
			expect(scene._assetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._assetHolder.waitingAssetsCount).toBe(2);

		scene._load(); // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);

		notifyStorageLoaded(values); // (d)

		expect(scene._assetHolder.waitingAssetsCount).toBe(2);
		ready = true;
		game.resourceFactory.flushDelayedAssets(); // (c)
	});

	it("loads assets dynamically", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});

		game._loaded.add(() => {
			const scene = new Scene({
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
			scene.loaded.add(() => {
				const foo = scene.assets.foo;
				const dynamicImage = scene.assets.dynamicImage as ImageAsset;
				expect(foo instanceof ImageAsset).toBe(true);
				expect(foo.id).toBe("foo");
				expect(dynamicImage instanceof ImageAsset).toBe(true);
				expect(dynamicImage.width).toBe(10);

				let loaded = false;
				scene.requestAssets(
					[
						"baa",
						{
							id: "zooAudio",
							type: "audio",
							duration: 450,
							systemId: "sound",
							uri: "http://dummy.unused.example/zoo"
						}
					],
					() => {
						loaded = true;
						const baa = scene.assets.baa as ImageAsset;
						const zoo = scene.assets.zooAudio as AudioAsset;
						expect(baa instanceof ImageAsset).toBe(true);
						expect(baa.id).toBe("baa");
						expect(baa.width).toBe(1);
						expect(zoo instanceof AudioAsset).toBe(true);
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
					}
				);

				// Scene#requestAssets() のハンドラ呼び出しは Game#tick() に同期しており、実ロードの完了後に tick() が来るまで遅延される。
				// テスト上は tick() を呼び出さないので、 _flushSceneChangeRequests() を呼び続けることで模擬する。
				function flushUntilLoaded(): void {
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

	it("does not crash even if destroyed while loading assets", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo", "baa"]
		});
		game.resourceFactory.createsDelayedAsset = true;

		scene._load();
		scene.destroy();
		game.resourceFactory.flushDelayedAssets();

		setTimeout(() => {
			done();
		}, 0);
	});

	it("handles asset loading failure", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo"]
		});

		let failureCount = 0;
		let loadedCount = 0;
		scene.assetLoaded.add(asset => {
			expect(asset instanceof Asset).toBe(true);
			expect(asset.id).toBe("foo");
			expect(failureCount).toBe(2);
			++loadedCount;
		});
		scene.assetLoadFailed.add(failureInfo => {
			expect(failureInfo.asset instanceof Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.name).toBe("AssetLoadError");
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			++failureCount;
		});
		scene._ready.add(() => {
			expect(failureCount).toBe(2);
			expect(loadedCount).toBe(1);
			expect(scene.assets.foo).not.toBeUndefined();
			done();
		});

		game.resourceFactory.withNecessaryRetryCount(2, () => {
			scene._load();
		});
	});

	it("handles asset loading failure - unhandled", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo"]
		});

		scene._ready.add(() => {
			expect(scene.assets.foo).not.toBeUndefined();
			done();
		});

		game.resourceFactory.withNecessaryRetryCount(2, () => {
			scene._load();
		});
	});

	it("handles asset loading - retry limit exceed", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo"]
		});

		let failureCount = 0;
		scene.assetLoaded.add(asset => {
			fail("should not be loaded");
		});
		scene.assetLoadFailed.add(failureInfo => {
			expect(failureInfo.asset instanceof Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			++failureCount;

			if (!failureInfo.error.retriable) {
				expect(failureInfo.error.name).toBe("AssetLoadError");
				expect(failureCount).toBe(AssetManager.MAX_ERROR_COUNT + 1);
				done();
			}
		});
		scene._ready.add(() => {
			fail("should not fire loaded");
		});

		game.resourceFactory.withNecessaryRetryCount(AssetManager.MAX_ERROR_COUNT + 1, () => {
			scene._load();
		});
	});

	it("handles asset loading - giving up", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: assetsConfiguration
		});
		const scene = new Scene({
			game: game,
			assetIds: ["foo"]
		});

		let failureCount = 0;
		scene.assetLoaded.add(asset => {
			fail("should not be loaded");
		});
		scene.assetLoadFailed.add(failureInfo => {
			expect(failureInfo.asset instanceof Asset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			expect(failureCount).toBe(0);
			++failureCount;

			failureInfo.cancelRetry = true;
			setTimeout(() => {
				expect(game.leftGame).toBe(true);
				done();
			}, 0);
		});
		scene._ready.add(() => {
			fail("should not fire loaded");
		});

		game.resourceFactory.withNecessaryRetryCount(AssetManager.MAX_ERROR_COUNT + 1, () => {
			scene._load();
		});
	});

	it("cannot access undeclared assets", done => {
		const scene = new Scene({
			game: game,
			assetIds: ["foo"]
		});

		scene._ready.add(() => {
			const child = new Scene({
				game: game,
				assetIds: ["foo", "baa"]
			});

			child._ready.add(() => {
				expect(scene.assets.foo).not.toBeUndefined();
				expect(scene.assets.baa).toBeUndefined();
				expect(scene.assets.zoo).toBeUndefined();

				expect(child.assets.foo).not.toBeUndefined();
				expect(child.assets.baa).not.toBeUndefined();
				expect(child.assets.zoo).toBeUndefined();
				done();
			});
			child._load();
		});
		scene._load();
	});

	it("modified", () => {
		const scene = new Scene({ game: game });
		scene.modified();
		expect(scene.game._modified).toEqual(true);
	});

	it("state", done => {
		const scene = new Scene({ game: game });
		let raisedEvent = false;
		const stateChangeHandler = () => {
			raisedEvent = true;
		};
		scene.stateChanged.add(stateChangeHandler);

		const sceneLoaded = () => {
			expect(scene.state).toBe(SceneState.Active);
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		};
		const scene2Loaded = () => {
			expect(scene.state).toBe(SceneState.Deactive);
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		};
		const steps = [
			() => {
				scene.loaded.add(sceneLoaded);
				game.pushScene(scene);
			},
			() => {
				const scene2 = new Scene({ game: game });
				scene2.loaded.add(scene2Loaded);
				game.pushScene(scene2);
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				expect(scene.state).toBe(SceneState.Active);
				expect(raisedEvent).toBe(true);
				raisedEvent = false;
				nextStep();
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				expect(scene.state).toBe(SceneState.Destroyed);
				expect(raisedEvent).toBe(true);
				done();
			}
		];
		let stepIndex = -1;
		const nextStep = () => {
			setTimeout(() => {
				steps[++stepIndex]();
				game._flushSceneChangeRequests();
			}, 0);
		};

		expect(scene.state).toBe(SceneState.Standby);
		nextStep();
	});

	it("state - change order and count", done => {
		const expected = [
			["S1", "Active"],
			["S1", "BeforeDestroyed"],
			["S1", "Destroyed"],
			["S2", "Active"],
			["S2", "Deactive"],
			["S3", "Active"],
			["S3", "BeforeDestroyed"],
			["S3", "Destroyed"],
			["S4", "Active"],
			["S4", "BeforeDestroyed"],
			["S4", "Destroyed"],
			["S2", "Active"],
			["S2", "BeforeDestroyed"],
			["S2", "Destroyed"]
		];
		const actual: [string, string][] = [];
		function stateChangeHandler(state: SceneState): void {
			actual.push([this._testName, SceneState[state]]);
		}
		function makeScene(name: string): Scene {
			const scene = new Scene({ game: game });
			(scene as any)._testName = name;
			scene.stateChanged.add(stateChangeHandler, scene);
			return scene;
		}

		const steps = [
			() => {
				const scene1 = makeScene("S1");
				scene1.loaded.add(nextStep);
				game.pushScene(scene1);
			},
			() => {
				const scene2 = makeScene("S2");
				scene2.loaded.add(nextStep);
				game.replaceScene(scene2);
			},
			() => {
				const scene3 = makeScene("S3");
				scene3.loaded.add(nextStep);
				game.pushScene(scene3);
			},
			() => {
				const scene4 = makeScene("S4");
				scene4.loaded.add(nextStep);
				game.replaceScene(scene4);
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				expect(actual).toEqual(expected);
				done();
			}
		];
		let stepIndex = -1;
		const nextStep = () => {
			setTimeout(() => {
				steps[++stepIndex]();
				game._flushSceneChangeRequests();
			}, 0);
		};

		nextStep();
	});

	it("createTimer/deleteTimer", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene = runtime.scene;
		const timer = scene.createTimer(100);
		expect(scene._timer._timers.length).toBe(1);
		expect(scene._timer._timers[0]).toBe(timer);
		timer.elapsed.add(() => {
			fail("invalid call");
		}, undefined);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		timer.elapsed.removeAll({ owner: undefined });
		expect(scene._timer._timers.length).toBe(1);
		let success = false;
		timer.elapsed.add(() => {
			success = true;
		});
		game.tick(true);
		expect(success).toBe(true);

		expect(timer.canDelete()).toBe(false);
		timer.elapsed.removeAll();
		expect(timer.canDelete()).toBe(true);

		scene.deleteTimer(timer);
		expect(scene._timer._timers.length).toBe(0);
	});

	it("setInterval/clearInterval", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene1 = game.scene();
		let state1 = false;
		let success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		const holder1 = scene1.setInterval(() => {
			if (!state1) fail("fail1");
			success1 = true;
		}, 100);
		expect(scene1._timer._timers.length).toBe(1);

		game.tick(true);
		game.tick(true);
		game.tick(true);
		state1 = true;
		game.tick(true);
		expect(success1).toBe(true);

		const scene2 = new Scene({ game: game });
		let success2 = false;
		let state2 = false;
		game.pushScene(scene2);
		game._flushSceneChangeRequests();
		state1 = false;
		const holder2 = scene2.setInterval(() => {
			if (!state2) fail("fail2");
			success2 = true;
		}, 50);
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);
		const holder3 = scene2.setInterval(() => {
			// do nothing
		}, 50);
		expect(scene2._timer._timers.length).toBe(1);
		game.tick(true);
		state2 = true;
		game.tick(true);
		expect(success2).toBe(true);
		game.tick(true, 10); // どれだけ時間経過してもscene1のtimerは呼ばれない

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

	it("setTimeout - deprecated", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene1 = game.scene();
		let state1 = false;
		let success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		const holder1 = scene1.setTimeout(() => {
			if (!state1) fail("fail1");
			success1 = true;
		}, 100);
		expect(scene1._timer._timers.length).toBe(1);

		game.tick(true);
		game.tick(true);
		game.tick(true);
		state1 = true;
		game.tick(true);
		expect(success1).toBe(true);
		state1 = false;
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		expect(scene1._timer._timers.length).toBe(0);
	});

	it("setTimeout", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene = game.scene();
		const owner = {};
		let callCount = 0;
		scene.setTimeout(
			function(): void {
				expect(this).toBe(owner);
				callCount++;
			},
			100,
			owner
		);

		game.tick(true);
		game.tick(true);
		game.tick(true);
		expect(callCount).toBe(0);
		game.tick(true);
		expect(callCount).toBe(1);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		expect(callCount).toBe(1);
	});

	it("clearTimeout", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene1 = game.scene();

		expect(scene1._timer._timers.length).toBe(0);
		const holder1 = scene1.setTimeout(() => {
			fail("fail1");
		}, 100);
		expect(scene1._timer._timers.length).toBe(1);
		scene1.clearTimeout(holder1);
		expect(scene1._timer._timers.length).toBe(0);

		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		game.tick(true);
	});

	it("setInterval - release scene", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, main: "" });
		const game = runtime.game;
		const scene1 = game.scene();
		const state2 = false;

		expect(scene1._timer._timers.length).toBe(0);
		scene1.setInterval(() => {
			// do nothing
		}, 100);
		expect(scene1._timer._timers.length).toBe(1);

		const scene2 = new Scene({ game: game });
		game.pushScene(scene2);
		game._flushSceneChangeRequests();
		scene2.setInterval(() => {
			if (!state2) fail("fail2");
		}, 50);
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);
		scene2.setInterval(() => {
			// do nothing
		}, 50);
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers.length).toBe(1);

		game.popScene();
		game._flushSceneChangeRequests();
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers).toBeUndefined();

		const scene3 = new Scene({ game: game });
		game.replaceScene(scene3);
		game._flushSceneChangeRequests();
		expect(scene1._timer._timers).toBeUndefined();
	});

	it("setInterval", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "" });
		const game = runtime.game;
		const scene = game.scene();
		const owner = {};
		let callCount = 0;
		scene.setInterval(
			function(): void {
				expect(this).toBe(owner);
				callCount++;
			},
			100,
			owner
		);

		game.tick(true);
		game.tick(true);
		game.tick(true); // 3/32*1000 = 93.75ms
		expect(callCount).toBe(0);
		game.tick(true); // 4/32*1000 = 125ms
		expect(callCount).toBe(1);
		game.tick(true);
		game.tick(true);
		expect(callCount).toBe(1);
		game.tick(true); // 7/32*1000 = 218.75ms
		expect(callCount).toBe(2);
		game.tick(true);
		game.tick(true);
		expect(callCount).toBe(2);
		game.tick(true); // 10/32*1000 = 312.5ms
		expect(callCount).toBe(3);
	});

	it("isCurrentScene/gotoScene/end", done => {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		const game = new Game({ width: 320, height: 320, main: "" });
		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game: game });
			const scene2 = new Scene({ game: game });
			const scene3 = new Scene({ game: game });

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

	it("gotoScene - AssertionError", done => {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		const game = new Game({ width: 320, height: 320, main: "" });
		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game: game });
			const scene2 = new Scene({ game: game });
			expect(() => {
				scene1.gotoScene(scene2);
			}).toThrowError("AssertionError");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("end - AssertionError", done => {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		const game = new Game({ width: 320, height: 320, main: "" });
		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game: game });
			expect(() => {
				scene1.end();
			}).toThrowError("AssertionError");
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
