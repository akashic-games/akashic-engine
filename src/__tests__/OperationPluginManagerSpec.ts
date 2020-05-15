import { Trigger } from "@akashic/trigger";
import { GameConfiguration, InternalOperationPluginOperation, Module, OperationPluginViewInfo } from "..";
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
			operationPlugins: [
				{ code: 42, script: "/script/op-plugin.js" },
				{ code: 10, script: undefined },
				{ code: 15, script: "/script/op-plugin-unsupported.js" }
			],
			main: ""
		};
		game = new Game(conf, "/", "foo", dummyViewInfo);
		const manager = game._moduleManager;
		const require_original = manager._require;
		manager._require = (path: string, currentModule?: Module) => {
			switch (path) {
				case "/script/op-plugin.js":
					return TestOperationPlugin;
				case "/script/op-plugin-unsupported.js":
					return TestOperationPluginUnsupported;
				default:
					return require_original.call(manager, path, currentModule);
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

	it("initialize()", done => {
		game._onLoad.add(() => {
			const self = game.operationPluginManager;
			expect((self as any)._initialized).toBe(false);
			self.initialize();
			expect((self as any)._initialized).toBe(true);
			self.initialize(); // 通過パス稼ぎのため二度目の呼び出し
			expect(self.plugins[42]).not.toBeFalsy();
			expect((self.plugins[42] as any)._started).toBe(true);
			expect((self.plugins[42] as any)._game).toBe(game);
			expect((self.plugins[42] as any)._viewInfo).toBe(dummyViewInfo);
			expect(self.plugins[10]).toBeFalsy();
			expect(self.plugins[15]).toBeFalsy();
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("operated", done => {
		game._onLoad.add(() => {
			const self = game.operationPluginManager;
			self.initialize();

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
		game._startLoadingGlobalAssets();
	});

	it("register", done => {
		game._onLoad.add(() => {
			const self = game.operationPluginManager;
			self.initialize();

			expect((self as any)._infos[30]).toBeUndefined();
			self.register(TestOperationPlugin, 30, { dummy: true });

			expect((self as any)._infos[30]).toBeDefined();
			expect((self as any)._infos[30]._plugin).toBeDefined();
			const plugin1 = self.plugins[30] as TestOperationPlugin;
			expect(plugin1._option).toEqual({ dummy: true });
			expect(plugin1._started).toBe(false);
			self.start(30);
			expect(plugin1._started).toBe(true);

			expect((self as any)._infos[60]).toBeUndefined();
			self.register(TestOperationPluginUnsupported, 60, { dummy: false });
			expect((self as any)._infos[60]).toBeDefined();
			expect((self as any)._infos[60]._plugin).toBeUndefined();
			const plugin2 = self.plugins[60] as TestOperationPluginUnsupported;
			expect(plugin2).toBeUndefined();
			self.start(60);
			expect(plugin2).toBeUndefined();

			expect(() => {
				self.register(TestOperationPlugin, 30);
			}).toThrowError("Plugin#code conflicted for code: 30");
			expect(() => {
				// unsupported の場合初期化されない (=例外が発生しない) ことを確認
				self.register(TestOperationPluginUnsupported, 42);
			}).not.toThrowError("Plugin#code conflicted for code: 42");

			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("destroy", done => {
		game._onLoad.add(() => {
			const self = game.operationPluginManager;
			self.initialize();
			self.destroy();
			expect(self.onOperate).toBeFalsy();
			expect(self.plugins).toBeFalsy();
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
