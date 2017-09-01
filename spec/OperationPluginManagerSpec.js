describe("test OperationPluginManager", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");

	// テスト用ダミー操作プラグイン
	var TestOperationPlugin = (function () {
		var TestOperationPlugin = function (game, viewInfo, option) {
			this._game = game;
			this._viewInfo = viewInfo;
			this._option = option;
			this._started = false;
			this.operationTrigger = new g.Trigger();
		};
		TestOperationPlugin.isSupported = function () { return true; };
		TestOperationPlugin.prototype.start = function () { this._started = true; };
		TestOperationPlugin.prototype.stop = function () { this._started = false; };
		TestOperationPlugin.prototype.debugFire = function (v) { this.operationTrigger.fire(v); };
		return TestOperationPlugin;
	})();

	var TestOperationPlugin_Unsupported = (function () {
		var TestOperationPlugin_Unsupported = function (game, viewInfo, option) {};
		TestOperationPlugin_Unsupported.isSupported = function () { return false; };
		return TestOperationPlugin_Unsupported;
	})();

	var require_original = g._require;
	var game;
	var dummyViewInfo = { "dummy": true };

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		g._require = function (game, path, currentModule) {
			switch (path) {
			case "/script/op-plugin.js":
				return TestOperationPlugin;
			case "/script/op-plugin-unsupported.js":
				return TestOperationPlugin_Unsupported;
			default:
				return require_original.call(g, game, path, currentModule);
			}
		};
		var conf = {
			width: 320,
			height: 270,
			operationPlugins: [
				{ code: 42, script: "/script/op-plugin.js" },
				{ code: 10 },
				{ code: 15, script: "/script/op-plugin-unsupported.js" }
			]
		};
		game = new mock.Game(conf, "/", "foo", dummyViewInfo);
	});

	afterEach(function() {
		// テスト内で require() をトラップするため上書きするので、ここで書き戻す
		g._require = require_original;
	});

	it("初期化", function(done) {
		game._loaded.add(function () {
			expect(game._operationPluginManager).not.toBeFalsy();
			expect(game._operationPluginManager.operated instanceof g.Trigger).toBe(true);
			expect(game._operationPluginManager.plugins).toEqual({});
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("initialize()", function(done) {
		game._loaded.add(function () {
			var self = game._operationPluginManager;
			expect(self._initialized).toBe(false);
			self.initialize();
			expect(self._initialized).toBe(true);
			self.initialize();  // 通過パス稼ぎのため二度目の呼び出し
			expect(self.plugins[42]).not.toBeFalsy();
			expect(self.plugins[42]._started).toBe(true);
			expect(self.plugins[42]._game).toBe(game);
			expect(self.plugins[42]._viewInfo).toBe(dummyViewInfo);
			expect(self.plugins[10]).toBeFalsy();
			expect(self.plugins[15]).toBeFalsy();
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("operated", function(done) {
		game._loaded.add(function () {
			var self = game._operationPluginManager;
			self.initialize();

			var ops = [];
			self.operated.add(function (op) { ops.push(op); });
			self.plugins[42].debugFire(["foo", 1]);
			self.plugins[42].debugFire([4]);
			expect(ops).toEqual([
				{ _code: 42, data: ["foo", 1] },
				{ _code: 42, data: [4] }
			]);
			self.plugins[42].debugFire({ local: true, data: [] });
			expect(ops[2]).toEqual({ _code: 42, local: true, data: [] });
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("destroy", function(done) {
		game._loaded.add(function () {
			var self = game._operationPluginManager;
			self.initialize();
			self.destroy();
			expect(self.operated).toBeFalsy();
			expect(self.plugins).toBeFalsy();
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
