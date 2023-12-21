import type { GameConfiguration } from "..";
import { Module, PathUtil, Scene, XorshiftRandomGenerator } from "..";
import { customMatchers, Game } from "./helpers";

expect.extend(customMatchers);

describe("test Module", () => {
	function resolveGameConfigurationPath(gameConfiguration: any, pathConverter: any): any {
		function objectMap(obj: any, f: any): any {
			const o: any = {};
			Object.keys(obj).forEach(k => {
				o[k] = f(k, obj[k]);
			});
			return o;
		}
		return objectMap(gameConfiguration, (k: any, v: any): any => {
			switch (k) {
				case "assets":
					return objectMap(v, (_k: any, asset: any) => {
						return objectMap(asset, (k: any, v: any) => (k === "path" ? pathConverter(v) : v));
					});
				case "main":
					return pathConverter(v);
				default:
					return v;
			}
		});
	}

	const gameConfiguration: GameConfiguration = {
		width: 320,
		height: 320,
		fps: 30,
		main: "/script/foo.js",
		assets: {
			aGlobalAssetFoo: {
				type: "script",
				global: true,
				path: "/script/foo.js",
				virtualPath: "script/foo.js"
			},
			aNonGlobalAssetBar: {
				type: "script",
				path: "/script/bar.js",
				virtualPath: "script/bar.js"
			},
			// dummy modules
			dummymod: {
				type: "script",
				global: true,
				path: "/script/dummypath.js",
				virtualPath: "script/dummypath.js"
			},
			cascaded: {
				type: "script",
				global: true,
				path: "/cascaded/script.js",
				virtualPath: "script/cascaded.js"
			},
			moduleid: {
				type: "script",
				global: true,
				path: "/path/to/the/module.js",
				virtualPath: "path/to/the/module.js"
			},
			// basic
			"node_modules/noPackageJson/index.js": {
				type: "script",
				path: "/node_modules/noPackageJson/index.js",
				virtualPath: "node_modules/noPackageJson/index.js",
				global: true
			},
			"node_modules/noDefaultIndex/root.js": {
				type: "script",
				path: "/node_modules/noDefaultIndex/root.js",
				virtualPath: "node_modules/noDefaultIndex/root.js",
				global: true
			},
			"node_modules/noDefaultIndex/package.json": {
				type: "text",
				path: "/node_modules/noDefaultIndex/package.json",
				virtualPath: "node_modules/noDefaultIndex/package.json",
				global: true
			},
			"node_modules/wrongPackageJsonMain/package.json": {
				type: "text",
				path: "/node_modules/wrongPackageJsonMain/package.json",
				virtualPath: "node_modules/wrongPackageJsonMain/package.json",
				global: true
			},
			"node_modules/wrongPackageJsonMain/index.js": {
				type: "script",
				path: "/node_modules/wrongPackageJsonMain/index.js",
				virtualPath: "node_modules/wrongPackageJsonMain/index.js",
				global: true
			},
			"node_modules/wrongPackageJsonMain/aJsonFile.json": {
				type: "text",
				path: "/node_modules/wrongPackageJsonMain/aJsonFile.json",
				virtualPath: "node_modules/wrongPackageJsonMain/aJsonFile.json",
				global: true
			},
			// directory structure
			"script/useA.js": {
				type: "script",
				path: "/script/useA.js",
				virtualPath: "script/useA.js",
				global: true
			},
			"node_modules/moduleUsesA/index.js": {
				type: "script",
				path: "/node_modules/moduleUsesA/index.js",
				virtualPath: "node_modules/moduleUsesA/index.js",
				global: true
			},
			"node_modules/moduleUsesA/node_modules/libraryA/index.js": {
				type: "script",
				path: "/node_modules/moduleUsesA/node_modules/libraryA/index.js",
				virtualPath: "node_modules/moduleUsesA/node_modules/libraryA/index.js",
				global: true
			},
			"node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js": {
				type: "script",
				path: "/node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js",
				virtualPath: "node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js",
				global: true
			},
			"node_modules/libraryA/index.js": {
				type: "script",
				path: "/node_modules/libraryA/index.js",
				virtualPath: "node_modules/libraryA/index.js",
				global: true
			},
			// cyclic
			"node_modules/cyclic1/index.js": {
				type: "script",
				path: "/node_modules/cyclic1/index.js",
				virtualPath: "node_modules/cyclic1/index.js",
				global: true
			},
			"node_modules/cyclic1/node_modules/cyclic2/index.js": {
				type: "script",
				path: "/node_modules/cyclic1/node_modules/cyclic2/index.js",
				virtualPath: "node_modules/cyclic1/node_modules/cyclic2/index.js",
				global: true
			},
			"node_modules/cyclic1/node_modules/cyclic3/index.js": {
				type: "script",
				path: "/node_modules/cyclic1/node_modules/cyclic3/index.js",
				virtualPath: "node_modules/cyclic1/node_modules/cyclic3/index.js",
				global: true
			},
			// virtual path altering directory
			"script/realpath.js": {
				type: "script",
				path: "/script/realpath.js",
				virtualPath: "script/some/deep/vpath.js",
				global: true
			},
			// cache
			"script/cache1.js": {
				type: "script",
				path: "/script/cache1.js",
				virtualPath: "script/cache1.js",
				global: true
			},
			"script/cache2.js": {
				type: "script",
				path: "/script/cache2.js",
				virtualPath: "script/cache2.js",
				global: true
			},
			"node_modules/randomnumber/index.js": {
				type: "script",
				path: "/node_modules/randomnumber/index.js",
				virtualPath: "node_modules/randomnumber/index.js",
				global: true
			},
			"node_modules/noPackageJsonModule/hoge.js": {
				type: "script",
				path: "/node_modules/noPackageJsonModule/real_hoge.js",
				virtualPath: "node_modules/noPackageJsonModule/hoge.js",
				global: true
			},
			"node_modules/noPackageJsonModule/fuga.js": {
				type: "script",
				path: "/node_modules/noPackageJsonModule/real_fuga.js",
				virtualPath: "node_modules/noPackageJsonModule/fuga.js",
				global: true
			},
			// require.resolve
			"script/resolve1.js": {
				type: "script",
				path: "/script/resolve1.js",
				virtualPath: "script/resolve1.js",
				global: true
			},
			"script/resolve2.js": {
				type: "script",
				path: "/script/resolve2.js",
				virtualPath: "script/resolve2.js",
				global: true
			},
			"node_modules/externalResolvedModule/index.js": {
				type: "script",
				path: "/node_modules/externalResolvedModule/index.js",
				virtualPath: "node_modules/externalResolvedModule/index.js",
				global: true
			},
			dummydata: {
				type: "text",
				path: "/text/dummydata.txt",
				virtualPath: "text/dummydata.txt"
			}
		},
		moduleMainScripts: {
			noPackageJsonModule: "node_modules/noPackageJsonModule/hoge.js",
			externalResolvedModule: "node_modules/externalResolvedModule/index.js"
		}
	};

	const scriptContents: { [path: string]: string } = {
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
		"/node_modules/wrongPackageJsonMain/aJsonFile.json": "{ 'aJsonFile': 'aValue' }",
		"/node_modules/noPackageJsonModule/real_hoge.js": "module.exports = { me: 'noPackageJsonModule', thisModule: module }",
		"/node_modules/noPackageJsonModule/real_fuga.js": "module.exports = { me: 'dummy'}",

		// directory structure
		"/script/useA.js": [
			"const modUsesA = require('moduleUsesA');",
			"const libA = require('libraryA');",
			"module.exports = { 'me': 'script-useA', thisModule: module, libraryA: libA, moduleUsesA: modUsesA }; "
		].join("\n"),
		"/node_modules/moduleUsesA/index.js": [
			"const libA = require('libraryA');",
			"module.exports = { 'me': 'moduleUsesA-index', thisModule: module, libraryA: libA };"
		].join("\n"),
		"/node_modules/moduleUsesA/node_modules/libraryA/index.js": [
			"const foo = require('./lib/foo/foo');",
			"module.exports = { 'me': 'moduleUsesALibraryA-index', thisModule: module, foo: foo };"
		].join("\n"),
		"/node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js":
			"module.exports = { me: 'moduleUsesALibraryA-lib-foo-foo', thisModule: module };",
		"/node_modules/libraryA/index.js": "module.exports = { me: 'libraryA-index', thisModule: module };",

		// cyclic
		"/node_modules/cyclic1/index.js": [
			"module.exports = 'notyet';",
			"const c2 = require('cyclic2');",
			"const c3 = require('cyclic3');",
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
			"const c3 = require('cyclic3');",
			"module.exports = { me: 'cyclic2', thisModule: module, c3: c3, c3loaded: c3.thisModule.loaded };"
		].join("\n"),
		"/node_modules/cyclic1/node_modules/cyclic3/index.js": [
			"const c1 = require('cyclic1');",
			"module.exports = { me: 'cyclic3', thisModule: module, c1: c1 };"
		].join("\n"),

		// virtual path altering directory
		"script/some/deep/realpath.js": "module.exports = { me: 'realpath', thisModule: module}",

		// cache
		"/script/cache1.js":
			"module.exports = { v1: require('randomnumber'), v2: require('randomnumber'), cache2: require('./cache2.js') };",
		"/script/cache2.js": "module.exports = { v1: require('randomnumber'), v2: require('randomnumber') };",
		"/node_modules/randomnumber/index.js": "module.exports = g.game.random.generate();",

		// require.resolve
		"/script/resolve1.js": [
			"module.exports = [",
			"  require.resolve('./resolve2'),", // relative file path (.js)
			"  require.resolve('../text/dummydata.txt'),", // relative file path
			"  require.resolve('libraryA'),", // external module
			"  require('externalResolvedModule').resolvedPathAsDirectory,", // as a directory path in the external module
			"  require('externalResolvedModule').resolvedPathAsFile,", // as a file path in the external module
			"  require('externalResolvedModule').resolvedPathAsExtModule,", // as a external module in the external module
			"];"
		].join("\n"),
		"/script/resolve2.js": "module.exports = {};",
		"/node_modules/externalResolvedModule/index.js": [
			"module.exports = {",
			"  resolvedPathAsDirectory: require.resolve('./'),",
			"  resolvedPathAsFile: require.resolve('./index.js'),",
			"  resolvedPathAsExtModule: require.resolve('libraryA'),",
			"};"
		].join("\n"),
		"/text/dummydata.txt": "dummydata"
	};

	it("初期化", done => {
		const path = "/path/to/the/module.js";
		const dirname = "/path/to/the";
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				id: "moduleid",
				path,
				virtualPath: path,
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule),
				runtimeValueBase: game._runtimeValueBase
			});

			expect(module.id).toBe("moduleid");
			expect(module.filename).toBe(path);
			expect(module.exports instanceof Object).toBe(true);
			expect(module.parent).toBe(null);
			expect(module.loaded).toBe(false);
			expect(module.children).toEqual([]);
			expect(module.paths).toEqual(["/path/to/the/node_modules", "/path/to/node_modules", "/path/node_modules", "/node_modules"]);
			expect(module.require instanceof Function).toBe(true);
			expect(() => {
				module.require.resolve("../not/exists");
			}).toThrowError("AssertionError");
			expect(module._dirname).toBe(dirname);
			expect(module._runtimeValue.game).toBe(game);
			expect(module._runtimeValue.filename).toBe(path);
			expect(module._runtimeValue.dirname).toBe(dirname);
			expect(module._runtimeValue.module).toBe(module);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("g._require()", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		game.resourceFactory.scriptContents = scriptContents;

		game._onLoad.add(() => {
			const mod = manager._require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJson/index.js");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic", done => {
		const game = new Game(gameConfiguration, "./");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				runtimeValueBase: game._runtimeValueBase,
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			let mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/foo.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJson/index.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noDefaultIndex/root.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/wrongPackageJsonMain/index.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/foo.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			mod = module.require("noPackageJsonModule");
			expect(mod.me).toBe("noPackageJsonModule");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJsonModule/real_hoge.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);

			expect(() => {
				module.require("aNonGlobalAssetBar");
			}).toThrowError("AssertionError");
			const scene = new Scene({
				game: game,
				assetIds: ["aNonGlobalAssetBar"]
			});
			scene.onLoad.add(() => {
				let mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule instanceof Module).toBe(true);
				expect(mod.thisModule.filename).toBe("/script/bar.js");
				expect(mod.thisModule.parent).toBe(module);
				expect(mod.thisModule.children).toEqual([]);
				expect(mod.thisModule.loaded).toBe(true);

				mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushPostTickTasks();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic/URL", done => {
		const assetBase = "http://some.where";

		const scripts: { [path: string]: string } = {};
		Object.keys(scriptContents).forEach(k => {
			scripts[assetBase + k] = scriptContents[k];
		});
		const conf = resolveGameConfigurationPath(gameConfiguration, (p: any) => {
			return PathUtil.resolvePath(assetBase, p);
		});

		const game = new Game(conf, assetBase + "/");
		const manager = game._moduleManager;
		const path = assetBase + "/script/dummypath.js";
		game.resourceFactory.scriptContents = scripts;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			let mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noPackageJson/index.js");

			mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noDefaultIndex/root.js");

			mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/wrongPackageJsonMain/index.js");

			mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			expect(() => {
				module.require("aNonGlobalAssetBar");
			}).toThrowError("AssertionError");
			const scene = new Scene({
				game: game,
				assetIds: ["aNonGlobalAssetBar"]
			});
			scene.onLoad.add(() => {
				let mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushPostTickTasks();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic/relative", done => {
		const assetBase = ".";

		const scripts: any = {};
		Object.keys(scriptContents).forEach(k => {
			scripts[assetBase + k] = scriptContents[k];
		});
		const conf = resolveGameConfigurationPath(gameConfiguration, (p: any) => {
			return assetBase + p;
		});

		const game = new Game(conf, assetBase + "/");
		const manager = game._moduleManager;
		const path = assetBase + "/script/dummypath.js";
		game.resourceFactory.scriptContents = scripts;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			let mod = module.require("./foo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			mod = module.require("noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noPackageJson/index.js");

			mod = module.require("noDefaultIndex");
			expect(mod.me).toBe("noDefaultIndex-root");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/noDefaultIndex/root.js");

			mod = module.require("wrongPackageJsonMain");
			expect(mod.me).toBe("wrongPackageJsonMain-index");
			expect(mod.thisModule.filename).toBe(assetBase + "/node_modules/wrongPackageJsonMain/index.js");

			mod = module.require("aGlobalAssetFoo");
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule.filename).toBe(assetBase + "/script/foo.js");

			expect(() => {
				module.require("aNonGlobalAssetBar");
			}).toThrowError("AssertionError");
			const scene = new Scene({
				game: game,
				assetIds: ["aNonGlobalAssetBar"]
			});
			scene.onLoad.add(() => {
				let mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushPostTickTasks();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - directory structure", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			const useA = module.require("./useA.js");
			expect(useA.me).toBe("script-useA");
			expect(useA.thisModule instanceof Module).toBe(true);
			expect(useA.thisModule.filename).toBe("/script/useA.js");
			expect(useA.thisModule.parent).toBe(module);
			expect(useA.thisModule.children.length).toBe(2);
			expect(useA.thisModule.children[0] instanceof Module).toBe(true);
			expect(useA.thisModule.children[0].exports).toBe(useA.moduleUsesA);
			expect(useA.thisModule.children[1] instanceof Module).toBe(true);
			expect(useA.thisModule.children[1].exports).toBe(useA.libraryA);
			expect(useA.thisModule.loaded).toBe(true);

			const moduleUsesA = useA.moduleUsesA;
			expect(moduleUsesA.me).toBe("moduleUsesA-index");
			expect(moduleUsesA.thisModule.parent).toBe(useA.thisModule);
			expect(moduleUsesA.thisModule.children.length).toBe(1);
			expect(moduleUsesA.thisModule.children[0] instanceof Module).toBe(true);
			expect(moduleUsesA.thisModule.children[0].exports).toBe(moduleUsesA.libraryA);
			expect(moduleUsesA.thisModule.loaded).toBe(true);

			const moduleUsesALibraryA = moduleUsesA.libraryA;
			expect(moduleUsesALibraryA.me).toBe("moduleUsesALibraryA-index");
			expect(moduleUsesALibraryA.thisModule.parent).toBe(moduleUsesA.thisModule);
			expect(moduleUsesALibraryA.thisModule.children.length).toBe(1);
			expect(moduleUsesALibraryA.thisModule.children[0] instanceof Module).toBe(true);
			expect(moduleUsesALibraryA.thisModule.children[0].exports).toBe(moduleUsesALibraryA.foo);
			expect(moduleUsesALibraryA.thisModule.loaded).toBe(true);

			const moduleUsesALibraryAFoo = moduleUsesALibraryA.foo;
			expect(moduleUsesALibraryAFoo.me).toBe("moduleUsesALibraryA-lib-foo-foo");
			expect(moduleUsesALibraryAFoo.thisModule.parent).toBe(moduleUsesALibraryA.thisModule);
			expect(moduleUsesALibraryAFoo.thisModule.children.length).toBe(0);
			expect(moduleUsesALibraryAFoo.thisModule.loaded).toBe(true);

			const libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.parent).toBe(useA.thisModule);
			expect(libraryA.thisModule.children.length).toBe(0);
			expect(libraryA.thisModule.loaded).toBe(true);

			expect(moduleUsesALibraryA).not.toBe(libraryA);

			const keys = Object.keys(manager._scriptCaches);
			expect(keys.includes("script/useA.js")).toBeTruthy();
			expect(keys.includes("node_modules/moduleUsesA/index.js")).toBeTruthy();
			expect(keys.includes("node_modules/moduleUsesA/node_modules/libraryA/index.js")).toBeTruthy();
			expect(keys.includes("node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js")).toBeTruthy();
			expect(keys.includes("node_modules/libraryA/index.js")).toBeTruthy();
			// node_modules/libraryA が node_modules/libraryA/index.js として登録されていることを確認
			expect(keys.includes("node_modules/libraryA")).toBeFalsy();

			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - directory structure/URL", done => {
		const assetBase = "http://some.where";
		const scripts: any = {};
		Object.keys(scriptContents).forEach((k: any) => {
			scripts[assetBase + k] = scriptContents[k];
		});
		const conf = resolveGameConfigurationPath(gameConfiguration, (p: any) => {
			return PathUtil.resolvePath(assetBase, p);
		});

		const game = new Game(conf, assetBase + "/");
		const manager = game._moduleManager;
		const path = assetBase + "/script/dummypath.js";
		game.resourceFactory.scriptContents = scripts;

		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			const useA = module.require("./useA.js");
			expect(useA.me).toBe("script-useA");
			expect(useA.thisModule.filename).toBe(assetBase + "/script/useA.js");
			expect(useA.thisModule.children[0].exports).toBe(useA.moduleUsesA);
			expect(useA.thisModule.children[1].exports).toBe(useA.libraryA);

			const moduleUsesA = useA.moduleUsesA;
			expect(moduleUsesA.me).toBe("moduleUsesA-index");
			expect(moduleUsesA.thisModule.children[0].exports).toBe(moduleUsesA.libraryA);

			const moduleUsesALibraryA = moduleUsesA.libraryA;
			expect(moduleUsesALibraryA.me).toBe("moduleUsesALibraryA-index");
			expect(moduleUsesALibraryA.thisModule.children[0].exports).toBe(moduleUsesALibraryA.foo);

			const moduleUsesALibraryAFoo = moduleUsesALibraryA.foo;
			expect(moduleUsesALibraryAFoo.me).toBe("moduleUsesALibraryA-lib-foo-foo");
			expect(moduleUsesALibraryAFoo.thisModule.children.length).toBe(0);

			const libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.children.length).toBe(0);

			expect(moduleUsesALibraryA).not.toBe(libraryA);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - cyclic", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});
			const c1 = module.require("cyclic1");
			expect(c1.me).toBe("cyclic1");
			expect(c1.thisModule instanceof Module).toBe(true);
			expect(c1.thisModule.children.length).toBe(1);
			expect(c1.thisModule.children[0].exports).toBe(c1.c2);
			expect(c1.c2loaded).toBe(true);
			expect(c1.c3loaded).toBe(true);

			const c2 = c1.c2;
			expect(c2.me).toBe("cyclic2");
			expect(c2.thisModule instanceof Module).toBe(true);
			expect(c2.thisModule.parent).toBe(c1.thisModule);
			expect(c2.thisModule.children.length).toBe(1);
			expect(c2.thisModule.children[0].exports).toBe(c1.c3);
			expect(c2.c3loaded).toBe(true);

			const c3 = c2.c3;
			expect(c3.me).toBe("cyclic3");
			expect(c3.thisModule instanceof Module).toBe(true);
			expect(c3.thisModule.parent).toBe(c2.thisModule);
			expect(c3.thisModule.children.length).toBe(0);
			expect(c3.c1).toBe("notyet");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - virtual path altering directory", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/realpath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});
			const mod = module.require("../../foo"); // virtualPath: /script/some/deep/vpath.js からのrequire()
			expect(mod.me).toBe("script-foo");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/foo.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - cache", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game.random = new XorshiftRandomGenerator(1);
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});

			const cache1 = module.require("./cache1");
			expect(cache1.v1).toBe(cache1.v2);
			expect(cache1.v1).toBe(cache1.cache2.v1);
			expect(cache1.v1).toBe(cache1.cache2.v2);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - to cascaded module", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});
			const mod = module.require("./cascaded");
			expect(mod.me).toBe("script-cascaded");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/cascaded/script.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - from cascaded module", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/cascaded/script.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.add(() => {
			const module = new Module({
				runtimeValueBase: game._runtimeValueBase,
				id: "dummymod",
				path,
				virtualPath: game._assetManager._liveAssetPathTable[path],
				requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
				resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
			});
			const mod = module.require("./dummypath");
			expect(mod.me).toBe("script-dummymod");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/script/dummypath.js");
			expect(mod.thisModule.parent).toBe(module);
			expect(mod.thisModule.children).toEqual([]);
			expect(mod.thisModule.loaded).toBe(true);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("_resolvePath", done => {
		const game = new Game(gameConfiguration, "/");
		const manager = game._moduleManager;
		const path = "/script/dummypath.js";
		game.resourceFactory.scriptContents = scriptContents;
		game._onLoad.addOnce(() => {
			const scene = new Scene({
				game: game,
				assetIds: ["dummydata"]
			});
			scene.onLoad.add(() => {
				const module = new Module({
					runtimeValueBase: game._runtimeValueBase,
					id: "dummymod",
					path,
					virtualPath: game._assetManager._liveAssetPathTable[path],
					requireFunc: (path: string, currentModule?: Module) => manager._require(path, currentModule),
					resolveFunc: (path: string, currentModule?: Module) => manager._resolvePath(path, currentModule)
				});
				const mod = module.require("./resolve1");
				expect(mod).toEqual([
					"/script/resolve2.js",
					"/text/dummydata.txt",
					"/node_modules/libraryA/index.js",
					"/node_modules/externalResolvedModule/index.js",
					"/node_modules/externalResolvedModule/index.js",
					"/node_modules/libraryA/index.js"
				]);
				done();
			});
			game.pushScene(scene);
			game._flushPostTickTasks();
		});
		game._startLoadingGlobalAssets();
	});

	it("_findAssetByPathAsFile", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const manager = game._moduleManager;
		const liveAssetPathTable = {
			"foo/bar.js": game.resourceFactory.createScriptAsset("bar", "/foo/bar.js"),
			"zoo.js": game.resourceFactory.createScriptAsset("zoo", "/zoo.js")
		};
		expect(manager._findAssetByPathAsFile("foo/bar.js", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(manager._findAssetByPathAsFile("foo/bar", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(manager._findAssetByPathAsFile("zoo", liveAssetPathTable)).toBe(liveAssetPathTable["zoo.js"]);
		expect(manager._findAssetByPathAsFile("zoo/roo.js", liveAssetPathTable)).toBe(undefined);
	});

	it("_findAssetByPathDirectory", done => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const pkgJsonAsset = game.resourceFactory.createTextAsset("foopackagejson", "foo/package.json");
		const liveAssetPathTable = {
			"foo/root.js": game.resourceFactory.createScriptAsset("root", "/foo/root.js"),
			"foo/package.json": pkgJsonAsset,
			"foo/index.js": game.resourceFactory.createScriptAsset("fooindex", "/foo/index.js"),
			"bar/index.js": game.resourceFactory.createScriptAsset("barindex", "/bar/index.js"),
			"zoo/roo/notMain.js": game.resourceFactory.createScriptAsset("zooRooNotMain", "/zoo/roo/notMain.js")
		};
		const manager = game._moduleManager;
		game.resourceFactory.scriptContents = {
			"foo/package.json": '{ "main": "root.js" }'
		};
		pkgJsonAsset._load({
			_onAssetError: e => {
				throw e;
			},
			_onAssetLoad: () => {
				try {
					expect(manager._findAssetByPathAsDirectory("foo", liveAssetPathTable)).toBe(liveAssetPathTable["foo/root.js"]);
					expect(manager._findAssetByPathAsDirectory("bar", liveAssetPathTable)).toBe(liveAssetPathTable["bar/index.js"]);
					expect(manager._findAssetByPathAsDirectory("zoo/roo", liveAssetPathTable)).toBe(undefined);
					expect(manager._findAssetByPathAsDirectory("tee", liveAssetPathTable)).toBe(undefined);
				} finally {
					done();
				}
			}
		});
	});

	it("_resolveAbsolutePathAsDirectory", done => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const pkgJsonAsset = game.resourceFactory.createTextAsset("foopackagejson", "foo/package.json");
		const liveAssetPathTable = {
			"foo/root.js": game.resourceFactory.createScriptAsset("root", "/foo/root.js"),
			"foo/package.json": pkgJsonAsset,
			"bar/index.js": game.resourceFactory.createScriptAsset("barindex", "/bar/index.js"),
			"zoo/roo/notMain.js": game.resourceFactory.createScriptAsset("zooRooNotMain", "/zoo/roo/notMain.js")
		};
		const manager = game._moduleManager;
		game.resourceFactory.scriptContents = {
			"foo/package.json": '{ "main": "root.js" }'
		};

		pkgJsonAsset._load({
			_onAssetError: e => {
				throw e;
			},
			_onAssetLoad: () => {
				try {
					expect(manager._resolveAbsolutePathAsDirectory("foo", liveAssetPathTable)).toBe("/foo/root.js");
					expect(manager._resolveAbsolutePathAsDirectory("bar", liveAssetPathTable)).toBe("/bar/index.js");
					expect(manager._resolveAbsolutePathAsDirectory("zoo/roo", liveAssetPathTable)).toBeNull();
					expect(manager._resolveAbsolutePathAsDirectory("hoge", liveAssetPathTable)).toBeNull();
				} finally {
					done();
				}
			}
		});
	});
});
