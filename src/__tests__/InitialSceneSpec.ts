import type { GameConfiguration } from "..";
import { Game } from "./helpers";

describe("test InitialScene", () => {
	const configuration: GameConfiguration = {
		width: 320,
		height: 320,
		main: "./main.js",
		assetBundle: "./asset.bundle.js",
		assets: {
			main: {
				type: "script",
				path: "./main.js",
				virtualPath: "main.js",
				global: true
			},
			"asset.bundle": {
				type: "script",
				path: "./asset.bundle.js",
				virtualPath: "asset.bundle.js",
				global: true
			}
		}
	};
	const assetBundle = `{
		assets: {
			"/script/module.js": {
				type: "script",
				path: "script/module.js",
				execute: (runtimeValue) => {
					const { module } = runtimeValue;
					const exports = module.exports;

					exports.multiply = (a, b) => {
						return a * b;
					}

					return module.exports;
				}
			}
		},
	}`;

	it("should load from asset.bundle.js instead of the defined asset", done => {
		const game = new Game(configuration);
		game.resourceFactory.scriptContents["./main.js"] = "module.exports = () => g.game.__entry_point__();";
		game.resourceFactory.scriptContents["./asset.bundle.js"] = `module.exports = ${assetBundle}`;
		(game as any).__entry_point__ = () => {
			const assetBundle = game._moduleManager._internalRequire(configuration.assetBundle!);
			expect(assetBundle.assets["/script/module.js"]).toBeDefined();
			expect(assetBundle.assets["/script/module.js"].type).toBe("script");
			expect(assetBundle.assets["/script/module.js"].path).toBe("script/module.js");
			expect(assetBundle.assets["/script/module.js"].execute).toBeInstanceOf(Function);

			const module = game._moduleManager._internalRequire("./script/module.js");
			expect(module.multiply).toBeInstanceOf(Function);
			expect(module.multiply(2, 10)).toBe(20);
			done();
		};
		game._loadAndStart();
	});
});
