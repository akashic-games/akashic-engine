import type { Trigger } from "@akashic/trigger";
import type { OperationPluginOperation } from "./OperationPluginOperation";

/**
 * 操作プラグインの実装すべきインターフェース。
 * Static methodについては `OperationPluginStatic` を参照。
 */
export interface OperationPlugin {
	/**
	 * このプラグインが生成した操作を通知する `Trigger` 。
	 */
	operationTrigger: Trigger<OperationPluginOperation | (number | string)[]>;

	/**
	 * このプラグインを開始する。
	 * このメソッドの呼び出し以降、 `this.operationTrigger` がfireされる可能性がある。
	 */
	start(): void;

	/**
	 * このプラグインを停止する。
	 * このメソッドの呼び出し以降、 `this.operationTrigger` がfireされることはない。
	 */
	stop(): void;

	/**
	 * `operationTrigger` で通知した操作のデコードを行う。
	 *
	 * 通常、`operationTrigger` で通知した操作の情報は、 `g.OperationEvent#data` に保持されてゲームスクリプトに渡される。
	 * このメソッドが存在する場合、 通知した操作をこのメソッドに渡して呼び出したその戻り値が `g.OperationEvent#data` に与えられるようになる。
	 */
	decode?(op: (number | string)[]): any;
}
