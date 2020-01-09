import {
	AssetConfiguration,
	Camera2D,
	E,
	EventType,
	GameConfiguration,
	ImageAsset,
	LoadingScene,
	LoadingSceneParameterObject,
	LocalTickMode,
	MessageEvent,
	Scene,
	SceneState,
	ScriptAsset,
	SoundAudioSystem,
	XorshiftRandomGenerator
} from "..";
import { customMatchers, EntityStateFlags, Game, Renderer } from "./helpers";

expect.extend(customMatchers);

describe("test Game", () => {
	it("初期化", () => {
		const game = new Game({ width: 320, height: 270, main: "" }, undefined, "foo");
		expect(game._idx).toBe(0);
		expect(game.db).toEqual({});
		expect(game.renderers.length).toBe(0);
		expect(game.scenes.length).toBe(0);
		expect(game.random).toBe(null);
		expect(game.events.length).toBe(0);
		expect(game.modified).toBe(true);
		expect(game.external).toEqual({});
		expect(game.age).toBe(0);
		expect(game.fps).toBe(30);
		expect(game.width).toBe(320);
		expect(game.height).toBe(270);
		expect(game.selfId).toBe("foo");
		expect(game.playId).toBe(undefined);
		expect(game.skippingChanged).not.toBe(undefined);
		expect(game).toHaveProperty("_assetManager");
		expect(game).toHaveProperty("_initialScene");
	});

	it("_destroy()", () => {
		const game = new Game({ width: 320, height: 270, main: "" }, undefined, "foo");
		game._destroy();
		expect(game.db).toBe(undefined);
		expect(game.renderers).toBe(undefined);
		expect(game.scenes).toBe(undefined);
		expect(game.random).toBe(undefined);
		expect(game.events).toBe(undefined);
		expect(game.modified).toBe(false);
		expect(game.external).toEqual({}); // external は触らない
		expect(game.vars).toEqual({}); // vars も触らない
		expect(game.playId).toBe(undefined);
		expect(game.skippingChanged).toBe(undefined);
	});

	it("global assets", done => {
		const game = new Game({
			width: 320,
			height: 270,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/dummypath.png",
					virtualPath: "dummypath.png",
					global: true,
					width: 1,
					height: 1
				},
				bar: {
					type: "text",
					path: "/dummypath.txt",
					virtualPath: "dummypath.txt"
				}
			}
		});

		game._loaded.add(() => {
			expect(game.assets.foo).not.toBe(undefined);
			expect(game.assets.foo instanceof ImageAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("bar");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("_loadAndStart", done => {
		const assets: {[id: string]: AssetConfiguration} = {
			mainScene: {
				// _loadAndStart() には mainScene が必要
				type: "script",
				path: "/dummy/dummy.js", // パスはダミーであり使用されてはいない。tsのScriptAssetを参照のこと
				virtualPath: "dummy/dummy.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" });

		let loadedFired = false;
		game._loaded.add(() => {
			loadedFired = true;
		});
		game._started.add(() => {
			expect(loadedFired).toBe(true);
			expect(game.assets.mainScene).not.toBe(undefined);
			expect(game.assets.mainScene instanceof ScriptAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("foo");
			done();
		});
		game._loadAndStart();
	});

	it("must fire 'loaded' of mainScene at age 0", done => {
		const assets: {[id: string]: AssetConfiguration} = {
			mainScene: {
				// _loadAndStart() には mainScene が必要
				type: "script",
				path: "./script/mainScene.js",
				virtualPath: "script/mainScene.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./script/mainScene.js" });
		game.resourceFactory.scriptContents["./script/mainScene.js"] = "module.exports = () => g.game.__test__();";

		let testPass = false;
		function requestTick(): void {
			if (!testPass) {
				game.classicTick();
				setTimeout(requestTick, 1);
				return;
			}
			done();
		}

		(game as any).__test__ = () => {
			const scene = new Scene({ game: game });
			expect(game.age).toBe(0);
			scene.loaded.add(() => {
				expect(game.age).toBe(0);
				testPass = true;
			});
			game.pushScene(scene);
			requestTick();
			return scene;
		};
		game._loadAndStart();
	});

	it("_loadAndStart - with entry point", done => {
		const assets: {[id: string]: AssetConfiguration} = {
			dummy: {
				type: "script",
				path: "/dummy/dummy.js", // パスはダミー
				virtualPath: "dummy/dummy.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" }, "/");
		let loadedFired = false;
		game._loaded.add(() => {
			loadedFired = true;
		});
		game._started.add(() => {
			expect(loadedFired).toBe(true);
			expect(game.assets.dummy).not.toBe(undefined);
			expect(game.assets.dummy instanceof ScriptAsset).toBe(true);
			done();
		});
		game._loadAndStart({ args: "arg-value" });
	});

	it("_loadAndStart - after loaded", done => {
		const assets: {[id: string]: AssetConfiguration} = {
			mainScene: {
				type: "script",
				path: "/script/mainScene.js",
				virtualPath: "script/mainScene.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./script/mainScene.js" }, "/");
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = () => { return g.game.__test__(); };";

		(game as any).__test__ = () => {
			delete game.resourceFactory.scriptContents["/script/mainScene.js"];
			done();
			return new Scene({ game: game });
		};

		game._loaded.add(() => {
			const scene = new Scene({ game: game });
			scene.loaded.add(() => {
				game._loadAndStart();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			expect(() => {
				game._startLoadingGlobalAssets();
			}).toThrowError("AssertionError");
		});
		game._startLoadingGlobalAssets();
	});

	it("pushScene", done => {
		const game = new Game({ width: 320, height: 320, main: "" });

		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game });
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene]);
			const scene2 = new Scene({ game: game });
			game.pushScene(scene2);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene, scene2]);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("popScene", done => {
		const game = new Game({ width: 320, height: 320, main: "" });

		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game, name: "SCENE1" });
			const scene2 = new Scene({ game: game, name: "SCENE2" });
			game.pushScene(scene);
			game.pushScene(scene2);
			game.popScene();
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene]);
			game.popScene();
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene]);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("popScene - specified step", done => {
		const game = new Game({ width: 320, height: 320, main: "" });

		game._loaded.add(() => { // game.scenes テストのため _loaded を待つ必要がある
			// popSceneで指定したシーンまで戻る際に経過したシーンは全て削除
			const scene = new Scene({ game: game, name: "SCENE1" });
			const scene2 = new Scene({ game: game, name: "SCENE2" });
			const scene3 = new Scene({ game: game, name: "SCENE3" });
			game.pushScene(scene);
			game.pushScene(scene2);
			game.pushScene(scene3);
			game.popScene(false, 2);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene]);
			expect(scene.destroyed()).toBe(false);
			expect(scene2.destroyed()).toBe(true);
			expect(scene3.destroyed()).toBe(true);

			// popSceneで指定したシーンまで戻る際に経過したシーンは全て残す
			const scene2Alpha = new Scene({ game: game, name: "SCENE2_Alpha" });
			const scene3Beta = new Scene({ game: game, name: "SCENE3_Beta" });
			game.pushScene(scene2Alpha);
			game.pushScene(scene3Beta);
			game.popScene(true, 3);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene]);
			expect(scene.destroyed()).toBe(false);
			expect(scene2Alpha.destroyed()).toBe(false);
			expect(scene3Beta.destroyed()).toBe(false);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("replaceScene", done => {
		const game = new Game({ width: 320, height: 320, main: "" });

		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game });
			const scene2 = new Scene({ game: game });
			game.pushScene(scene);
			game.replaceScene(scene2);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene2]);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("tick", done => {
		const assets: {[id: string]: AssetConfiguration} = {
			mainScene: {
				// _loadAndStart() には mainScene が必要
				type: "script",
				path: "./dummy/dummy.js", // パスはダミーであり使用されてはいない。tsのScriptAssetを参照のこと
				virtualPath: "dummy/dummy.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" });
		game._loaded.add(() => {
			const scene = new Scene({ game: game });
			game.pushScene(scene);
			expect(game.age).toBe(0);
			expect(game.classicTick()).toBe(true);
			expect(game.scene().local).toBe(LocalTickMode.NonLocal);
			expect(game.classicTick()).toBe(false);
			expect(game.age).toBe(1);
			expect(game.tick(false, 3)).toBe(false);
			expect(game.age).toBe(1);
			expect(game.isLastTickLocal).toBe(true);
			expect(game.lastOmittedLocalTickCount).toBe(3);
			expect(game.tick(true)).toBe(false);
			expect(game.age).toBe(2);
			expect(game.isLastTickLocal).toBe(false);
			expect(game.lastOmittedLocalTickCount).toBe(0);
			done();
		});
		game._loadAndStart();
	});

	it("loadingScene - without assets", done => {
		const game = new Game({
			width: 320,
			height: 320,
			fps: 30,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1
				}
			}
		});
		let logs: string[] = [];

		class TestLoadingScene extends LoadingScene {
			constructor(param: LoadingSceneParameterObject) {
				super(param);
				this.loaded.add(() => {
					logs.push("LoadingSceneLoaded");
				});
				this.targetReady.add(() => {
					logs.push("TargetLoaded");
				}, this);
			}
		}

		const loadingScene = new TestLoadingScene({
			game: game,
			name: "testLoadingScene"
		});

		game._loaded.add(() => {
			game.loadingScene = loadingScene;

			class MockScene1 extends Scene {
				_load(): void {
					logs.push("SceneLoad");
					super._load();
				}
			}

			const scene = new MockScene1({
				game: game,
				assetIds: ["foo"],
				name: "scene1"
			});
			scene.assetLoaded.add(a => {
				logs.push("SceneAssetLoaded");
			});
			scene.loaded.add(() => {
				expect(logs).toEqual([
					"LoadingSceneLoaded", // これ(LoagingSceneの読み込み完了)の後に
					"SceneLoad", // 遷移先シーンの読み込みが開始されることが重要
					"SceneAssetLoaded",
					"TargetLoaded"
				]);

				// LoadingScene の読み込みが終わっている状態でのシーン遷移をテスト
				logs = [];

				class MockScene2 extends Scene {
					_load(): void {
						logs.push("Scene2Load");
						super._load();
					}
				}

				const scene2 = new MockScene2({ game: game, assetIds: ["foo"] });
				scene2.assetLoaded.add(a => {
					logs.push("Scene2AssetLoaded");
				});
				scene2.loaded.add(() => {
					expect(logs).toEqual(["Scene2Load", "Scene2AssetLoaded", "TargetLoaded"]);

					setTimeout(() => {
						expect(game.loadingScene.loaded.length).toBe(1); // loadingSceneのloadedハンドラが増えていかないことを確認
						done();
					}, 1);
				});
				game.pushScene(scene2);
				game._flushSceneChangeRequests();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("loadingScene - with assets", done => {
		const game = new Game({
			width: 320,
			height: 320,
			fps: 30,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1
				},
				zoo: {
					type: "audio",
					path: "/path/to/a/file",
					virtualPath: "path/to/a/file",
					systemId: "sound",
					duration: 1984
				}
			}
		});
		let logs: string[] = [];

		class TestLoadingScene extends LoadingScene {
			constructor(param: LoadingSceneParameterObject) {
				super(param);
				this.assetLoaded.add(() => {
					logs.push("LoadingSceneAssetLoaded");
				});
				this.loaded.add(() => {
					logs.push("LoadingSceneLoaded");
				});
				this.targetReady.add(() => {
					logs.push("TargetLoaded");
				}, this);
			}
		}

		const loadingScene = new TestLoadingScene({
			game: game,
			assetIds: ["foo", "zoo"]
		});

		game._loaded.add(() => {
			game.loadingScene = loadingScene;

			class MockScene1 extends Scene {
				_load(): void {
					logs.push("SceneLoad");
					super._load();
				}
			}

			const scene = new MockScene1({ game: game, assetIds: ["zoo"] });
			scene.assetLoaded.add(a => {
				logs.push("SceneAssetLoaded");
			});
			scene.loaded.add(() => {
				expect(logs).toEqual([
					"LoadingSceneAssetLoaded",
					"LoadingSceneAssetLoaded",
					"LoadingSceneLoaded", // これ(LoagingSceneの読み込み完了)の後に
					"SceneLoad", // 遷移先シーンの読み込みが開始されることが重要
					"SceneAssetLoaded",
					"TargetLoaded"
				]);

				// LoadingScene の読み込みが終わっている状態でのシーン遷移をテスト
				logs = [];

				class MockScene2 extends Scene {
					_load(): void {
						logs.push("Scene2Load");
						super._load();
					}
				}

				const scene2 = new MockScene2({ game: game, assetIds: ["zoo"] });
				scene2.assetLoaded.add(a => {
					logs.push("Scene2AssetLoaded");
				});
				scene2.loaded.add(() => {
					expect(logs).toEqual(["Scene2Load", "Scene2AssetLoaded", "TargetLoaded"]);

					setTimeout(() => {
						expect(game.loadingScene.loaded.length).toBe(1); // loadingSceneのloadedハンドラが増えていかないことを確認
						done();
					}, 1);
				});
				game.pushScene(scene2);
				game._flushSceneChangeRequests();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("loadingScene - with assets, manual end", done => {
		const game = new Game({
			width: 320,
			height: 320,
			fps: 30,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1
				},
				zoo: {
					type: "audio",
					path: "/path/to/a/file",
					virtualPath: "path/to/a/file",
					systemId: "sound",
					duration: 1984
				}
			}
		});

		let asyncEndCalled = false;
		let resetCount = 0;
		let invalidEndTrialCount = 0;

		const loadingScene = new LoadingScene({
			game: game,
			assetIds: ["foo", "zoo"],
			explicitEnd: true
		});
		loadingScene.targetReset.add(() => {
			resetCount++;
			expect(loadingScene.getTargetWaitingAssetsCount()).toBe(1); // 下記 const scene の assetIds: ["zoo"] しかこないので
		}, loadingScene);
		loadingScene.targetAssetLoaded.add(() => {
			invalidEndTrialCount++;
			expect(() => {
				loadingScene.end();
			}).toThrow();
		}, loadingScene);
		loadingScene.targetReady.add(() => {
			setTimeout(() => {
				asyncEndCalled = true;
				loadingScene.end();
			}, 10);
		}, loadingScene);

		game._loaded.add(() => {
			game.loadingScene = loadingScene;
			const scene = new Scene({ game: game, assetIds: ["zoo"] });
			scene.loaded.add(() => {
				expect(asyncEndCalled).toBe(true);
				expect(invalidEndTrialCount).toBe(1);
				expect(resetCount).toBe(1);
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("_sceneChanged", done => {
		const gameConfiguration: GameConfiguration = {
			width: 320,
			height: 320,
			fps: 30,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1
				},
				zoo: {
					type: "audio",
					path: "/path/to/a/file",
					virtualPath: "path/to/a/file",
					systemId: "sound",
					duration: 1984
				}
			}
		};
		const game = new Game(gameConfiguration);

		let topIsLocal: LocalTickMode = undefined;
		let sceneChangedCount = 0;
		game._sceneChanged.add(scene => {
			sceneChangedCount++;
			topIsLocal = scene.local;
		});
		game._loaded.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game });
			const scene2 = new Scene({ game: game, assetIds: ["foo"] });
			const scene3 = new Scene({
				game: game,
				assetIds: ["foo", "zoo"],
				local: true
			});

			scene.loaded.add(() => {
				expect(sceneChangedCount).toBe(2); // _initialScene と scene (いずれも loadingSceneなし) で 2
				expect(topIsLocal).toBe(LocalTickMode.NonLocal);
				expect(game.scenes).toEqual([game._initialScene, scene]);
				expect(game._eventTriggerMap[EventType.PointDown]).toBe(scene.pointDownCapture);

				scene2.loaded.add(() => {
					expect(sceneChangedCount).toBe(4); // loadingScene が pop されて 1 増えたので 4
					expect(topIsLocal).toBe(LocalTickMode.NonLocal);
					expect(game.scenes).toEqual([game._initialScene, scene2]);
					expect(game._eventTriggerMap[EventType.PointDown]).toBe(scene2.pointDownCapture);

					scene3.loaded.add(() => {
						expect(sceneChangedCount).toBe(6);
						expect(topIsLocal).toBe(LocalTickMode.FullLocal);
						expect(game.scenes).toEqual([game._initialScene, scene2, scene3]);
						expect(game._eventTriggerMap[EventType.PointDown]).toBe(scene3.pointDownCapture);

						game.popScene();
						game._flushSceneChangeRequests();
						expect(sceneChangedCount).toBe(7);
						expect(topIsLocal).toBe(LocalTickMode.NonLocal);
						expect(game.scenes).toEqual([game._initialScene, scene2]);
						expect(game._eventTriggerMap[EventType.PointDown]).toBe(scene2.pointDownCapture);

						game.popScene();
						game._flushSceneChangeRequests();
						expect(sceneChangedCount).toBe(8);
						expect(topIsLocal).toBe(LocalTickMode.FullLocal);
						expect(game.scenes).toEqual([game._initialScene]);
						expect(game._eventTriggerMap[EventType.PointDown]).toBe(game._initialScene.pointDownCapture);
						done();
					});
					game.pushScene(scene3);
					game._flushSceneChangeRequests();
					expect(sceneChangedCount).toBe(5);
					expect(topIsLocal).toBe(LocalTickMode.FullLocal);
					expect(game.scenes).toEqual([game._initialScene, scene2, scene3, game._defaultLoadingScene]);
					expect(game._eventTriggerMap[EventType.PointDown]).toBe(game._defaultLoadingScene.pointDownCapture);
				});
				game.replaceScene(scene2);
				game._flushSceneChangeRequests();
				expect(sceneChangedCount).toBe(3); // scene2とloadingSceneが乗るが、scene2はまだ_sceneStackTopChangeCountをfireしてない
				expect(topIsLocal).toBe(LocalTickMode.FullLocal); // loadingScene がトップなので local
				expect(game.scenes).toEqual([game._initialScene, scene2, game._defaultLoadingScene]);
				expect(game._eventTriggerMap[EventType.PointDown]).toBe(game._defaultLoadingScene.pointDownCapture);
			});
			expect(sceneChangedCount).toBe(1); // _initialScene (loadingSceneなし) が push された分で 1
			expect(topIsLocal).toBe(LocalTickMode.FullLocal);
			expect(game.scenes).toEqual([game._initialScene]);
			expect(game._eventTriggerMap[EventType.PointDown]).toBe(game._initialScene.pointDownCapture);
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("scene", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game });
		const scene2 = new Scene({ game: game });
		game.pushScene(scene);
		game._flushSceneChangeRequests();
		expect(game.scene()).toBe(scene);
		game.replaceScene(scene2);
		game._flushSceneChangeRequests();
		expect(game.scene()).toBe(scene2);
	});

	it("register", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game });
		const e = new E({ scene: scene });
		expect(e.id).toBe(1);
		expect(game.db).toEqual({ 1: e });
		const e2 = new E({ scene: scene });
		expect(e2.id).toBe(2);
		expect(game.db).toEqual({ 1: e, 2: e2 });
		const n = { id: undefined as any, age: 100 };
		game.register(n as any);
		expect(game.db[n.id]).toEqual(n);

		const e3 = new E({ scene: scene, local: true });
		expect(game._localDb[e3.id].id).toBe(e3.id);
	});

	it("unregister", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game });
		const e = new E({ scene: scene });
		expect(game.db).toEqual({ 1: e });
		game.unregister(e);
		expect(game.db).toEqual({});

		const e2 = new E({ scene: scene, local: true });
		expect(game.db).toEqual({});
		expect(game._localDb[e2.id]).toBe(e2);
		game.unregister(e2);
		expect(game._localDb[e2.id]).toBeUndefined();
	});

	it("leaveGame", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		game.leaveGame();
		expect(game.leftGame).toBe(true);
	});

	it("terminateGame", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game });

		let count = 0;
		scene.update.add(() => {
			++count;
		});
		game.pushScene(scene);
		game._flushSceneChangeRequests();

		game.classicTick();
		expect(count).toBe(1);
		game.classicTick();
		expect(count).toBe(2);

		game.terminateGame();
		expect(game.terminatedGame).toBe(true);
		game.classicTick();
		expect(count).toBe(2);
		game.classicTick();
		expect(count).toBe(2);
	});

	it("no crash on Scene#destroy()", done => {
		const game = new Game({ width: 320, height: 320, main: "" });

		game._loaded.add(() => {
			const scene = new Scene({ game: game });
			let timerFired = false;

			scene.loaded.add(() => {
				scene.update.add(() => {
					game.popScene();
				});
				scene.setInterval(() => {
					// 「update が popScene してシーンを破壊した後にこれを呼ぼうとしてクラッシュする」ことが問題だった
					timerFired = true;
				}, 1);

				game._initialScene.stateChanged.add(state => {
					if (state === SceneState.Active) {
						// ↑のpopScene()後、例外を投げずにシーン遷移してここに来れたらOK
						expect(timerFired).toBe(true);
						done();
					}
				});
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			game.classicTick();
		});
		game._startLoadingGlobalAssets();
	});

	it("raiseEvent", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const ev = new MessageEvent("data");
		const ev2 = new MessageEvent("foo");
		game.raiseEvent(ev);
		game.raiseEvent(ev2);
		expect(game.raisedEvents.length).toBe(2);
		expect(game.raisedEvents[0]).toBe(ev);
		expect(game.raisedEvents[1]).toBe(ev2);
	});

	it("vars", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		expect(game.vars).toEqual({});
		game.vars.myState = "well";
		expect(game.vars.myState).toBe("well");
	});

	it("_reset", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "./script/mainScene.js",
			assets: {
				mainScene: {
					type: "script",
					global: true,
					path: "./script/mainScene.js",
					virtualPath: "script/mainScene.js"
				}
			}
		});
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = () => { const s = new g.Scene({game: g.game}); g.game.pushScene(s);}";
		expect(game.age).toBe(0);
		expect(game.random).toBe(null);

		game._loaded.add(() => {
			expect(game.isLoaded).toBe(true);

			const scene = new Scene({ game: game });
			const scene2 = new Scene({ game: game });
			game.pushScene(scene);
			game.pushScene(scene2);
			game._flushSceneChangeRequests();

			const randGen = new XorshiftRandomGenerator(10);
			game._reset({
				age: 3,
				randGen: randGen
			});

			expect(game.scene()).toBe(game._initialScene);
			expect(game.age).toBe(3);
			expect(game.random).toBe(randGen);
			done();
		});
		game._loadAndStart();
	});

	it("_reset - until loaded _initialScene", done => {
		const game = new Game({
			width: 320,
			height: 320,
			main: "./script/mainScene.js",
			assets: {
				mainScene: {
					type: "script",
					global: true,
					path: "./script/mainScene.js",
					virtualPath: "script/mainScene.js"
				}
			}
		});
		game.resourceFactory.scriptContents["./script/mainScene.js"] = "module.exports = () => { const s = new g.Scene({game: g.game}); g.game.pushScene(s); };";
		expect(game.age).toBe(0);
		expect(game.random).toBe(null);

		let testDone = false;
		game._loaded.add(() => {
			expect(testDone).toBe(true);
			done();
		});

		const loadScene = game._defaultLoadingScene;
		expect(game._initialScene.loaded.contains(game._onInitialSceneLoaded, game)).toBe(true);
		expect(loadScene.loaded.contains(loadScene._doReset, loadScene)).toBe(false);

		game._loadAndStart();
		expect(game.isLoaded).toBe(false); // _loadAndStartしたがまだ読み込みは終わっていない
		expect(game._initialScene.loaded.contains(game._onInitialSceneLoaded, game)).toBe(true);
		expect(game.scenes.length).toBe(2);
		expect(game.scenes[0]).toBe(game._initialScene);
		expect(game.scenes[1]).toBe(loadScene);

		game._reset({ age: 0 });
		const loadScene2 = game._defaultLoadingScene;
		expect(loadScene2).not.toBe(loadScene);
		expect(loadScene.destroyed()).toBe(true);
		expect(game.isLoaded).toBe(false);
		expect(game._initialScene.loaded.contains(game._onInitialSceneLoaded, game)).toBe(true);
		expect(loadScene2.loaded.contains(loadScene2._doReset, loadScene2)).toBe(false);
		expect(game.scenes.length).toBe(0);

		game._loadAndStart();
		expect(game.scenes.length).toBe(2);

		testDone = true;
	});

	it("controls audio volume", () => {
		const game = new Game({ width: 320, height: 320, main: "" });

		expect(game._audioSystemManager._isSuppressed).toBeFalsy();
		expect(game._audioSystemManager._muted).toBe(false);
		expect(() => {
			game._setAudioPlaybackRate(-0.5);
		}).toThrowError("AssertionError");

		expect(game.audio.sound._isSuppressed).toBeFalsy();
		expect(game.audio.music._isSuppressed).toBeFalsy();
		expect(game.audio.sound._muted).toBe(false);
		expect(game.audio.music._muted).toBe(false);

		game._setMuted(true);
		game._setMuted(true); // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game._audioSystemManager._muted).toBe(true);
		expect(game.audio.sound._isSuppressed).toBeFalsy();
		expect(game.audio.music._isSuppressed).toBeFalsy();
		expect(game.audio.sound._muted).toBe(true);
		expect(game.audio.music._muted).toBe(true);

		game._audioSystemManager._isSuppressed = false;
		game._setAudioPlaybackRate(1.7);
		game._setAudioPlaybackRate(1.7); // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game._audioSystemManager._isSuppressed).toBeTruthy();
		expect(game.audio.sound._isSuppressed).toBeTruthy();
		expect(game.audio.music._isSuppressed).toBeTruthy();
		expect(game.audio.sound._muted).toBe(true);
		expect(game.audio.music._muted).toBe(true);

		// 後から追加された AudioSystem でも GameDriver の値を反映する。
		const myAudioSys = new SoundAudioSystem({
			id: "voice_chara1",
			muted: game._audioSystemManager._muted,
			isSuppressed: game._audioSystemManager._isSuppressed,
			resourceFactory: game.resourceFactory
		});
		game.audio.chara1 = myAudioSys;
		expect(game.audio.chara1._isSuppressed).toBeTruthy();
		expect(game.audio.chara1._muted).toBe(true);
		game._setMuted(false);
		expect(game._audioSystemManager._muted).toBe(false);
		expect(game.audio.chara1._isSuppressed).toBeTruthy();
		expect(game.audio.sound._isSuppressed).toBeTruthy();
		expect(game.audio.music._isSuppressed).toBeTruthy();
		expect(game.audio.chara1._muted).toBe(false);
		expect(game.audio.sound._muted).toBe(false);
		expect(game.audio.music._muted).toBe(false);
	});

	it("focusingCamera", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const r = new Renderer();
		game.renderers.push(r);
		const scene = new Scene({ game: game });
		game.pushScene(scene);
		game._flushSceneChangeRequests();
		const e = new E({ scene: scene });
		scene.append(e);
		expect(e.state).toBe(0);
		expect(game.modified).toBe(true);

		const camera = new Camera2D({});
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
		expect(e.state).toBe(EntityStateFlags.None);
		expect(game.modified).toBe(false);

		e.modified();
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
		expect(game.modified).toBe(true);
		game.focusingCamera = camera;
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
		expect(game.modified).toBe(true);

		e.modified();
		const camera2 = new Camera2D({});
		game.focusingCamera = camera2;
		expect(game.focusingCamera).toEqual(camera2);
		expect(e.state).toBe(EntityStateFlags.ContextLess);
		expect(game.modified).toBe(false);

		game.modified = false;
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
	});
});
