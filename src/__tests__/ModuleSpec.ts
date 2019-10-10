import { Module, _require, Scene, PathUtil, XorshiftRandomGenerator, _findAssetByPathAsFile, _findAssetByPathAsDirectory } from "..";
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
					return objectMap(v, (k: any, asset: any) => {
						return objectMap(asset, (k: any, v: any) => (k === "path" ? pathConverter(v) : v));
					});
				case "main":
					return pathConverter(v);
				default:
					return v;
			}
		});
	}

	const gameConfiguration: any = {
		width: 320,
		height: 320,
		fps: 30,
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
			}
		},
		moduleMainScripts: {
			noPackageJsonModule: "node_modules/noPackageJsonModule/hoge.js"
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
		"/node_modules/noDefaultIndex/package.json": "{ \"main\": \"root.js\" }",
		"/node_modules/wrongPackageJsonMain/package.json": "{ \"main\": \"__not_exists__.js\" }",
		"/node_modules/wrongPackageJsonMain/index.js": "module.exports = { me: 'wrongPackageJsonMain-index', thisModule: module };",
		"/node_modules/wrongPackageJsonMain/aJsonFile.json": "{ \"aJsonFile\": \"aValue\" }",
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
			"module.exports = { 'me': 'moduleUsesA_libraryA-index', thisModule: module, foo: foo };"
		].join("\n"),
		"/node_modules/moduleUsesA/node_modules/libraryA/lib/foo/foo.js":
			"module.exports = { me: 'moduleUsesA_libraryA-lib-foo-foo', thisModule: module };",
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
		"/node_modules/randomnumber/index.js": "module.exports = g.game.random.get(0, 1000000);"
	};

	it("初期化", done => {
		const path = "/path/to/the/module.js";
		const dirname = "/path/to/the";
		const game = new Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "moduleid", path);
			expect(module.id).toBe("moduleid");
			expect(module.filename).toBe(path);
			expect(module.exports instanceof Object).toBe(true);
			expect(module.parent).toBe(null);
			expect(module.loaded).toBe(false);
			expect(module.children).toEqual([]);
			expect(module.paths).toEqual(["/path/to/the/node_modules", "/path/to/node_modules", "/path/node_modules", "/node_modules"]);
			expect(module.require instanceof Function).toBe(true);
			expect(module._dirname).toBe(dirname);
			expect(module._g.game).toBe(game);
			expect(module._g.filename).toBe(path);
			expect(module._g.dirname).toBe(dirname);
			expect(module._g.module).toBe(module);
		});
		done();
	});

	it("g._require()", done => {
		const game = new Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;

		game._loaded.add(() => {
			const mod = _require(game, "noPackageJson");
			expect(mod.me).toBe("noPackageJson-index");
			expect(mod.thisModule instanceof Module).toBe(true);
			expect(mod.thisModule.filename).toBe("/node_modules/noPackageJson/index.js");
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - basic", done => {
		const game = new Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "dummypath", "/script/dummypath.js");
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
			scene.loaded.add(() => {
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
				game._flushSceneChangeRequests();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
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
		game.resourceFactory.scriptContents = scripts;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", assetBase + "/script/dummypath.js");

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
			scene.loaded.add(() => {
				let mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushSceneChangeRequests();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
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
		game.resourceFactory.scriptContents = scripts;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", assetBase + "/script/dummypath.js");

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
			scene.loaded.add(() => {
				let mod = module.require("aNonGlobalAssetBar");
				expect(mod.me).toBe("script-bar");
				expect(mod.thisModule.filename).toBe(assetBase + "/script/bar.js");

				mod = module.require("./bar");
				expect(mod.me).toBe("script-bar");

				game.popScene();
				game._flushSceneChangeRequests();
				expect(() => {
					module.require("aNonGlobalAssetBar");
				}).toThrowError("AssertionError");
				done();
			});
			game.pushScene(scene);
			game._flushSceneChangeRequests();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - directory structure", done => {
		const game = new Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", "/script/dummypath.js");

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

			const moduleUsesA_libraryA = moduleUsesA.libraryA;
			expect(moduleUsesA_libraryA.me).toBe("moduleUsesA_libraryA-index");
			expect(moduleUsesA_libraryA.thisModule.parent).toBe(moduleUsesA.thisModule);
			expect(moduleUsesA_libraryA.thisModule.children.length).toBe(1);
			expect(moduleUsesA_libraryA.thisModule.children[0] instanceof Module).toBe(true);
			expect(moduleUsesA_libraryA.thisModule.children[0].exports).toBe(moduleUsesA_libraryA.foo);
			expect(moduleUsesA_libraryA.thisModule.loaded).toBe(true);

			const moduleUsesA_libraryA_foo = moduleUsesA_libraryA.foo;
			expect(moduleUsesA_libraryA_foo.me).toBe("moduleUsesA_libraryA-lib-foo-foo");
			expect(moduleUsesA_libraryA_foo.thisModule.parent).toBe(moduleUsesA_libraryA.thisModule);
			expect(moduleUsesA_libraryA_foo.thisModule.children.length).toBe(0);
			expect(moduleUsesA_libraryA_foo.thisModule.loaded).toBe(true);

			const libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.parent).toBe(useA.thisModule);
			expect(libraryA.thisModule.children.length).toBe(0);
			expect(libraryA.thisModule.loaded).toBe(true);

			expect(moduleUsesA_libraryA).not.toBe(libraryA);
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
		game.resourceFactory.scriptContents = scripts;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", assetBase + "/script/dummypath.js");

			const useA = module.require("./useA.js");
			expect(useA.me).toBe("script-useA");
			expect(useA.thisModule.filename).toBe(assetBase + "/script/useA.js");
			expect(useA.thisModule.children[0].exports).toBe(useA.moduleUsesA);
			expect(useA.thisModule.children[1].exports).toBe(useA.libraryA);

			const moduleUsesA = useA.moduleUsesA;
			expect(moduleUsesA.me).toBe("moduleUsesA-index");
			expect(moduleUsesA.thisModule.children[0].exports).toBe(moduleUsesA.libraryA);

			const moduleUsesA_libraryA = moduleUsesA.libraryA;
			expect(moduleUsesA_libraryA.me).toBe("moduleUsesA_libraryA-index");
			expect(moduleUsesA_libraryA.thisModule.children[0].exports).toBe(moduleUsesA_libraryA.foo);

			const moduleUsesA_libraryA_foo = moduleUsesA_libraryA.foo;
			expect(moduleUsesA_libraryA_foo.me).toBe("moduleUsesA_libraryA-lib-foo-foo");
			expect(moduleUsesA_libraryA_foo.thisModule.children.length).toBe(0);

			const libraryA = useA.libraryA;
			expect(libraryA.me).toBe("libraryA-index");
			expect(libraryA.thisModule.children.length).toBe(0);

			expect(moduleUsesA_libraryA).not.toBe(libraryA);
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("require - cyclic", done => {
		const game = new Game(gameConfiguration, "/");
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", "/script/dummypath.js");

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
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.handle(() => {
			const module = new Module(game, "dummypath", "/script/realpath.js");
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
		game.resourceFactory.scriptContents = scriptContents;
		game.random = new XorshiftRandomGenerator(1);
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", "/script/dummypath.js");
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
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "dummymod", "/script/dummypath.js");
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
		game.resourceFactory.scriptContents = scriptContents;
		game._loaded.add(() => {
			const module = new Module(game, "cascaded", "/cascaded/script.js");
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

	it("_findAssetByPathAsFile", () => {
		const game = new Game({ width: 320, height: 320 });
		const liveAssetPathTable = {
			"foo/bar.js": game.resourceFactory.createScriptAsset("bar", "/foo/bar.js"),
			"zoo.js": game.resourceFactory.createScriptAsset("zoo", "/zoo.js")
		};
		expect(_findAssetByPathAsFile("foo/bar.js", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(_findAssetByPathAsFile("foo/bar", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(_findAssetByPathAsFile("zoo", liveAssetPathTable)).toBe(liveAssetPathTable["zoo.js"]);
		expect(_findAssetByPathAsFile("zoo/roo.js", liveAssetPathTable)).toBe(undefined);
	});

	it("_findAssetByPathDirectory", done => {
		const game = new Game({ width: 320, height: 320 });
		const pkgJsonAsset = game.resourceFactory.createTextAsset("foopackagejson", "foo/package.json");
		const liveAssetPathTable = {
			"foo/root.js": game.resourceFactory.createScriptAsset("root", "/foo/root.js"),
			"foo/package.json": pkgJsonAsset,
			"foo/index.js": game.resourceFactory.createScriptAsset("fooindex", "/foo/index.js"),
			"bar/index.js": game.resourceFactory.createScriptAsset("barindex", "/bar/index.js"),
			"zoo/roo/notMain.js": game.resourceFactory.createScriptAsset("zooRooNotMain", "/zoo/roo/notMain.js")
		};
		game.resourceFactory.scriptContents = {
			"foo/package.json": "{ \"main\": \"root.js\" }"
		};
		pkgJsonAsset._load({
			_onAssetError: e => {
				throw e;
			},
			_onAssetLoad: a => {
				try {
					expect(_findAssetByPathAsDirectory("foo", liveAssetPathTable)).toBe(liveAssetPathTable["foo/root.js"]);
					expect(_findAssetByPathAsDirectory("bar", liveAssetPathTable)).toBe(liveAssetPathTable["bar/index.js"]);
					expect(_findAssetByPathAsDirectory("zoo/roo", liveAssetPathTable)).toBe(undefined);
					expect(_findAssetByPathAsDirectory("tee", liveAssetPathTable)).toBe(undefined);
				} finally {
					done();
				}
			}
		});
	});
});
