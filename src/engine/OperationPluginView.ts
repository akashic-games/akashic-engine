/**
 * 操作プラグインが参照する、抽象化されたview。
 *
 * 各操作プラグインは、この値に加えたevent listenerを元にoperationTriggerをfireしてよい。
 */
export interface OperationPluginView {
	/**
	 * イベントリスナを追加する。
	 *
	 * @param type listenするタイプ。利用可能な文字列は環境に依存する
	 * @param callback イベントリスナ
	 * @param useCapture capturing phaseで発火するか。通常、この引数を指定する必要はない
	 */
	addEventListener(type: string, callback: (event: any) => any, useCapture?: boolean): void;

	/**
	 * イベントリスナを削除する。
	 *
	 * @param type 削除するイベントリスナのタイプ
	 * @param callback 削除するイベントリスナ
	 * @param useCapture capturing phaseで発火するか。通常、この引数を指定する必要はない
	 */
	removeEventListener(type: string, callback: (event: any) => any, useCapture?: boolean): void;
}
