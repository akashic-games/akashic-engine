import * as pl from "@akashic/playlog";
import {
	Asset,
	AssetConfiguration,
	Camera2D,
	E,
	GameConfiguration,
	LoadingScene,
	LoadingSceneParameterObject,
	LocalTickModeString,
	MessageEvent,
	PlatformPointType,
	Scene,
	XorshiftRandomGenerator
} from "..";
import { customMatchers, EntityStateFlags, Game, Renderer, ImageAsset, ScriptAsset, FilledRect } from "./helpers";

expect.extend(customMatchers);

describe("test Game", () => {
	it("初期化", () => {
		const game = new Game({ width: 320, height: 270, main: "", assets: {} }, undefined, "foo");
		expect(game._idx).toBe(0);
		expect(game.db).toEqual({});
		expect(game.renderers.length).toBe(0);
		expect(game.scenes.length).toBe(0);
		expect(game.random).toBeUndefined();
		expect(game.localRandom).toBeDefined();
		expect(game._modified).toBe(true);
		expect(game.external).toEqual({});
		expect(game.age).toBe(0);
		expect(game.fps).toBe(30);
		expect(game.width).toBe(320);
		expect(game.height).toBe(270);
		expect(game.selfId).toBe("foo");
		expect(game.joinedPlayerIds).toEqual([]);
		expect(game.playId).toBeUndefined();
		expect(game.onSkipChange).not.toBeUndefined();
		expect(game.onSceneChange).not.toBeUndefined();
		expect(game._onSceneChange).not.toBeUndefined();
		expect(game).toHaveProperty("_assetManager");
		expect(game).toHaveProperty("_initialScene");
		expect(game._moduleManager).toBeDefined();
	});

	it("_destroy()", () => {
		const game = new Game({ width: 320, height: 270, main: "", assets: {} }, undefined, "foo");
		game._destroy();
		expect(game.db).toBeUndefined();
		expect(game.renderers).toBeUndefined();
		expect(game.scenes).toBeUndefined();
		expect(game.random).toBeUndefined();
		expect(game.localRandom).toBeUndefined();
		expect(game._modified).toBe(false);
		expect(game.external).toEqual({}); // external は触らない
		expect(game.vars).toEqual({}); // vars も触らない
		expect(game.playId).toBeUndefined();
		expect(game.onSkipChange).toBeUndefined();
		expect(game.onSceneChange).toBeUndefined();
		expect(game._onSceneChange).toBeUndefined();
		expect(game._moduleManager).toBeUndefined();
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

		game._onLoad.add(() => {
			expect(game.assets.foo).not.toBe(undefined);
			expect(game.assets.foo instanceof ImageAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("bar");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("_loadAndStart", done => {
		const assets: { [id: string]: AssetConfiguration } = {
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
		game._onLoad.add(() => {
			loadedFired = true;
		});
		game._onStart.add(() => {
			expect(loadedFired).toBe(true);
			expect(game.assets.mainScene).not.toBe(undefined);
			expect(game.assets.mainScene instanceof ScriptAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("foo");
			done();
		});
		game._loadAndStart();
	});

	it("must fire 'loaded' of mainScene at age 0", done => {
		const assets: { [id: string]: AssetConfiguration } = {
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
			scene.onLoad.add(() => {
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
		const assets: { [id: string]: AssetConfiguration } = {
			dummy: {
				type: "script",
				path: "/dummy/dummy.js", // パスはダミー
				virtualPath: "dummy/dummy.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" }, "/");
		let loadedFired = false;
		game._onLoad.add(() => {
			loadedFired = true;
		});
		game._onStart.add(() => {
			expect(loadedFired).toBe(true);
			expect(game.assets.dummy).not.toBe(undefined);
			expect(game.assets.dummy instanceof ScriptAsset).toBe(true);
			done();
		});
		game._loadAndStart({ args: "arg-value" });
	});

	it("_loadAndStart - with mainFunc", done => {
		const mainFunc = (g: any, args: any): void => {
			expect(g).toBeDefined();
			expect(g.Game).toBeDefined();
			expect(g.Scene).toBeDefined();
			expect(args).toEqual({ args: "arg-value" });
			done();
		};
		const game = new Game({ width: 320, height: 320, main: "dummy", assets: {} }, "/", undefined, undefined, mainFunc);
		game._loadAndStart({ args: "arg-value" });
	});

	it("_loadAndStart - after loaded", done => {
		const assets: { [id: string]: AssetConfiguration } = {
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

		game._onLoad.add(() => {
			const scene = new Scene({ game: game });
			scene.onLoad.add(() => {
				game._loadAndStart();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
			expect(() => {
				game._startLoadingGlobalAssets();
			}).toThrowError("AssertionError");
		});
		game._startLoadingGlobalAssets();
	});

	it("pushScene", done => {
		const game = new Game({
			width: 320,
			height: 320,
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

		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game, assetIds: ["foo"] });
			const scene2 = new Scene({ game, assetIds: ["foo"] });
			game.pushScene(scene1);

			let scene1foo: Asset;

			scene1.onLoad.addOnce(() => {
				expect(game.scenes).toEqual([game._initialScene, scene1]);
				scene1foo = scene1.assets.foo;
				game.pushScene(scene2);
			});
			scene2.onLoad.addOnce(() => {
				expect(game.scenes).toEqual([game._initialScene, scene1, scene2]);
				// 同一IDのアセットを前のシーンで読み込んでいた場合はアセットの再読み込みが発生しない （= 同一インスタンスである） ことを確認
				expect(scene1foo).toBe(scene2.assets.foo);
				done();
			});
		});
		game._startLoadingGlobalAssets();
	});

	it("popScene", done => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });

		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game, name: "SCENE1" });
			const scene2 = new Scene({ game: game, name: "SCENE2" });
			game.pushScene(scene);
			game.pushScene(scene2);
			game.popScene();
			game._flushPostTickTasks();
			expect(game.scenes).toEqual([game._initialScene, scene]);
			game.popScene();
			game._flushPostTickTasks();
			expect(game.scenes).toEqual([game._initialScene]);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("popScene - specified step", done => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });

		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			// popSceneで指定したシーンまで戻る際に経過したシーンは全て削除
			const scene = new Scene({ game: game, name: "SCENE1" });
			const scene2 = new Scene({ game: game, name: "SCENE2" });
			const scene3 = new Scene({ game: game, name: "SCENE3" });
			game.pushScene(scene);
			game.pushScene(scene2);
			game.pushScene(scene3);
			game.popScene(false, 2);
			game._flushPostTickTasks();
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
			game._flushPostTickTasks();
			expect(game.scenes).toEqual([game._initialScene]);
			expect(scene.destroyed()).toBe(false);
			expect(scene2Alpha.destroyed()).toBe(false);
			expect(scene3Beta.destroyed()).toBe(false);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("replaceScene", done => {
		const game = new Game({
			width: 320,
			height: 320,
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

		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene1 = new Scene({ game, assetIds: ["foo"] });
			const scene2 = new Scene({ game, assetIds: ["foo"] });
			game.pushScene(scene1);

			let scene1foo: Asset;

			scene1.onLoad.addOnce(() => {
				scene1foo = scene1.assets.foo;
				game.replaceScene(scene2);
			});
			scene2.onLoad.addOnce(() => {
				expect(game.scenes).toEqual([game._initialScene, scene2]);
				// 同一IDのアセットを前のシーンで読み込んでいた場合はアセットの再読み込みが発生しない （= 同一インスタンスである） ことを確認
				expect(scene1foo).toBe(scene2.assets.foo);
				done();
			});
		});
		game._startLoadingGlobalAssets();
	});

	it("tick", done => {
		const assets: { [id: string]: AssetConfiguration } = {
			mainScene: {
				// _loadAndStart() には mainScene が必要
				type: "script",
				path: "./dummy/dummy.js", // パスはダミーであり使用されてはいない。tsのScriptAssetを参照のこと
				virtualPath: "dummy/dummy.js",
				global: true
			}
		};
		const game = new Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" });
		game._onLoad.add(() => {
			const scene = new Scene({ game: game });
			game.pushScene(scene);
			expect(game.age).toBe(0);
			expect(game.classicTick()).toBe(true);
			expect(game.scene()!.local).toBe("non-local");
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
				this.onLoad.add(() => {
					logs.push("LoadingSceneLoaded");
				});
				this.onTargetReady.add(() => {
					logs.push("TargetLoaded");
				}, this);
			}
		}

		const loadingScene = new TestLoadingScene({
			game: game,
			name: "testLoadingScene"
		});

		game._onLoad.add(() => {
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
			scene.onAssetLoad.add(() => {
				logs.push("SceneAssetLoaded");
			});
			scene.onLoad.add(() => {
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
				scene2.onAssetLoad.add(() => {
					logs.push("Scene2AssetLoaded");
				});
				scene2.onLoad.add(() => {
					expect(logs).toEqual(["Scene2Load", "Scene2AssetLoaded", "TargetLoaded"]);

					setTimeout(() => {
						expect(game.loadingScene.onLoad.length).toBe(1); // loadingSceneのonLoadハンドラが増えていかないことを確認
						done();
					}, 1);
				});
				game.pushScene(scene2);
				game._flushPostTickTasks();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
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
				this.onAssetLoad.add(() => {
					logs.push("LoadingSceneAssetLoaded");
				});
				this.onLoad.add(() => {
					logs.push("LoadingSceneLoaded");
				});
				this.onTargetReady.add(() => {
					logs.push("TargetLoaded");
				}, this);
			}
		}

		const loadingScene = new TestLoadingScene({
			game: game,
			assetIds: ["foo", "zoo"]
		});

		game._onLoad.add(() => {
			game.loadingScene = loadingScene;

			class MockScene1 extends Scene {
				_load(): void {
					logs.push("SceneLoad");
					super._load();
				}
			}

			const scene = new MockScene1({ game: game, assetIds: ["zoo"] });
			scene.onAssetLoad.add(() => {
				logs.push("SceneAssetLoaded");
			});
			scene.onLoad.add(() => {
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
				scene2.onAssetLoad.add(() => {
					logs.push("Scene2AssetLoaded");
				});
				scene2.onLoad.add(() => {
					expect(logs).toEqual(["Scene2Load", "Scene2AssetLoaded", "TargetLoaded"]);

					setTimeout(() => {
						expect(game.loadingScene.onLoad.length).toBe(1); // loadingSceneのloadedハンドラが増えていかないことを確認
						done();
					}, 1);
				});
				game.pushScene(scene2);
				game._flushPostTickTasks();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
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
		loadingScene.onTargetReset.add(() => {
			resetCount++;
			expect(loadingScene.getTargetWaitingAssetsCount()).toBe(1); // 下記 const scene の assetIds: ["zoo"] しかこないので
		}, loadingScene);
		loadingScene.onTargetAssetLoad.add(() => {
			invalidEndTrialCount++;
			expect(() => {
				loadingScene.end();
			}).toThrow();
		}, loadingScene);
		loadingScene.onTargetReady.add(() => {
			setTimeout(() => {
				asyncEndCalled = true;
				loadingScene.end();
			}, 10);
		}, loadingScene);

		game._onLoad.add(() => {
			game.loadingScene = loadingScene;
			const scene = new Scene({ game: game, assetIds: ["zoo"] });
			scene.onLoad.add(() => {
				expect(asyncEndCalled).toBe(true);
				expect(invalidEndTrialCount).toBe(1);
				expect(resetCount).toBe(1);
				done();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
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

		let topIsLocal: LocalTickModeString | undefined = undefined;
		let sceneChangedCount = 0;
		let _sceneChangedCount = 0;
		game.onSceneChange.add(() => {
			sceneChangedCount++;
		});
		game._onSceneChange.add(scene => {
			_sceneChangedCount++;
			topIsLocal = scene!.local;
		});
		game._onLoad.add(() => {
			// game.scenes テストのため _loaded を待つ必要がある
			const scene = new Scene({ game: game });
			const scene2 = new Scene({ game: game, assetIds: ["foo"] });
			const scene3 = new Scene({
				game: game,
				assetIds: ["foo", "zoo"],
				local: true
			});

			scene.onLoad.add(() => {
				expect(sceneChangedCount).toBe(2); // _initialScene と scene (いずれも loadingSceneなし) で 2
				expect(_sceneChangedCount).toBe(2);
				expect(topIsLocal).toBe("non-local");
				expect(game.scenes).toEqual([game._initialScene, scene]);
				expect(game._eventTriggerMap["point-down"]).toBe(scene.onPointDownCapture);

				scene2.onLoad.add(() => {
					expect(sceneChangedCount).toBe(4); // loadingScene が pop されて 1 増えたので 4
					expect(_sceneChangedCount).toBe(4);
					expect(topIsLocal).toBe("non-local");
					expect(game.scenes).toEqual([game._initialScene, scene2]);
					expect(game._eventTriggerMap["point-down"]).toBe(scene2.onPointDownCapture);

					scene3.onLoad.add(() => {
						expect(sceneChangedCount).toBe(6);
						expect(_sceneChangedCount).toBe(6);
						expect(topIsLocal).toBe("full-local");
						expect(game.scenes).toEqual([game._initialScene, scene2, scene3]);
						expect(game._eventTriggerMap["point-down"]).toBe(scene3.onPointDownCapture);

						game.popScene();
						game._flushPostTickTasks();
						expect(sceneChangedCount).toBe(7);
						expect(_sceneChangedCount).toBe(7);
						expect(topIsLocal).toBe("non-local");
						expect(game.scenes).toEqual([game._initialScene, scene2]);
						expect(game._eventTriggerMap["point-down"]).toBe(scene2.onPointDownCapture);

						game.popScene();
						game._flushPostTickTasks();
						expect(sceneChangedCount).toBe(8);
						expect(_sceneChangedCount).toBe(8);
						expect(topIsLocal).toBe("full-local");
						expect(game.scenes).toEqual([game._initialScene]);
						expect(game._eventTriggerMap["point-down"]).toBe(game._initialScene.onPointDownCapture);
						done();
					});
					game.pushScene(scene3);
					game._flushPostTickTasks();
					expect(sceneChangedCount).toBe(5);
					expect(_sceneChangedCount).toBe(5);
					expect(topIsLocal).toBe("full-local");
					expect(game.scenes).toEqual([game._initialScene, scene2, scene3, game._defaultLoadingScene]);
					expect(game._eventTriggerMap["point-down"]).toBe(game._defaultLoadingScene.onPointDownCapture);
				});
				game.replaceScene(scene2);
				game._flushPostTickTasks();
				expect(sceneChangedCount).toBe(3); // scene2とloadingSceneが乗るが、scene2はまだ_sceneStackTopChangeCountをfireしてない
				expect(_sceneChangedCount).toBe(3);
				expect(topIsLocal).toBe("full-local"); // loadingScene がトップなので local
				expect(game.scenes).toEqual([game._initialScene, scene2, game._defaultLoadingScene]);
				expect(game._eventTriggerMap["point-down"]).toBe(game._defaultLoadingScene.onPointDownCapture);
			});
			expect(sceneChangedCount).toBe(1); // _initialScene (loadingSceneなし) が push された分で 1
			expect(_sceneChangedCount).toBe(1);
			expect(topIsLocal).toBe("full-local");
			expect(game.scenes).toEqual([game._initialScene]);
			expect(game._eventTriggerMap["point-down"]).toBe(game._initialScene.onPointDownCapture);
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("scene", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const scene = new Scene({ game: game });
		const scene2 = new Scene({ game: game });
		game.pushScene(scene);
		game._flushPostTickTasks();
		expect(game.scene()).toBe(scene);
		game.replaceScene(scene2);
		game._flushPostTickTasks();
		expect(game.scene()).toBe(scene2);
	});

	it("register", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
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

	it("terminateGame", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const scene = new Scene({ game: game });

		let count = 0;
		scene.onUpdate.add(() => {
			++count;
		});
		game.pushScene(scene);
		game._flushPostTickTasks();

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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });

		game._onLoad.add(() => {
			const scene = new Scene({ game: game });
			let timerFired = false;

			scene.onLoad.add(() => {
				scene.onUpdate.add(() => {
					game.popScene();
				});
				scene.setInterval(() => {
					// 「update が popScene してシーンを破壊した後にこれを呼ぼうとしてクラッシュする」ことが問題だった
					timerFired = true;
				}, 1);

				game._initialScene.onStateChange.add(state => {
					if (state === "active") {
						// ↑のpopScene()後、例外を投げずにシーン遷移してここに来れたらOK
						expect(timerFired).toBe(true);
						done();
					}
				});
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
			game.classicTick();
		});
		game._startLoadingGlobalAssets();
	});

	it("raiseEvent", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const ev = new MessageEvent("data");
		const ev2 = new MessageEvent("foo");
		game.raiseEvent(ev);
		game.raiseEvent(ev2);
		expect(game.handlerSet.raisedEvents.length).toBe(2);
		expect(game.handlerSet.raisedEvents[0]).toEqual([32, undefined, null, "data", false]);
		expect(game.handlerSet.raisedEvents[1]).toEqual([32, undefined, null, "foo", false]);
	});

	it("vars", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
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
		game.onSceneChange.add(() => {
			//
		});
		game._onSceneChange.add(() => {
			//
		});
		game.resourceFactory.scriptContents["/script/mainScene.js"] =
			"module.exports = () => { const s = new g.Scene({game: g.game}); g.game.pushScene(s);}";
		expect(game.age).toBe(0);
		expect(game.random).toBeUndefined();

		game._onLoad.add(() => {
			expect(game.isLoaded).toBe(true);

			const scene = new Scene({
				game,
				local: "interpolate-local",
				tickGenerationMode: "manual"
			});
			const scene2 = new Scene({
				game,
				local: "interpolate-local",
				tickGenerationMode: "by-clock"
			});
			const scene3 = new Scene({
				game,
				local: "interpolate-local",
				tickGenerationMode: "by-clock"
			}); // same scene mode as scene2
			game.pushScene(scene);
			game.pushScene(scene2);
			game.pushScene(scene3);
			game._flushPostTickTasks();

			expect(game.handlerSet.modeHistry.length).toBe(3);
			expect(game.handlerSet.modeHistry[0]).toEqual({
				local: "full-local",
				tickGenerationMode: "by-clock"
			}); // initial scene
			expect(game.handlerSet.modeHistry[1]).toEqual({
				local: "interpolate-local",
				tickGenerationMode: "manual"
			}); // scene1
			expect(game.handlerSet.modeHistry[2]).toEqual({
				local: "interpolate-local",
				tickGenerationMode: "by-clock"
			}); // scene2

			const randGen1 = new XorshiftRandomGenerator(10);
			game._pointEventResolver.pointDown({
				type: PlatformPointType.Down,
				identifier: 0,
				offset: { x: 0, y: 0 }
			});
			const moduleManager = game._moduleManager;
			game._reset({
				age: 3,
				randSeed: 10,
				randGenSer: randGen1.serialize()
			});

			expect(game.scene()).toBe(game._initialScene);
			expect(game.age).toBe(3);
			const randGen2 = XorshiftRandomGenerator.deserialize(randGen1.serialize());
			expect(game.random.generate()).toBe(randGen2.generate());
			// reset 前の PointDownEvent の情報が破棄されていることを確認
			expect(
				game._pointEventResolver.pointUp({
					type: PlatformPointType.Up,
					identifier: 0,
					offset: { x: 0, y: 0 }
				})
			).toBeNull();
			// reset で Game#onSceneChange は removeAll() されるが、Game#_onSceneChange は removeAll() されないことを確認
			expect(game.onSceneChange.length).toBe(0);
			expect(game._onSceneChange.length).not.toBe(0);
			// reset後、Game#_moduleManagerが作り直されていることを確認
			expect(game._moduleManager).not.toBe(moduleManager);
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
		game.resourceFactory.scriptContents["./script/mainScene.js"] =
			"module.exports = () => { const s = new g.Scene({game: g.game}); g.game.pushScene(s); };";
		expect(game.age).toBe(0);
		expect(game.random).toBeUndefined();

		let testDone = false;
		game._onLoad.add(() => {
			expect(testDone).toBe(true);
			done();
		});

		const loadScene = game._defaultLoadingScene;
		expect(game._initialScene.onLoad.contains(game._handleInitialSceneLoad, game)).toBe(true);
		expect(loadScene.onLoad.contains(loadScene._doReset, loadScene)).toBe(false);

		game._loadAndStart();
		expect(game.isLoaded).toBe(false); // _loadAndStartしたがまだ読み込みは終わっていない
		expect(game._initialScene.onLoad.contains(game._handleInitialSceneLoad, game)).toBe(true);
		expect(game.scenes.length).toBe(2);
		expect(game.scenes[0]).toBe(game._initialScene);
		expect(game.scenes[1]).toBe(loadScene);

		game._reset({ age: 0 });
		const loadScene2 = game._defaultLoadingScene;
		expect(loadScene2).not.toBe(loadScene);
		expect(loadScene.destroyed()).toBe(true);
		expect(game.isLoaded).toBe(false);
		expect(game._initialScene.onLoad.contains(game._handleInitialSceneLoad, game)).toBe(true);
		expect(loadScene2.onLoad.contains(loadScene2._doReset, loadScene2)).toBe(false);
		expect(game.scenes.length).toBe(0);

		game._loadAndStart();
		expect(game.scenes.length).toBe(2);

		testDone = true;
	});

	it("controls audio volume", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });

		expect(game.audio._muted).toBe(false);
		expect(() => {
			game._setAudioPlaybackRate(-0.5);
		}).toThrowError("AssertionError");

		expect(game.audio.sound._muted).toBe(false);
		expect(game.audio.music._muted).toBe(false);

		game._setMuted(true);
		game._setMuted(true); // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game.audio._muted).toBe(true);
		expect(game.audio.sound._muted).toBe(true);
		expect(game.audio.music._muted).toBe(true);

		game._setAudioPlaybackRate(1.7);
		game._setAudioPlaybackRate(1.7); // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game.audio.sound._muted).toBe(true);
		expect(game.audio.music._muted).toBe(true);

		game._setAudioPlaybackRate(1.0);
		game._setMuted(false);
		expect(game.audio._muted).toBe(false);
		expect(game.audio.sound._muted).toBe(false);
		expect(game.audio.music._muted).toBe(false);
	});

	it("focusingCamera", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const r = new Renderer();
		game.renderers.push(r);
		const scene = new Scene({ game: game });
		game.pushScene(scene);
		game._flushPostTickTasks();
		const e = new E({ scene: scene });
		scene.append(e);
		expect(e.state).toBe(0);
		expect(game._modified).toBe(true);

		const camera = new Camera2D({});
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
		expect(e.state).toBe(EntityStateFlags.None);
		expect(game._modified).toBe(false);

		e.modified();
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
		expect(game._modified).toBe(true);
		game.focusingCamera = camera;
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
		expect(game._modified).toBe(true);

		e.modified();
		const camera2 = new Camera2D({});
		game.focusingCamera = camera2;
		expect(game.focusingCamera).toEqual(camera2);
		expect(e.state).toBe(EntityStateFlags.ContextLess);
		expect(game._modified).toBe(false);

		game._modified = false;
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
	});

	describe("skippingScene", () => {
		it("throw error if given non-local scene as a skippingScene", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const scene = new Scene({ game });
			game.pushScene(scene);
			game._flushPostTickTasks();

			expect(() => {
				game.skippingScene = new Scene({ game, local: "interpolate-local" });
			}).toThrow("Game#skippingScene: only 'full-local' scene is supported");
			expect(() => {
				game.skippingScene = new Scene({ game, local: "non-local" });
			}).toThrow("Game#skippingScene: only 'full-local' scene is supported");
		});

		it("render skippingScene if the game has been skipping", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const r = new Renderer();
			game.renderers.push(r);
			const scene = new Scene({ game });
			const red = new FilledRect({
				scene,
				cssColor: "red",
				width: 32,
				height: 32
			});
			scene.append(red);
			game.pushScene(scene);
			game._flushPostTickTasks();

			const skippingScene = new Scene({ game, local: "full-local" });
			const black = new FilledRect({
				scene: skippingScene,
				cssColor: "black",
				width: 32,
				height: 32
			});
			skippingScene.append(black);
			game.skippingScene = skippingScene;

			game.onSkipChange.fire(true);
			game.render();
			expect(r.methodCallParamsHistory("fillRect")[0].cssColor).toBe("black");

			r.clearMethodCallHistory();
			game.onSkipChange.fire(false);
			game.modified();
			game.render();
			expect(r.methodCallParamsHistory("fillRect")[0].cssColor).toBe("red");
		});

		it("fire skippingScene#onUpdate if the Game has been skipping and Game#render() is called each time", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const scene = new Scene({ game });
			game.pushScene(scene);
			game._flushPostTickTasks();

			const skippingScene = new Scene({ game, local: "full-local" });
			game.skippingScene = skippingScene;

			let updateCount = 0;
			skippingScene.onUpdate.add(() => {
				updateCount++;
			});

			game.onSkipChange.fire(true);
			game.render();
			expect(updateCount).toBe(1);
			game.render();
			expect(updateCount).toBe(2);
			game.render();
			expect(updateCount).toBe(3);

			game.onSkipChange.fire(false);
			game.render();
			expect(updateCount).toBe(3);
			game.render();
			expect(updateCount).toBe(3);
			game.render();
			expect(updateCount).toBe(3);
		});

		it("fire skippingScene#onLoad if the skippingScene is set to Game#skippingScene and enter the skipping state", done => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const r = new Renderer();
			game.renderers.push(r);
			const scene = new Scene({ game });
			game.pushScene(scene);
			game._flushPostTickTasks();

			const skippingScene = new Scene({ game, local: "full-local" });
			skippingScene.onLoad.addOnce(() => {
				done();
			});
			game.skippingScene = skippingScene;

			game.onSkipChange.fire(true);
		});
	});

	it("joinedPlayerIds", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const scene = new Scene({ game: game });
		scene.onLoad.add(() => {
			const joinPlaylogEvent: pl.JoinEvent = [0, 2, "1234", "nicotaro"];
			game.tick(true, 0, [joinPlaylogEvent]);
			expect(game.joinedPlayerIds).toEqual(["1234"]);

			const leavePlaylogEvent: pl.LeaveEvent = [1, 2, "1234"];
			game.tick(true, 0, [leavePlaylogEvent]);
			expect(game.joinedPlayerIds).toEqual([]);

			game.tick(true, 0, [joinPlaylogEvent]);
			(game as any)._reset({ age: 0 });
			expect(game.joinedPlayerIds).toEqual([]);
		});
		game.pushScene(scene);
	});

	it("localRandom", () => {
		const game1 = new Game({ width: 320, height: 320, main: "", assets: {} });
		const game2 = new Game({ width: 320, height: 320, main: "", assets: {} });
		// 異なるGameインスタンスのlocalRandomが生成する乱数が異なる値になる
		const randoms1: number[] = [];
		const randoms2: number[] = [];
		for (let i = 0; i < 10; i++) {
			randoms1[i] = game1.localRandom.generate();
			randoms2[i] = game2.localRandom.generate();
		}
		expect(randoms1).not.toEqual(randoms2);
	});
});
