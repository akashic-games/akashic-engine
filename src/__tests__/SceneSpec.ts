import { Trigger } from "@akashic/trigger";
import type { AssetConfiguration, DynamicAssetConfiguration, SceneStateString } from "..";
import { AssetManager, E, Scene } from "..";
import { customMatchers, Game, skeletonRuntime, ImageAsset, AudioAsset } from "./helpers";

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
			local: "interpolate-local",
			tickGenerationMode: "manual",
			name: "myScene"
		});
		expect(scene.game).toBe(game);
		expect(scene.onAssetLoad.length).toEqual(0);
		expect(scene.onAssetLoadFailure.length).toEqual(0);
		expect(scene.onAssetLoadComplete.length).toEqual(0);
		expect(scene.onLoad.length).toEqual(0);
		expect(scene.children).not.toBeFalsy();
		expect(scene.children.length).toBe(0);
		expect(scene._sceneAssetHolder._assetIds).toEqual(["foo"]);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(1);
		expect(scene.local).toBe("interpolate-local");
		expect(scene.tickGenerationMode).toBe("manual");
		expect(scene.name).toEqual("myScene");
		expect(scene.vars).toEqual({});

		expect(scene.onUpdate instanceof Trigger).toBe(true);
		expect(scene.onLoad instanceof Trigger).toBe(true);
		expect(scene.onAssetLoad instanceof Trigger).toBe(true);
		expect(scene.onAssetLoadFailure instanceof Trigger).toBe(true);
		expect(scene.onAssetLoadComplete instanceof Trigger).toBe(true);
		expect(scene.onStateChange instanceof Trigger).toBe(true);
		expect(scene.onMessage instanceof Trigger).toBe(true);
		expect(scene.onPointDownCapture instanceof Trigger).toBe(true);
		expect(scene.onPointMoveCapture instanceof Trigger).toBe(true);
		expect(scene.onPointUpCapture instanceof Trigger).toBe(true);
		expect(scene.onOperation instanceof Trigger).toBe(true);
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
		scene1.insertBefore(e, undefined);
		expect(e.parent).toBe(scene1);
		scene2.insertBefore(e, undefined);
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

		scene._onReady.add(() => {
			expect(scene.assets.foo).not.toBeUndefined();
			expect(scene.assets.bar).toBeUndefined();
			expect(scene.assets.baa).not.toBeUndefined();
			expect(scene.asset.getImageById("foo").path).toBe("/path1.png");
			expect(() => scene.asset.getImage("/unexistent.png")).toThrowError("AssertionError");
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

		scene._onReady.add(() => {
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(false);
			done();
		});

		scene._load();
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(false);

		setTimeout(() => {
			scene.prefetch();
			// _load() 後の呼び出しでは prefetch() の呼び出しを無視する
			expect(scene._prefetchRequested).toBe(false);
			// _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
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

		scene._onReady.add(() => {
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

		scene._onReady.add(() => {
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
	// loadedのタイミングに関係するのは、現バージョンにおいてはアセット読み込み(prefetch(), _load()が引き起こす)のみである。
	// 関連する事象を以下のように置く:
	//   a) prefetch() 呼び出し
	//   b) _load() 呼び出し
	//   c) アセット読み込み完了
	//   d) loaded 発火

	// ただしここで X -> Y は「YはXの後に生じる」ことを表す。実装から、明らかに_load()後のprefetch()は
	// 単に無視される。したがって (b -> a) のパスを改めて確認する必要はない。テストすべきケースは常に
	//     a -> b        -- (2)
	// また AssetManager#requestAssets() の呼び出し箇所から、c は a または b の後にのみ生じる。よって (2) から
	//     a -> c        -- (3)
	// さてここで我々が確認すべきことは「d は常に b, c の後に生じる」である。
	// 以上を踏まえると、確認すべきケースは次の二つである:
	//     a -> c -> b         -- (4a)
	//     a -> b -> c         -- (4b)
	// このいずれのケースでも、すべての後に d が生じることをテストすればよい。

	// 上記コメント (4a) のケース
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

		scene._onReady.add(() => {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		game.resourceFactory.flushDelayedAssets(); // (c)

		setTimeout(() => {
			ready = true;
			scene._load(); // (b)
			expect(scene._loaded).toBe(true);
			expect(scene._prefetchRequested).toBe(true);
		}, 0);
	});

	// 上記コメント (4b) のケース
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

		scene._onReady.add(() => {
			expect(ready).toBe(true);
			expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(0);
			done();
		});

		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(false);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2);
		scene.prefetch(); // (a)
		expect(scene._loaded).toBe(false);
		expect(scene._prefetchRequested).toBe(true);

		scene._load(); // (b)
		expect(scene._loaded).toBe(true);
		expect(scene._prefetchRequested).toBe(true);
		expect(scene._sceneAssetHolder.waitingAssetsCount).toBe(2); // _load() / prefetch() されていても flushDelayedAssets() してないので読み込みが終わっていない
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

		game._onLoad.add(() => {
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
			scene.onLoad.add(() => {
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
						game._flushPostTickTasks();
						expect(foo.destroyed()).toBe(true);
						expect(dynamicImage.destroyed()).toBe(true);
						expect(baa.destroyed()).toBe(true);
						expect(zoo.destroyed()).toBe(true);
						done();
					}
				);

				// Scene#requestAssets() のハンドラ呼び出しは Game#tick() に同期しており、実ロードの完了後に tick() が来るまで遅延される。
				// テスト上は tick() を呼び出さないので、 _flushPostTickTasks() を呼び続けることで模擬する。
				function flushUntilLoaded(): void {
					if (loaded) return;
					game._flushPostTickTasks();
					setTimeout(flushUntilLoaded, 10);
				}
				flushUntilLoaded();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("loads assets dynamically - notifying error through the callback", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "",
			assets: {}
		});

		game._onLoad.add(() => {
			const scene = new Scene({
				game: game
			});
			scene.onLoad.add(() => {
				let loaded = false;

				const assetIds: DynamicAssetConfiguration[] = [
					{
						id: "unregistered-asset-1",
						type: "audio",
						duration: 450,
						systemId: "sound",
						uri: "http://example.com/assets/audio/foo"
					},
					{
						id: "unregistered-asset-2",
						type: "audio",
						duration: 120,
						systemId: "sound",
						uri: "http://example.com/assets/audio/baz"
					}
				];

				game.resourceFactory.withNecessaryRetryCount(-1, () => {
					scene.requestAssets(
						{
							assetIds,
							notifyErrorOnCallback: true
						},
						error => {
							loaded = true;
							expect(error!.name).toBe("RequestAssetLoadError");
							expect(error!.detail).toEqual({
								failureAssetIds: assetIds
							});
							done();
						}
					);

					// Scene#requestAssets() のハンドラ呼び出しは Game#tick() に同期しており、実ロードの完了後に tick() が来るまで遅延される。
					// テスト上は tick() を呼び出さないので、 _flushPostTickTasks() を呼び続けることで模擬する。
					function flushUntilLoaded(): void {
						if (loaded) return;
						game._flushPostTickTasks();
						setTimeout(flushUntilLoaded, 10);
					}
					flushUntilLoaded();
				});
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
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
		scene.onAssetLoad.add(asset => {
			expect(asset instanceof ImageAsset).toBe(true);
			expect(asset.id).toBe("foo");
			expect(failureCount).toBe(2);
			++loadedCount;
		});
		scene.onAssetLoadFailure.add(failureInfo => {
			expect(failureInfo.asset instanceof ImageAsset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.name).toBe("AssetLoadError");
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			++failureCount;
		});
		scene._onReady.add(() => {
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

		scene._onReady.add(() => {
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
		scene.onAssetLoad.add(() => {
			fail("should not be loaded");
		});
		scene.onAssetLoadFailure.add(failureInfo => {
			expect(failureInfo.asset instanceof ImageAsset).toBe(true);
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
		scene._onReady.add(() => {
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
		scene.onAssetLoad.add(() => {
			fail("should not be loaded");
		});
		scene.onAssetLoadFailure.add(failureInfo => {
			expect(failureInfo.asset instanceof ImageAsset).toBe(true);
			expect(failureInfo.asset.id).toBe("foo");
			expect(failureInfo.error instanceof Error).toBe(true);
			expect(failureInfo.error.retriable).toBe(true);
			expect(failureInfo.cancelRetry).toBe(false);
			expect(failureCount).toBe(0);
			++failureCount;

			failureInfo.cancelRetry = true;
			setTimeout(() => {
				expect(game.terminatedGame).toBe(true);
				done();
			}, 0);
		});
		scene._onReady.add(() => {
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

		scene._onReady.add(() => {
			const child = new Scene({
				game: game,
				assetIds: ["foo", "baa"]
			});

			child._onReady.add(() => {
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
		const stateChangeHandler = (): void => {
			raisedEvent = true;
		};
		scene.onStateChange.add(stateChangeHandler);

		const sceneLoaded = (): void => {
			expect(scene.state).toBe("active");
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		};
		const scene2Loaded = (): void => {
			expect(scene.state).toBe("deactive");
			expect(raisedEvent).toBe(true);
			raisedEvent = false;

			nextStep();
		};
		const steps = [
			() => {
				scene.onLoad.add(sceneLoaded);
				game.pushScene(scene);
			},
			() => {
				const scene2 = new Scene({ game: game });
				scene2.onLoad.add(scene2Loaded);
				game.pushScene(scene2);
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				expect(scene.state).toBe("active");
				expect(raisedEvent).toBe(true);
				raisedEvent = false;
				nextStep();
			},
			() => {
				game.popScene();
				nextStep();
			},
			() => {
				expect(scene.state).toBe("destroyed");
				expect(raisedEvent).toBe(true);
				done();
			}
		];
		let stepIndex = -1;
		const nextStep = (): void => {
			setTimeout(() => {
				steps[++stepIndex]();
				game._flushPostTickTasks();
			}, 0);
		};

		expect(scene.state).toBe("standby");
		nextStep();
	});

	it("state - change order and count", done => {
		const expected = [
			["S1", "active"],
			["S2", "active"],
			["S1", "before-destroyed"],
			["S1", "destroyed"],
			["S2", "deactive"],
			["S3", "active"],
			["S4", "active"],
			["S3", "before-destroyed"],
			["S3", "destroyed"],
			["S2", "active"],
			["S4", "before-destroyed"],
			["S4", "destroyed"],
			["S2", "before-destroyed"],
			["S2", "destroyed"]
		];
		const actual: [string, string][] = [];
		function stateChangeHandler(this: Scene, state: SceneStateString): void {
			actual.push([this.name!, state]);
		}
		function makeScene(name: string): Scene {
			const scene = new Scene({ game: game, name });
			scene.onStateChange.add(stateChangeHandler, scene);
			return scene;
		}

		const steps = [
			() => {
				const scene1 = makeScene("S1");
				scene1.onLoad.add(nextStep);
				game.pushScene(scene1);
			},
			() => {
				const scene2 = makeScene("S2");
				scene2.onLoad.add(nextStep);
				game.replaceScene(scene2);
			},
			() => {
				const scene3 = makeScene("S3");
				scene3.onLoad.add(nextStep);
				game.pushScene(scene3);
			},
			() => {
				const scene4 = makeScene("S4");
				scene4.onLoad.add(nextStep);
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
		const nextStep = (): void => {
			setTimeout(() => {
				steps[++stepIndex]();
				game._flushPostTickTasks();
			}, 0);
		};

		nextStep();
	});

	it("createTimer/deleteTimer", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene = runtime.scene;
		const timer = scene.createTimer(100);
		expect(scene._timer._timers.length).toBe(1);
		expect(scene._timer._timers[0]).toBe(timer);
		timer.onElapse.add(() => {
			fail("invalid call");
		}, undefined);
		game.tick(true);
		game.tick(true);
		game.tick(true);
		timer.onElapse.removeAll({ owner: undefined });
		expect(scene._timer._timers.length).toBe(1);
		let success = false;
		timer.onElapse.add(() => {
			success = true;
		});
		game.tick(true);
		expect(success).toBe(true);

		expect(timer.canDelete()).toBe(false);
		timer.onElapse.removeAll();
		expect(timer.canDelete()).toBe(true);

		scene.deleteTimer(timer);
		expect(scene._timer._timers.length).toBe(0);
	});

	it("setInterval/clearInterval", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene1 = game.scene()!;
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
		game._flushPostTickTasks();
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
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene1 = game.scene()!;
		let state1 = false;
		let success1 = false;

		expect(scene1._timer._timers.length).toBe(0);
		scene1.setTimeout(() => {
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
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene = game.scene()!;
		const owner = {};
		let callCount = 0;
		scene.setTimeout(
			function (this: any): void {
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
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene1 = game.scene()!;

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
		const runtime = skeletonRuntime({ width: 320, height: 320, main: "", assets: {} });
		const game = runtime.game;
		const scene1 = game.scene()!;
		const state2 = false;

		expect(scene1._timer._timers.length).toBe(0);
		scene1.setInterval(() => {
			// do nothing
		}, 100);
		expect(scene1._timer._timers.length).toBe(1);

		const scene2 = new Scene({ game: game });
		game.pushScene(scene2);
		game._flushPostTickTasks();
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
		game._flushPostTickTasks();
		expect(scene1._timer._timers.length).toBe(1);
		expect(scene2._timer._timers).toBeUndefined();

		const scene3 = new Scene({ game: game });
		game.replaceScene(scene3);
		game._flushPostTickTasks();
		expect(scene1._timer._timers).toBeUndefined();
	});

	it("setInterval", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320, fps: 32, main: "", assets: {} });
		const game = runtime.game;
		const scene = game.scene()!;
		const owner = {};
		let callCount = 0;
		scene.setInterval(
			function (this: any): void {
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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game: game });
			const scene2 = new Scene({ game: game });
			const scene3 = new Scene({ game: game });

			game.pushScene(scene1);
			game._flushPostTickTasks();
			expect(scene1.isCurrentScene()).toBe(true);
			expect(scene2.isCurrentScene()).toBe(false);
			expect(scene3.isCurrentScene()).toBe(false);

			scene1.gotoScene(scene2, true); // push scene2
			game._flushPostTickTasks();
			expect(scene1.isCurrentScene()).toBe(false);
			expect(scene2.isCurrentScene()).toBe(true);
			expect(scene3.isCurrentScene()).toBe(false);

			scene2.end();
			game._flushPostTickTasks();
			expect(scene1.isCurrentScene()).toBe(true);
			expect(scene3.isCurrentScene()).toBe(false);

			scene1.gotoScene(scene3, false); // replace scene1 to scene3
			game._flushPostTickTasks();
			expect(scene3.isCurrentScene()).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("gotoScene - AssertionError", done => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		game._onLoad.add(() => {
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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		game._onLoad.add(() => {
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
