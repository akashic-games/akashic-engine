import { Asset, AssetLoadError } from "./pdiTypes";

/**
 * `AssetManager` から `Asset` の読み込みまたは読み込み失敗を受け取るハンドラのインターフェース定義。
 * `AssetLoadHandler` とは異なる。こちらは `AssetManager` を経由してのアセットの読み込み処理を行う場合のハンドラである。
 */
export interface AssetManagerLoadHandler {
	/**
	 * 読み込失敗の通知を受ける関数。
	 * @param asset 読み込みに失敗したアセット
	 * @param error 失敗の内容を表すエラー
	 * @param retryCallback 読み込みの再試行を行うコールバック関数。`AssetManager#retryLoad()` が設定される。
	 */
	_onAssetError(asset: Asset, error: AssetLoadError, retryCallback: (asset: Asset) => void): void;

	/**
	 * 読み込み完了の通知を受ける関数。
	 * @param asset 読み込みが完了したアセット
	 */
	_onAssetLoad(asset: Asset): void;
}
