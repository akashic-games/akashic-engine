describe("test Game", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var game = new mock.Game({ width: 320, height: 270 }, undefined, "foo");
		expect(game._idx).toBe(0);
		expect(game.db).toEqual({});
		expect(game.renderers.length).toBe(0);
		expect(game.scenes.length).toBe(0);
		expect(game.random.length).toBe(0);
		expect(game.events.length).toBe(0);
		expect(game.modified).toBe(true);
		expect(game.external).toEqual({});
		expect(game.age).toBe(0);
		expect(game.fps).toBe(30);
		expect(game.width).toBe(320);
		expect(game.height).toBe(270);
		expect(game.selfId).toBe("foo");
		expect(game.playId).toBe(undefined);
		expect(game).toHaveProperty("_assetManager");
		expect(game).toHaveProperty("_initialScene");
	});

	it("global assets", function (done) {
		var game = new mock.Game({
			width: 320,
			height: 270,
			assets: {
				foo: {
					type: "image",
					path: "/dummypath.png",
					virtualPath: "dummypath.png",
					global: true,
					width: 1,
					height: 1,
				},
				bar: {
					type: "text",
					path: "/dummypath.txt",
					virtualPath: "dummypath.txt"
				}
			}
		});

		game._loaded.handle(function () {
			expect(game.assets.foo).not.toBe(undefined);
			expect(game.assets.foo instanceof g.ImageAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("bar");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("_loadAndStart", function(done) {
		var assets = {
			mainScene: {  // _loadAndStart() には mainScene が必要
				type: "script",
				path: "/dummy/dummy.js",  // パスはダミーであり使用されてはいない。mock.tsのScriptAssetを参照のこと
				virtualPath: "dummy/dummy.js",
				global: true,
			}
		};
		var game = new mock.Game({ width: 320, height: 320, assets: assets });

		var loadedFired = false;
		game._loaded.handle(function () {
			loadedFired = true;
		});
		game._started.handle(function () {
			expect(loadedFired).toBe(true);
			expect(game.assets.mainScene).not.toBe(undefined);
			expect(game.assets.mainScene instanceof g.ScriptAsset).toBe(true);
			expect(game.assets).not.toHaveProperty("foo");
			done();
		});
		game._loadAndStart();
	});

	it("must fire 'loaded' of mainScene at age 0", function(done) {
		var assets = {
			mainScene: {  // _loadAndStart() には mainScene が必要
				type: "script",
				path: "/script/mainScene.js",
				virtualPath: "script/mainScene.js",
				global: true,
			}
		};
		var game = new mock.Game({ width: 320, height: 320, assets: assets });
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = function () { return g.game.__test__(); };";

		var testPass = false;
		function requestTick() {
			if (!testPass) {
				game.tick();
				setTimeout(requestTick, 1);
				return;
			}
			done();
		}

		game.__test__ = function () {
			var scene = new g.Scene({game: game});
			expect(game.age).toBe(0);
			scene.loaded.handle(function () {
				expect(game.age).toBe(0);
				testPass = true;
			});
			requestTick();
			return scene;
		};
		game._loadAndStart();
	});

	it("_loadAndStart - with entry point", function(done) {
		var assets = {
			"dummy": {
				type: "script",
				path: "/dummy/dummy.js",  // パスはダミー
				virtualPath: "dummy/dummy.js",
				global: true,
			}
		};
		var game = new mock.Game({ width: 320, height: 320, assets: assets, main: "./dummy/dummy.js" }, "/");
		var loadedFired = false;
		game._loaded.handle(function () {
			loadedFired = true;
		});
		game._started.handle(function () {
			expect(loadedFired).toBe(true);
			expect(game.assets.dummy).not.toBe(undefined);
			expect(game.assets.dummy instanceof g.ScriptAsset).toBe(true);
			done();
		});
		game._loadAndStart({ args: "arg-value" });
	});

	it("_loadAndStart - after loaded", function(done) {
		var assets = {
			mainScene: {
				type: "script",
				path: "/script/mainScene.js",
				virtualPath: "script/mainScene.js",
				global: true,
			}
		};
		var game = new mock.Game({ width: 320, height: 320, assets: assets }, "/");
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = function () { return g.game.__test__(); };";

		game.__test__ = function () {
			delete game.resourceFactory.scriptContents["/script/mainScene.js"];
			done();
			return new g.Scene({game: game});
		};

		game._loaded.handle(function () {
			var scene = new g.Scene({game: game});
			scene.loaded.handle(function () {
				game._loadAndStart();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			expect(function(){game._startLoadingGlobalAssets()}).toThrowError("Game#_startLoadingGlobalAssets: already loaded."); // already loaded
		});
		game._startLoadingGlobalAssets();
	});

	it("pushScene", function(done) {
		var game = new mock.Game({ width: 320, height: 320 });

		game._loaded.handle(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene = new g.Scene({game: game});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene]);
			var scene2 = new g.Scene({game: game});
			game.pushScene(scene2);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene,scene2]);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("popScene", function(done) {
		var game = new mock.Game({ width: 320, height: 320 });

		game._loaded.handle(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game});
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

	it("replaceScene", function(done) {
		var game = new mock.Game({ width: 320, height: 320 });

		game._loaded.handle(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game});
			game.pushScene(scene);
			game.replaceScene(scene2);
			game._flushSceneChangeRequests();
			expect(game.scenes).toEqual([game._initialScene, scene2]);
			done();
		});
		game._startLoadingGlobalAssets();
	});
/*
	it("tick", function(done) {
		var assets = {
			mainScene: {  // _loadAndStart() には mainScene が必要
				type: "script",
				path: "/dummy/dummy.js",  // パスはダミーであり使用されてはいない。mock.tsのScriptAssetを参照のこと
				virtualPath: "dummy/dummy.js",
				global: true,
			}
		};
		var game = new mock.Game({ width: 320, height: 320, assets: assets });
		game._loaded.handle(function () {
			var scene = new g.Scene({game: game});
			game.pushScene(scene);
			expect(game.age).toBe(0);
			expect(game.tick()).toBe(true);
			expect(game.scene().local).toBe(g.LocalTickMode.NonLocal);
			expect(game.tick()).toBe(false);
			expect(game.age).toBe(1);
			expect(game.tick(false)).toBe(false);
			expect(game.age).toBe(1);
			expect(game.tick(true)).toBe(false);
			expect(game.age).toBe(2);
			done();
		});
		game._loadAndStart();
	});

	it("loadingScene - without assets", function (done) {
		var game = new mock.Game({
			width: 320,
			height: 320,
			fps: 30,
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1,
				},
			}
		});
		var logs = [];

		function TestLoadingScene(param) {
			g.LoadingScene.call(this, param);
			this.loaded.handle(function () {
				logs.push("LoadingSceneLoaded");
			});
			this.targetReady.handle(this, function () {
				logs.push("TargetLoaded");
			});
		}
		TestLoadingScene.prototype = Object.create(g.LoadingScene.prototype);
		var loadingScene = new TestLoadingScene({ game: game, name: "testLoadingScene" });

		game._loaded.handle(function () {
			game.loadingScene = loadingScene;
			var scene = new g.Scene({game: game, assetIds: ["foo"], name: "scene1" });
			var oload = scene._load;
			scene._load = function () {
				logs.push("SceneLoad");
				return oload.apply(this, arguments);
			};
			scene.assetLoaded.handle(function (a) {
				logs.push("SceneAssetLoaded");
			});
			scene.loaded.handle(function () {
				expect(logs).toEqual([
					"LoadingSceneLoaded",  // これ(LoagingSceneの読み込み完了)の後に
					"SceneLoad",           // 遷移先シーンの読み込みが開始されることが重要
					"SceneAssetLoaded",
					"TargetLoaded"
				]);

				// LoadingScene の読み込みが終わっている状態でのシーン遷移をテスト
				logs = [];
				var scene2 = new g.Scene({game: game, assetIds: ["foo"] });
				var oload = scene2._load;
				scene2._load = function () {
					logs.push("Scene2Load");
					return oload.apply(this, arguments);
				};
				scene2.assetLoaded.handle(function (a) {
					logs.push("Scene2AssetLoaded");
				});
				scene2.loaded.handle(function () {
					expect(logs).toEqual([
						"Scene2Load",
						"Scene2AssetLoaded",
						"TargetLoaded"
					]);

					setTimeout(function () {
						expect(game.loadingScene.loaded._handlers.length).toBe(1); // loadingSceneのloadedハンドラが増えていかないことを確認
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

	it("loadingScene - with assets", function (done) {
		var game = new mock.Game({
			width: 320,
			height: 320,
			fps: 30,
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1,
				},
				zoo: {
					type: "audio",
					path: "/path/to/a/file",
					virtualPath: "path/to/a/file",
					duration: 1984,
				},
			}
		});
		var logs = [];

		function TestLoadingScene(param) {
			g.LoadingScene.call(this, param);
			this.assetLoaded.handle(function (a) {
				logs.push("LoadingSceneAssetLoaded");
			});
			this.loaded.handle(function () {
				logs.push("LoadingSceneLoaded");
			});
			this.targetReady.handle(this, function () {
				logs.push("TargetLoaded");
			});
		}
		TestLoadingScene.prototype = Object.create(g.LoadingScene.prototype);
		var loadingScene = new TestLoadingScene({ game: game, assetIds: ["foo", "zoo"] });

		game._loaded.handle(function () {
			game.loadingScene = loadingScene;
			var scene = new g.Scene({game: game, assetIds: ["zoo"] });
			var oload = scene._load;
			scene._load = function () {
				logs.push("SceneLoad");
				return oload.apply(this, arguments);
			};
			scene.assetLoaded.handle(function (a) {
				logs.push("SceneAssetLoaded");
			});
			scene.loaded.handle(function () {
				expect(logs).toEqual([
					"LoadingSceneAssetLoaded",
					"LoadingSceneAssetLoaded",
					"LoadingSceneLoaded",  // これ(LoagingSceneの読み込み完了)の後に
					"SceneLoad",           // 遷移先シーンの読み込みが開始されることが重要
					"SceneAssetLoaded",
					"TargetLoaded"
				]);

				// LoadingScene の読み込みが終わっている状態でのシーン遷移をテスト
				logs = [];
				var scene2 = new g.Scene({game: game, assetIds: ["zoo"] });
				var oload = scene2._load;
				scene2._load = function () {
					logs.push("Scene2Load");
					return oload.apply(this, arguments);
				};
				scene2.assetLoaded.handle(function (a) {
					logs.push("Scene2AssetLoaded");
				});
				scene2.loaded.handle(function () {
					expect(logs).toEqual([
						"Scene2Load",
						"Scene2AssetLoaded",
						"TargetLoaded"
					]);

					setTimeout(function () {
						expect(game.loadingScene.loaded._handlers.length).toBe(1); // loadingSceneのloadedハンドラが増えていかないことを確認
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

	it("loadingScene - with assets, manual end", function (done) {
		var game = new mock.Game({
			width: 320,
			height: 320,
			fps: 30,
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
					duration: 1984
				},
			}
		});

		var asyncEndCalled = false;
		var resetCount = 0;
		var invalidEndTrialCount = 0;

		var loadingScene = new g.LoadingScene({
			game: game,
			assetIds: ["foo", "zoo"],
			explicitEnd: true
		});
		loadingScene.targetReset.handle(loadingScene, function () {
			resetCount++;
			expect(this.getTargetWaitingAssetsCount()).toBe(1); // 下記 var scene の assetIds: ["zoo"] しかこないので
		});
		loadingScene.targetAssetLoaded.handle(loadingScene, function () {
			var self = this;
			invalidEndTrialCount++;
			expect(function () { self.end(); }).toThrow();
		});
		loadingScene.targetReady.handle(loadingScene, function () {
			var self = this;
			setTimeout(function () {
				asyncEndCalled = true;
				self.end();
			}, 10);
		});

		game._loaded.handle(function () {
			game.loadingScene = loadingScene;
			var scene = new g.Scene({game: game, assetIds: ["zoo"] });
			var oload = scene._load;
			scene.loaded.handle(function () {
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

	it("_sceneChanged", function (done) {
		var gameConfiguration = {
			width: 320,
			height: 320,
			fps: 30,
			assets: {
				foo: {
					type: "image",
					path: "/path1.png",
					virtualPath: "path1.png",
					width: 1,
					height: 1,
				},
				zoo: {
					type: "audio",
					path: "/path/to/a/file",
					virtualPath: "path/to/a/file",
					duration: 1984,
				},
			}
		};
		var game = new mock.Game(gameConfiguration);

		var topIsLocal = undefined;
		var sceneChangedCount = 0;
		game._sceneChanged.handle(function (scene) {
			sceneChangedCount++;
			topIsLocal = scene.local;
		});
		game._loaded.handle(function () { // game.scenes テストのため _loaded を待つ必要がある
			var scene = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game, assetIds: ["foo"] });
			var scene3 = new g.Scene({game: game, assetIds: ["foo", "zoo"], local: true });

			scene.loaded.handle(function () {
				expect(sceneChangedCount).toBe(2);  // _initialScene と scene (いずれも loadingSceneなし) で 2
				expect(topIsLocal).toBe(g.LocalTickMode.NonLocal);
				expect(game.scenes).toEqual([game._initialScene, scene]);
				expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(scene.pointDownCapture);

				scene2.loaded.handle(function () {
					expect(sceneChangedCount).toBe(4); // loadingScene が pop されて 1 増えたので 4
					expect(topIsLocal).toBe(g.LocalTickMode.NonLocal);
					expect(game.scenes).toEqual([game._initialScene, scene2]);
					expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(scene2.pointDownCapture);

					scene3.loaded.handle(function () {
						expect(sceneChangedCount).toBe(6);
						expect(topIsLocal).toBe(g.LocalTickMode.FullLocal);
						expect(game.scenes).toEqual([game._initialScene, scene2, scene3]);
						expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(scene3.pointDownCapture);

						game.popScene();
						game._flushSceneChangeRequests();
						expect(sceneChangedCount).toBe(7);
						expect(topIsLocal).toBe(g.LocalTickMode.NonLocal);
						expect(game.scenes).toEqual([game._initialScene, scene2]);
						expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(scene2.pointDownCapture);

						game.popScene();
						game._flushSceneChangeRequests();
						expect(sceneChangedCount).toBe(8);
						expect(topIsLocal).toBe(g.LocalTickMode.FullLocal);
						expect(game.scenes).toEqual([game._initialScene]);
						expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(game._initialScene.pointDownCapture);
						done();
					});
					game.pushScene(scene3);
					game._flushSceneChangeRequests();
					expect(sceneChangedCount).toBe(5);
					expect(topIsLocal).toBe(g.LocalTickMode.FullLocal);
					expect(game.scenes).toEqual([game._initialScene, scene2, scene3, game._defaultLoadingScene]);
					expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(game._defaultLoadingScene.pointDownCapture);
				});
				game.replaceScene(scene2);
				game._flushSceneChangeRequests();
				expect(sceneChangedCount).toBe(3);  // scene2とloadingSceneが乗るが、scene2はまだ_sceneStackTopChangeCountをfireしてない
				expect(topIsLocal).toBe(g.LocalTickMode.FullLocal);             // loadingScene がトップなので local
				expect(game.scenes).toEqual([game._initialScene, scene2, game._defaultLoadingScene]);
				expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(game._defaultLoadingScene.pointDownCapture);
			});
			expect(sceneChangedCount).toBe(1);  // _initialScene (loadingSceneなし) が push された分で 1
			expect(topIsLocal).toBe(g.LocalTickMode.FullLocal);
			expect(game.scenes).toEqual([game._initialScene]);
			expect(game._eventTriggerMap[g.EventType.PointDown]).toBe(game._initialScene.pointDownCapture);
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("scene", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});
		var scene2 = new g.Scene({game: game});
		game.pushScene(scene);
		game._flushSceneChangeRequests();
		expect(game.scene()).toBe(scene);
		game.replaceScene(scene2);
		game._flushSceneChangeRequests();
		expect(game.scene()).toBe(scene2);
	});

	it("register", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});
		var e = new g.E({scene: scene});
		expect(e.id).toBe(1);
		expect(game.db).toEqual({1:e});
		var e2 = new g.E({scene: scene});
		expect(e2.id).toBe(2);
		expect(game.db).toEqual({1:e, 2:e2});
		var n = {id: undefined, age: 100};
		game.register(n);
		expect(game.db[n.id]).toEqual(n);

		var e3 = new g.E({ scene: scene, local: true });
		expect(game._localDb[e3.id].id).toBe(e3.id);
	});

	it("unregister", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});
		var e = new g.E({scene: scene});
		expect(game.db).toEqual({1:e});
		game.unregister(e);
		expect(game.db).toEqual({});

		var e2 = new g.E({ scene: scene, local: true });
		expect(game.db).toEqual({});
		expect(game._localDb[e2.id]).toBe(e2);
		game.unregister(e2);
		expect(game._localDb[e2.id]).toBeUndefined();
	});

	it("leaveGame", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});

		game.leaveGame();
		expect(game.leftGame).toBe(true);
	});

	it("terminateGame", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});

		var count = 0;
		scene.update.handle(function () {
			++count;
		});
		game.pushScene(scene);
		game._flushSceneChangeRequests();

		game.tick();
		expect(count).toBe(1);
		game.tick();
		expect(count).toBe(2);

		game.terminateGame();
		expect(game.terminatedGame).toBe(true);
		game.tick();
		expect(count).toBe(2);
		game.tick();
		expect(count).toBe(2);
	});

	it("no crash on Scene#destroy()", function (done) {
		var game = new mock.Game({ width: 320, height: 320 });

		game._loaded.handle(function () {
			var scene = new g.Scene({game: game});
			var timerFired = false;

			scene.loaded.handle(function () {
				scene.update.handle(function () {
					game.popScene();
				});
				scene.setInterval(1, function () {
					// 「update が popScene してシーンを破壊した後にこれを呼ぼうとしてクラッシュする」ことが問題だった
					timerFired = true;
				});

				game._initialScene.stateChanged.handle(function (state) {
					if (state === g.SceneState.Active) {
						// ↑のpopScene()後、例外を投げずにシーン遷移してここに来れたらOK
						expect(timerFired).toBe(true);
						done();
					}
				});
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
			game.tick();
		});
		game._startLoadingGlobalAssets();
	});

	it("raiseEvent", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var ev = new g.MessageEvent("data");
		var ev2 = new g.MessageEvent("foo");
		game.raiseEvent(ev);
		game.raiseEvent(ev2);
		expect(game.raisedEvents.length).toBe(2);
		expect(game.raisedEvents[0]).toBe(ev);
		expect(game.raisedEvents[1]).toBe(ev2);
	});

	it("vars", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		expect(game.vars).toEqual({});
		game.vars["myState"] = "well";
		expect(game.vars.myState).toBe("well");
	});

	it("_reset", function(done) {
		var game = new mock.Game({
			width: 320,
			height: 320,
			assets: {
				mainScene: {
					type: "script",
					global: true,
					path: "/script/mainScene.js",
					virtualPath: "script/mainScene.js"
				}
			}
		});
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = function () {return new g.Scene(g.game)}";
		expect(game.age).toBe(0);
		expect(game.random[0]).toBe(undefined);

		game._loaded.handle(function () {
			expect(game.isLoaded).toBe(true);

			var scene = new g.Scene({game: game});
			var scene2 = new g.Scene({game: game});
			game.pushScene(scene);
			game.pushScene(scene2);
			game._flushSceneChangeRequests();

			var randGen = new g.XorshiftRandomGenerator(10);
			game._reset({
				age: 3,
				randGen: randGen
			});

			expect(game.scene()).toBe(game._initialScene);
			expect(game.age).toBe(3);
			expect(game.random[0]).toBe(randGen);
			done();
		});
		game._loadAndStart();
	});

	it("_reset - until loaded _initialScene", function(done) {
		var game = new mock.Game({
			width: 320,
			height: 320,
			assets: {
				mainScene: {
					type: "script",
					global: true,
					path: "/script/mainScene.js",
					virtualPath: "script/mainScene.js",
				}
			}
		});
		game.resourceFactory.scriptContents["/script/mainScene.js"] = "module.exports = function () {return new g.Scene(g.game)};";
		expect(game.age).toBe(0);
		expect(game.random[0]).toBe(undefined);

		var testDone = false;
			console.log("done", game.fps);
		game._loaded.handle(function () {
			expect(testDone).toBe(true);
			console.log("done");
			
			done();
		});

		var loadScene = game._defaultLoadingScene;
		expect(game._initialScene.loaded.isHandled(game, game._onInitialSceneLoaded)).toBe(true);
		expect(loadScene.loaded.isHandled(loadScene, loadScene._doReset)).toBe(false);

		game._loadAndStart();
		expect(game.isLoaded).toBe(false);  // _loadAndStartしたがまだ読み込みは終わっていない
		expect(game._initialScene.loaded.isHandled(game, game._onInitialSceneLoaded)).toBe(true);
		expect(game.scenes.length).toBe(2);
		expect(game.scenes[0]).toBe(game._initialScene);
		expect(game.scenes[1]).toBe(loadScene);

		game._reset({ age: 0 });
		var loadScene2 = game._defaultLoadingScene;
		expect(loadScene2).not.toBe(loadScene);
		expect(loadScene.destroyed()).toBe(true);
		expect(game.isLoaded).toBe(false);
		expect(game._initialScene.loaded.isHandled(game, game._onInitialSceneLoaded)).toBe(true);
		expect(loadScene2.loaded.isHandled(loadScene2, loadScene2._doReset)).toBe(false);
		expect(game.scenes.length).toBe(0);

		game._loadAndStart();
		expect(game.scenes.length).toBe(2);

		testDone = true;
	});

	it("controls audio volume", function () {
		var game = new mock.Game({ width: 320, height: 320 });

		expect(game._audioSystemManager._playbackRate).toBe(1.0);
		expect(game._audioSystemManager._muted).toBe(false);
		expect(function(){game._setAudioPlaybackRate(-0.5)}).toThrowError("AssertionError");

		expect(game.audio["sound"]._playbackRate).toBe(1.0);
		expect(game.audio["music"]._playbackRate).toBe(1.0);
		expect(game.audio["sound"]._muted).toBe(false);
		expect(game.audio["music"]._muted).toBe(false);

		game._setMuted(true);
		game._setMuted(true);  // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game._audioSystemManager._muted).toBe(true);
		expect(game.audio["sound"]._playbackRate).toBe(1.0);
		expect(game.audio["music"]._playbackRate).toBe(1.0);
		expect(game.audio["sound"]._muted).toBe(true);
		expect(game.audio["music"]._muted).toBe(true);

		game._setAudioPlaybackRate(1.7);
		game._setAudioPlaybackRate(1.7); // 同じ値を設定するパスのカバレッジ稼ぎ
		expect(game._audioSystemManager._playbackRate).toBe(1.7);
		expect(game.audio["sound"]._playbackRate).toBe(1.7);
		expect(game.audio["music"]._playbackRate).toBe(1.7);
		expect(game.audio["sound"]._muted).toBe(true);
		expect(game.audio["music"]._muted).toBe(true);

		// 後から追加された AudioSystem でも GameDriver の値を反映する。
		var myAudioSys = new g.SoundAudioSystem("voice_chara1", game);
		game.audio["chara1"] = myAudioSys;
		expect(game.audio["chara1"]._playbackRate).toBe(1.7);
		expect(game.audio["chara1"]._muted).toBe(true);
		game._setMuted(false);
		expect(game._audioSystemManager._muted).toBe(false);
		expect(game.audio["chara1"]._playbackRate).toBe(1.7);
		expect(game.audio["sound"]._playbackRate).toBe(1.7);
		expect(game.audio["music"]._playbackRate).toBe(1.7);
		expect(game.audio["chara1"]._muted).toBe(false);
		expect(game.audio["sound"]._muted).toBe(false);
		expect(game.audio["music"]._muted).toBe(false);
	});

	it("focusingCamera", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var r = new mock.Renderer();
		game.renderers.push(r);
		var scene = new g.Scene({game: game});
		game.pushScene(scene);
		game._flushSceneChangeRequests();
		var e = new g.E({scene: scene});
		scene.append(e);
		expect(e.state).toBe(0);
		expect(game.modified).toBe(true);

		var camera = new g.Camera2D({game: game});
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
		expect(e.state).toBe(mock.EntityStateFlags.None);
		expect(game.modified).toBe(false);

		e.modified();
		expect(e.state).toBe(mock.EntityStateFlags.Modified | mock.EntityStateFlags.ContextLess);
		expect(game.modified).toBe(true);
		game.focusingCamera = camera;
		expect(e.state).toBe(mock.EntityStateFlags.Modified | mock.EntityStateFlags.ContextLess);
		expect(game.modified).toBe(true);

		e.modified();
		var camera2 = new g.Camera2D({game: game});
		game.focusingCamera = camera2;
		expect(game.focusingCamera).toEqual(camera2);
		expect(e.state).toBe( mock.EntityStateFlags.ContextLess);
		expect(game.modified).toBe(false);

		game.modified = false;
		game.focusingCamera = camera;
		expect(game.focusingCamera).toEqual(camera);
	});
*/
});
