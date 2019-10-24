import { AssetLike } from "../interfaces/AssetLike";
import { AssetLoadError } from "../interfaces/errors";
import { AssetManager } from "./AssetManager";

/**
 * `AssetManager` から `Asset` の読み込みまたは読み込み失敗を受け取るハンドラのインターフェース定義。
 * `AssetLoadHandler` とは異なる。こちらは `AssetManager` を経由してのアセットの読み込み処理を行う場合のハンドラである。
 */
export interface AssetManagerLoadHandler {
	/**
	 * 読み込失敗の通知を受ける関数。
	 * @param asset 読み込みに失敗したアセット
	 * @param error 失敗の内容を表すエラー
	 * @param manager アセットの読み込みを試みた`AssetManager`. この値の `retryLoad()` を呼び出すことで読み込みを再試行できる
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError, manager: AssetManager): void;

	/**
	 * 読み込み完了の通知を受ける関数。
	 * @param asset 読み込みが完了したアセット
	 */
	_onAssetLoad(asset: AssetLike): void;
}
