import { OperationPluginView } from "./OperationPluginView";

/**
 * 操作プラグインが参照する、抽象化されたviewの情報。
 */
export interface OperationPluginViewInfo {
	/**
	 * 抽象化されたview。
	 */
	view: OperationPluginView;

	/**
	 * このviewのタイプ。
	 * `null` または `undefined` の場合、`view` はDOMのHTMLElementと互換であると期待してよい。
	 */
	type?: string;
}
