describe("test Module", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");

	function resolveGameConfigurationPath(gameConfiguration, pathConverter) {
		function objectMap(obj, f) {
			var o = {};
			Object.keys(obj).forEach(function (k) { o[k] = f(k, obj[k]) });
			return o;
		}
		return objectMap(gameConfiguration, function (k, v) {
			switch (k) {
			case "assets":
				return objectMap(v, function (k, asset) {
					return objectMap(asset, function (k, v) { return (k === "path") ? pathConverter(v) : v; });
				});
			case "main":
				return pathConverter(v);
			default:
				return v;
			}
		});
	}

	var gameConfiguration = {
		"width": 320,
		"height": 320,
		"fps": 30,
		"assets": {
			"aGlobalAssetFoo": {
				"type": "script",
				"global": true,
				"path": "/script/foo.js",
				"virtualPath": "script/foo.js"
			},
			"aNonGlobalAssetBar": {
				"type": "script",
				"path": "/script/bar.js",
				"virtualPath": "script/bar.js"
			},
			// dummy modules
			"dummymod": {
				"type": "script",
				"global": true,
				"path": "/script/dummypath.js",
				"virtualPath": "script/dummypath.js"
			},
			"cascaded": {
				"type": "script",
				"global": true,
				"path": "/cascaded/script.js",
				"virtualPath": "script/cascaded.js"
			},
			"moduleid": {
				"type": "script",
				"global": true,
				"path": "/path/to/the/module.js",
				"virtualPath": "path/to/the/module.js"
			},
			// basic
			"node_modules/noPackageJson/index.js": {
				"type": "script",
				"path": "/node_modules/noPackageJson/index.js",
				"virtualPath": "node_modules/noPackageJson/index.js",
				"global": true
			},
			"node_modules/noDefaultIndex/root.js": {
				"type": "script",
				"path": "/node_modules/noDefaultIndex/root.js",
				"virtualPath": "node_modules/noDefaultIndex/root.js",
				"global": true
			},
			"node_modules/noDefaultIndex/package.json": {
				"type": "text",
				"path": "/node_modules/noDefaultIndex/package.json",
				"virtualPath": "node_modules/noDefaultIndex/package.json",
				"global": true
			},
			"node_modules/wrongPackageJsonMain/package.json": {
				"type": "text",
				"path": "/node_modules/wrongPackageJsonMain/package.json",
				"virtualPath": "node_modules/wrongPackageJsonMain/package.json",
				"global": true
			},
			"node_modules/wrongPackageJsonMain/index.js": {
				"type": "script",
				"path": "/node_modules/wrongPackageJsonMain/index.js",
				"virtualPath": "node_modules/wrongPackageJsonMain/index.js",
				"global": true
			},
			"node_modules/wrongPackageJsonMain/aJsonFile.json": {
				"type": "text",
				"path": "/node_modules/wrongPackageJsonMain/aJsonFile.json",
				"virtualPath": "node_modules/wrongPackageJsonMain/aJsonFile.json",
				"global": true
			},
			// directory structure
			"script/useA.js": {
				"type": "script",
				"path": "/script/useA.js",
				"virtualPath": "script/useA.js",
				"global": true
			},
			"node_modules/moduleUsesA/index.js": {
				"type": "script",
				"path": "/node_modules/moduleUsesA/index.js",
				"virtualPath": "node_modules/moduleUsesA/index.js",
				"global": true
			},
			"node_modules/moduleUsesA/node_modules/libraryA/index.js": {
				"type": "script",
				"path": "/node_modules/moduleUsesA/node_modules/libraryA/index.js",
				"virtualPath": "node_modules/moduleUsesA/node_modules/libraryA/index.js",
				"global": true
			},
			"node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js": {
				"type": "script",
				"path": "/node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js",
				"virtualPath": "node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js",
				"global": true
			},
			"node_modules/libraryA/index.js": {
				"type": "script",
				"path": "/node_modules/libraryA/index.js",
				"virtualPath": "node_modules/libraryA/index.js",
				"global": true
			},
			// cyclic
			"node_modules/cyclic1/index.js": {
				"type": "script",
				"path": "/node_modules/cyclic1/index.js",
				"virtualPath": "node_modules/cyclic1/index.js",
				"global": true
			},
			"node_modules/cyclic1/node_modules/cyclic2/index.js": {
				"type": "script",
				"path": "/node_modules/cyclic1/node_modules/cyclic2/index.js",
				"virtualPath": "node_modules/cyclic1/node_modules/cyclic2/index.js",
				"global": true
			},
			"node_modules/cyclic1/node_modules/cyclic3/index.js": {
				"type": "script",
				"path": "/node_modules/cyclic1/node_modules/cyclic3/index.js",
				"virtualPath": "node_modules/cyclic1/node_modules/cyclic3/index.js",
				"global": true
			},
			// cache
			"script/cache1.js": {
				"type": "script",
				"path": "/script/cache1.js",
				"virtualPath": "script/cache1.js",
				"global": true
			},
			"script/cache2.js": {
				"type": "script",
				"path": "/script/cache2.js",
				"virtualPath": "script/cache2.js",
				"global": true
			},
			"node_modules/randomnumber/index.js": {
				"type": "script",
				"path": "/node_modules/randomnumber/index.js",
				"virtualPath": "node_modules/randomnumber/index.js",
				"global": true
			}
		}
	}

	var scriptContents = {
		// basic
		"/script/foo.js": "module.exports = { me: 'script-foo', thisModule: module }",
		"/script/bar.js": "module.exports = { me: 'script-bar', thisModule: module }",
		"/script/dummypath.js": "module.exports = { me: 'script-dummymod', thisModule: module }",
		"/cascaded/script.js": "module.exports = { me: 'script-cascaded', thisModule: module }",
		"/node_modules/noPackageJson/index.js": "module.exports = { me: 'noPackageJson-index', thisModule: module };",
		"/node_modules/noDefaultIndex/root.js": "exports.me = 'noDefaultIndex-root'; exports.thisModule = module; ",
		"/node_modules/noDefaultIndex/package.json": '{ "main": "root.js" }',
		"/node_modules/wrongPackageJsonMain/package.json": '{ "main": "__not_exists__.js" }',
		"/node_modules/wrongPackageJsonMain/index.js": "module.exports = { me: 'wrongPackageJsonMain-index', thisModule: module };",
		"/node_modules/wrongPackageJsonMain/aJsonFile.json": '{ "aJsonFile": "aValue" }',

		// directory structure
		"/script/useA.js": [
			"var modUsesA = require('moduleUsesA');",
			"var libA = require('libraryA');",
			"module.exports = { 'me': 'script-useA', thisModule: module, libraryA: libA, moduleUsesA: modUsesA }; "
		].join("\n"),
		"/node_modules/moduleUsesA/index.js": [
			"var libA = require('libraryA');",
			"module.exports = { 'me': 'moduleUsesA-index', thisModule: module, libraryA: libA };"
		].join("\n"),
		"/node_modules/moduleUsesA/node_modules/libraryA/index.js": [
			"var foo = require('./lib/foo/foo');",
			"module.exports = { 'me': 'moduleUsesA_libraryA-index', thisModule: module, foo: foo };"
		].join("\n"),
		"/node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js": "module.exports = { me: 'moduleUsesA_libraryA-lib-foo-foo', thisModule: module };",
		"/node_modules/libraryA/index.js": "module.exports = { me: 'libraryA-index', thisModule: module };",

		// cyclic
		"/node_modules/cyclic1/index.js": [
			"module.exports = 'notyet';",
			"var c2 = require('cyclic2');",
			"var c3 = require('cyclic3');",
			"module.exports = {",
			"  me: 'cyclic1',",
			"  thisModule: module,",
			"  c2: c2,",
			"  c2loaded: c2.thisModule.loaded,",
			"  c3: c3,",
			"  c3loaded: c3.thisModule.loaded,",
			"};"
		].join("\n"),
		"/node_modules/cyclic1/node_modules/cyclic2/index.js": [
			"var c3 = require('cyclic3');",
			"module.exports = { me: 'cyclic2', thisModule: module, c3: c3, c3loaded: c3.thisModule.loaded };"
		].join("\n"),
		"/node_modules/cyclic1/node_modules/cyclic3/index.js": [
			"var c1 = require('cyclic1');",
			"module.exports = { me: 'cyclic3', thisModule: module, c1: c1 };"
		].join("\n"),

		// cache
		"/script/cache1.js": "module.exports = { v1: require('randomnumber'), v2: require('randomnumber'), cache2: require('./cache2.js') };",
		"/script/cache2.js": "module.exports = { v1: require('randomnumber'), v2: require('randomnumber') };",
		"/node_modules/randomnumber/index.js": "module.exports = g.game.random.get(0, 1000000);",
	};

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function (done) {
		var path = "/path/to/the/module.js";
		var dirname = "/path/to/the";
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "moduleid", path);
			expect(module.id).toBe("moduleid");
			expect(module.filename).toBe(path);
			expect(module.exports instanceof Object).toBe(true);
			expect(module.parent).toBe(null);
			expect(module.loaded).toBe(false);
			expect(module.children).toEqual([]);
			expect(module.paths).toEqual([
				"/path/to/the/node_modules",
				"/path/to/node_modules",
				"/path/node_modules",
				"/node_modules",
			]);
			expect(module.require instanceof Function).toBe(true);
			expect(module._dirname).toBe(dirname);
			expect(module._g.game).toBe(game);
			expect(module._g.filename).toBe(path);
			expect(module._g.dirname).toBe(dirname);
			expect(module._g.module).toBe(module);
		});
		done();
	});

	it("g._require()", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;

		game._loaded.handle(function () {
			var mod = g._require(game, "noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJson/index.js");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummypath", "/script/dummypath.js");
			var mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/foo.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			var mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJson/index.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			var mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noDefaultIndex/root.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			var mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/wrongPackageJsonMain/index.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			var mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/foo.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
			var scene = new g.Scene({game: game, assetIds: ["aNonGlobalAssetBar"]});
			scene.loaded.handle(function () {
				var mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule instanceof g.Module).toBe(true);
				expect(mod.thisModule.filename).toBe("/script/bar.js");
				expect(mod.thisModule.parent).toBe(module);
				expect(mod.thisModule.children).toEqual([]);
				expect(mod.thisModule.loaded).toBe(true);

				var mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushSceneChangeRequests();
				expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic/URL", function (done) {
		var assetBase = "http://some.where";

		var scripts = {};
		Object.keys(scriptContents).forEach(function (k) { scripts[assetBase + k] = scriptContents[k]; });
		var conf = resolveGameConfigurationPath(gameConfiguration, function (p) { return g.PathUtil.resolvePath(assetBase, p); });

		var game = new mock.Game(conf, assetBase + "/");
		game.resourceFactory.scriptContents = scripts;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", assetBase + "/script/dummypath.js");

			var mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			var mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noPackageJson/index.js");

			var mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noDefaultIndex/root.js");

			var mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/wrongPackageJsonMain/index.js");

			var mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
			var scene = new g.Scene({game: game, assetIds: ["aNonGlobalAssetBar"]});
			scene.loaded.handle(function () {
				var mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				var mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushSceneChangeRequests();
				expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic/relative", function (done) {
		var assetBase = ".";

		var scripts = {};
		Object.keys(scriptContents).forEach(function (k) { scripts[assetBase + k] = scriptContents[k]; });
		var conf = resolveGameConfigurationPath(gameConfiguration, function (p) { return assetBase + p; });

		var game = new mock.Game(conf, assetBase + "/");
		game.resourceFactory.scriptContents = scripts;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", assetBase + "/script/dummypath.js");

			var mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			var mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noPackageJson/index.js");

			var mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noDefaultIndex/root.js");

			var mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/wrongPackageJsonMain/index.js");

			var mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
			var scene = new g.Scene({game:game, assetIds: ["aNonGlobalAssetBar"]});
			scene.loaded.handle(function () {
				var mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				var mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushSceneChangeRequests();
				expect(function () { module.require("aNonGlobalAssetBar") }).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - directory structure", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", "/script/dummypath.js");

			var useA = module.require("./useA.js");
			expect(useA.me).toBe("script-useA");
			expect(useA.thisModule instanceof g.Module).toBe(true);
			expect(useA.thisModule.filename).toBe("/script/useA.js");
			expect(useA.thisModule.parent).toBe(module);
			expect(useA.thisModule.children.length).toBe(2);
			expect(useA.thisModule.children[0] instanceof g.Module).toBe(true);
			expect(useA.thisModule.children[0].exports).toBe(useA.moduleUsesA);
			expect(useA.thisModule.children[1] instanceof g.Module).toBe(true);
			expect(useA.thisModule.children[1].exports).toBe(useA.libraryA);
			expect(useA.thisModule.loaded).toBe(true);

			var moduleUsesA = useA.moduleUsesA;
			expect(moduleUsesA.me).toBe("moduleUsesA-index");
			expect(moduleUsesA.thisModule.parent).toBe(useA.thisModule);
			expect(moduleUsesA.thisModule.children.length).toBe(1);
			expect(moduleUsesA.thisModule.children[0] instanceof g.Module).toBe(true);
			expect(moduleUsesA.thisModule.children[0].exports).toBe(moduleUsesA.libraryA);
			expect(moduleUsesA.thisModule.loaded).toBe(true);

			var moduleUsesA_libraryA = moduleUsesA.libraryA;
			expect(moduleUsesA_libraryA.me).toBe("moduleUsesA_libraryA-index");
			expect(moduleUsesA_libraryA.thisModule.parent).toBe(moduleUsesA.thisModule);
			expect(moduleUsesA_libraryA.thisModule.children.length).toBe(1);
			expect(moduleUsesA_libraryA.thisModule.children[0] instanceof g.Module).toBe(true);
			expect(moduleUsesA_libraryA.thisModule.children[0].exports).toBe(moduleUsesA_libraryA.foo);
			expect(moduleUsesA_libraryA.thisModule.loaded).toBe(true);

			var moduleUsesA_libraryA_foo = moduleUsesA_libraryA.foo;
			expect(moduleUsesA_libraryA_foo.me).toBe("moduleUsesA_libraryA-lib-foo-foo");
			expect(moduleUsesA_libraryA_foo.thisModule.parent).toBe(moduleUsesA_libraryA.thisModule);
			expect(moduleUsesA_libraryA_foo.thisModule.children.length).toBe(0);
			expect(moduleUsesA_libraryA_foo.thisModule.loaded).toBe(true);

			var libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.parent).toBe(useA.thisModule);
			expect(libraryA.thisModule.children.length).toBe(0);
			expect(libraryA.thisModule.loaded).toBe(true);

			expect(moduleUsesA_libraryA).not.toBe(libraryA);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - directory structure/URL", function (done) {
		var assetBase = "http://some.where";
		var scripts = {};
		Object.keys(scriptContents).forEach(function (k) { scripts[assetBase + k] = scriptContents[k]; });
		var conf = resolveGameConfigurationPath(gameConfiguration, function (p) { return g.PathUtil.resolvePath(assetBase, p); });

		var game = new mock.Game(conf, assetBase + "/");
		game.resourceFactory.scriptContents = scripts;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", assetBase + "/script/dummypath.js");

			var useA = module.require("./useA.js");
			expect(useA.me).toBe("script-useA");
			expect(useA.thisModule.filename).toBe(assetBase + "/script/useA.js");
			expect(useA.thisModule.children[0].exports).toBe(useA.moduleUsesA);
			expect(useA.thisModule.children[1].exports).toBe(useA.libraryA);

			var moduleUsesA = useA.moduleUsesA;
			expect(moduleUsesA.me).toBe("moduleUsesA-index");
			expect(moduleUsesA.thisModule.children[0].exports).toBe(moduleUsesA.libraryA);

			var moduleUsesA_libraryA = moduleUsesA.libraryA;
			expect(moduleUsesA_libraryA.me).toBe("moduleUsesA_libraryA-index");
			expect(moduleUsesA_libraryA.thisModule.children[0].exports).toBe(moduleUsesA_libraryA.foo);

			var moduleUsesA_libraryA_foo = moduleUsesA_libraryA.foo;
			expect(moduleUsesA_libraryA_foo.me).toBe("moduleUsesA_libraryA-lib-foo-foo");
			expect(moduleUsesA_libraryA_foo.thisModule.children.length).toBe(0);

			var libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.children.length).toBe(0);

			expect(moduleUsesA_libraryA).not.toBe(libraryA);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - cyclic", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", "/script/dummypath.js");

			var c1 = module.require("cyclic1");
			expect(c1.me).toBe("cyclic1");
			expect(c1.thisModule instanceof g.Module).toBe(true);
			expect(c1.thisModule.children.length).toBe(1);
			expect(c1.thisModule.children[0].exports).toBe(c1.c2);
			expect(c1.c2loaded).toBe(true);
			expect(c1.c3loaded).toBe(true);

			var c2 = c1.c2;
			expect(c2.me).toBe("cyclic2");
			expect(c2.thisModule instanceof g.Module).toBe(true);
			expect(c2.thisModule.parent).toBe(c1.thisModule);
			expect(c2.thisModule.children.length).toBe(1);
			expect(c2.thisModule.children[0].exports).toBe(c1.c3);
			expect(c2.c3loaded).toBe(true);

			var c3 = c2.c3;
			expect(c3.me).toBe("cyclic3");
			expect(c3.thisModule instanceof g.Module).toBe(true);
			expect(c3.thisModule.parent).toBe(c2.thisModule);
			expect(c3.thisModule.children.length).toBe(0);
			expect(c3.c1).toBe("notyet");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - cache", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game.random = new g.XorshiftRandomGenerator(1);
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", "/script/dummypath.js");
			var cache1 = module.require("./cache1");
			expect(cache1.v1).toBe(cache1.v2);
			expect(cache1.v1).toBe(cache1.cache2.v1);
			expect(cache1.v1).toBe(cache1.cache2.v2);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - to cascaded module", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "dummymod", "/script/dummypath.js");
			var mod = module.require("./cascaded");
			expect(mod.me).toBe("script-cascaded");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/cascaded/script.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - from cascaded module", function (done) {
		var game = new mock.Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(function () {
			var module = new g.Module(game, "cascaded", "/cascaded/script.js");
			var mod = module.require("./dummypath");
			expect(mod.me).toBe("script-dummymod");
			expect(mod.thisModule instanceof g.Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/dummypath.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
