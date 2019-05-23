import { InternalOperationPluginOperation, OperationPluginOperation } from "./OperationPluginOperation";
import { OperationPlugin } from "./OperationPlugin";
import { Game } from "./Game";
import { Trigger } from "./Trigger";
import { OperationPluginViewInfo } from "./OperationPluginViewInfo";
import { InternalOperationPluginInfo } from "./OperationPluginInfo";
import { OperationPluginStatic } from "./OperationPluginStatic";
import { _require } from "./Module";

/**
 * 操作プラグインからの通知をハンドルするクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
class OperationHandler {
	private _code: number;
	private _handler: (op: InternalOperationPluginOperation) => void;
	private _handlerOwner: any;

	constructor( code: number, owner: any, handler: (op: InternalOperationPluginOperation) => void) {
		this._code = code;
		this._handler = handler;
		this._handlerOwner = owner;
	}

	onOperation(op: OperationPluginOperation | (number | string)[]): void {
		var iop: InternalOperationPluginOperation;
		if (op instanceof Array) {
			iop = { _code: this._code, data: <(number | string)[]>op };
		} else {
			iop = <InternalOperationPluginOperation>op;
			iop._code = this._code;
		}
		this._handler.call(this._handlerOwner, iop);
	}
}

/**
 * 操作プラグインを管理するクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class OperationPluginManager {
	/**
	 * 操作プラグインの操作を通知する `Trigger` 。
	 */
	operated: Trigger<InternalOperationPluginOperation>;

	/**
	 * ロードしている操作プラグインを保持するオブジェクト。
	 */
	plugins: { [key: number]: OperationPlugin };

	private _game: Game;
	private _viewInfo: OperationPluginViewInfo;
	private _infos: InternalOperationPluginInfo[];
	private _initialized: boolean;

	constructor(game: Game, viewInfo: OperationPluginViewInfo, infos: InternalOperationPluginInfo[]) {
		this.operated = new Trigger<InternalOperationPluginOperation>();
		this.plugins = {};
		this._game = game;
		this._viewInfo = viewInfo;
		this._infos = infos;
		this._initialized = false;
	}

	/**
	 * 初期化する。
	 * このメソッドの呼び出しは、`this.game._loaded` のfire後でなければならない。
	 */
	initialize(): void {
		if (!this._initialized) {
			this._initialized = true;
			this._loadOperationPlugins();
		}
		this._doAutoStart();
	}

	destroy(): void {
		this.stopAll();
		this.operated.destroy();
		this.operated = undefined;
		this.plugins = undefined;
		this._game = undefined;
		this._viewInfo = undefined;
		this._infos = undefined;
	}

	stopAll(): void {
		if (!this._initialized)
			return;
		for (var i = 0; i < this._infos.length; ++i) {
			var info = this._infos[i];
			if (info._plugin)
				info._plugin.stop();
		}
	}

	private _doAutoStart(): void {
		for (var i = 0; i < this._infos.length; ++i) {
			var info = this._infos[i];
			if (!info.manualStart && info._plugin)
				info._plugin.start();
		}
	}

	private _loadOperationPlugins(): void {
		for (var i = 0; i < this._infos.length; ++i) {
			var info = this._infos[i];
			if (!info.script)
				continue;
			var pluginClass = <OperationPluginStatic>_require(this._game, info.script);
			if (!pluginClass.isSupported())
				continue;
			var plugin = new pluginClass(this._game, this._viewInfo, info.option);
			var code = info.code;
			if (this.plugins[code]) {
				throw new Error("Plugin#code conflicted for code: " + code);
			}
			this.plugins[code] = plugin;
			info._plugin = plugin;
			var handler = new OperationHandler(code, this.operated, this.operated.fire);
			plugin.operationTrigger.handle(handler, handler.onOperation);
		}
	}
}

