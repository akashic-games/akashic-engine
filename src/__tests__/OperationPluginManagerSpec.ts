import { Trigger } from "@akashic/trigger";
import type { GameConfiguration, InternalOperationPluginOperation, Module, OperationPluginViewInfo } from "..";
import { Game } from "./helpers";

// テスト用ダミー操作プラグイン
class TestOperationPlugin {
	operationTrigger: Trigger<any> = new Trigger();
	_game: Game;
	_viewInfo: OperationPluginViewInfo;
	_option: any;
	_started: boolean = false;

	static isSupported(): boolean {
		return true;
	}

	constructor(game: Game, viewInfo: OperationPluginViewInfo, option: any) {
		this._game = game;
		this._viewInfo = viewInfo;
		this._option = option;
	}

	start(): void {
		this._started = true;
	}

	stop(): void {
		this._started = false;
	}

	debugFire(v: any): void {
		this.operationTrigger.fire(v);
	}
}

class TestOperationPluginUnsupported extends TestOperationPlugin {
	static isSupported(): boolean {
		return false;
	}
}

describe("test OperationPluginManager", () => {
	const dummyViewInfo: OperationPluginViewInfo = { dummy: true } as any;
	let game: Game;

	beforeEach(() => {
		const conf: GameConfiguration = {
			width: 320,
			height: 270,
			assets: {
				mainScene: {
					type: "script",
					path: "/dummy/dummy.js",
					virtualPath: "dummy/dummy.js",
					global: true
				}
			},
			operationPlugins: [
				{ code: 42, script: "/script/op-plugin.js" },
				{ code: 10, script: undefined },
				{ code: 15, script: "/script/op-plugin-unsupported.js" },
				{ code: 2, script: "/script/op-plugin.js", manualStart: true }
			],
			main: "./dummy/dummy.js"
		};
		game = new Game(conf, "/", "foo", dummyViewInfo);
		const manager = game._moduleManager;
		const requireOriginal = manager._require;
		manager._require = (path: string, currentModule?: Module) => {
			switch (path) {
				case "/script/op-plugin.js":
					return TestOperationPlugin;
				case "/script/op-plugin-unsupported.js":
					return TestOperationPluginUnsupported;
				default:
					return requireOriginal.call(manager, path, currentModule);
			}
		};
	});

	it("初期化", done => {
		game._onLoad.add(() => {
			expect(game.operationPluginManager).not.toBeFalsy();
			expect(game.operationPluginManager.onOperate instanceof Trigger).toBe(true);
			expect(game.operationPluginManager.plugins).toEqual({});
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("Register gameConfiguration.operationPlugins with _onStart", done => {
		game._onStart.add(() => {
			const self = game.operationPluginManager;
			expect(self.plugins[42]).not.toBeFalsy();
			expect((self.plugins[42] as any)._started).toBe(true);
			expect((self.plugins[42] as any)._game).toBe(game);
			expect((self.plugins[42] as any)._viewInfo).toBe(dummyViewInfo);
			expect(self.plugins[2]).not.toBeFalsy();
			expect((self.plugins[2] as any)._started).toBe(false);
			expect(self.plugins[10]).toBeFalsy();
			expect(self.plugins[15]).toBeFalsy();
			done();
		});
		game._loadAndStart();
	});

	it("operated", done => {
		game._onStart.add(() => {
			const self = game.operationPluginManager;

			const ops: InternalOperationPluginOperation[] = [];
			self.onOperate.add(op => {
				ops.push(op);
			});

			const plugin = self.plugins[42] as TestOperationPlugin;
			plugin.debugFire(["foo", 1]);
			plugin.debugFire([4]);
			expect(ops).toEqual([
				{ _code: 42, data: ["foo", 1] },
				{ _code: 42, data: [4] }
			]);
			plugin.debugFire({ local: true, data: [] });
			expect(ops[2]).toEqual({ _code: 42, local: true, data: [] });
			done();
		});
		game._loadAndStart();
	});

	it("register", done => {
		game._onStart.add(() => {
			const self = game.operationPluginManager;

			expect(self.plugins[30]).toBeUndefined();
			// @ts-ignore
			self.register(TestOperationPlugin, 30, { dummy: true });

			expect(self.plugins[30]).toBeDefined();

			const plugin1 = self.plugins[30] as TestOperationPlugin;
			expect(plugin1._option).toEqual({ dummy: true });
			expect(plugin1._started).toBe(false);
			self.start(30);
			expect(plugin1._started).toBe(true);

			expect(self.plugins[60]).toBeUndefined();
			// @ts-ignore
			self.register(TestOperationPluginUnsupported, 60, { dummy: false });
			expect(self.plugins[60]).toBeUndefined();

			expect(() => {
				// @ts-ignore
				self.register(TestOperationPlugin, 30);
			}).toThrowError("Plugin#code conflicted for code: 30");
			expect(() => {
				// unsupported の場合初期化されない (=例外が発生しない) ことを確認
				// @ts-ignore
				self.register(TestOperationPluginUnsupported, 42);
			}).not.toThrowError("Plugin#code conflicted for code: 42");

			done();
		});
		game._loadAndStart();
	});

	it("destroy", done => {
		game._onStart.add(() => {
			const self = game.operationPluginManager;

			self.destroy();
			expect(self.onOperate).toBeFalsy();
			expect(self.plugins).toBeFalsy();
			done();
		});
		game._loadAndStart();
	});

	it("reset", done => {
		game._onStart.add(() => {
			const self = game.operationPluginManager;
			self.onOperate.add(() => { return });
			expect(self.plugins[30]).toBeUndefined();
			// @ts-ignore
			const plugin = self.register(TestOperationPlugin, 11, { dummy: true });
			expect(self.plugins[11]).toBeDefined();
			if (plugin) plugin.start();
			expect((plugin as any)._started).toBe(true);

			self.reset();
			expect(self.onOperate.length).toBe(0);
			expect(self.plugins).toEqual({});
			expect((plugin as any)._started).toBe(false);
			done();
		});
		game._loadAndStart();
	});
});
