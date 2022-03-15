import type { OperationPluginInfo } from "@akashic/game-configuration";
import type { OperationPlugin } from "./OperationPlugin";

/**
 * エンジン内部で用いる、操作プラグインの管理情報
 * 本インターフェースをゲーム開発者が利用する必要はない。
 */
export interface InternalOperationPluginInfo extends OperationPluginInfo {
	/**
	 * サポートされていない環境など、操作プラグインを初期化できなかった場合 `undefined` 。
	 * @private
	 */
	_plugin?: OperationPlugin;
}
