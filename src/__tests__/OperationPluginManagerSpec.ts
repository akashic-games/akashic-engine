import {
	GameConfiguration,
	InternalOperationPluginOperation,
	Module,
	OperationPluginViewInfo,
	Trigger
} from "..";
import * as mod from "../domain/Module";
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

const require_original = mod._require;

jest.spyOn(mod, "_require").mockImplementation((game: Game, path: string, currentModule?: Module) => {
	switch (path) {
		case "/script/op-plugin.js":
			return TestOperationPlugin;
		case "/script/op-plugin-unsupported.js":
			return TestOperationPluginUnsupported;
		default:
			return require_original.call(null, game, path, currentModule);
	}
});

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
	});

	afterEach(() => {
		// テスト内で require() をトラップするため上書きするので、ここで書き戻す
		global.g._require = require_original;
	});

	it("初期化", done => {
		game._loaded.add(() => {
			expect(game._operationPluginManager).not.toBeFalsy();
			expect(game._operationPluginManager.operated instanceof Trigger).toBe(true);
			expect(game._operationPluginManager.plugins).toEqual({});
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("initialize()", done => {
		game._loaded.add(() => {
			const self = game._operationPluginManager;
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
		game._loaded.add(() => {
			const self = game._operationPluginManager;
			self.initialize();

			const ops: InternalOperationPluginOperation[] = [];
			self.operated.add(op => {
				ops.push(op);
			});

			const plugin = self.plugins[42] as any;
			plugin.debugFire(["foo", 1]);
			plugin.debugFire([4]);
			expect(ops).toEqual([{ _code: 42, data: ["foo", 1] }, { _code: 42, data: [4] }]);
			plugin.debugFire({ local: true, data: [] });
			expect(ops[2]).toEqual({ _code: 42, local: true, data: [] });
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("destroy", done => {
		game._loaded.add(() => {
			const self = game._operationPluginManager;
			self.initialize();
			self.destroy();
			expect(self.operated).toBeFalsy();
			expect(self.plugins).toBeFalsy();
			done();
		});
		game._startLoadingGlobalAssets();
	});
});
