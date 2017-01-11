namespace g {
	/**
	 * `Asset` の読み込みまたは読み込み失敗を受け取るハンドラのインターフェース定義。
	 * 通常、このインターフェースをゲーム開発者が利用する必要はない。
	 * `AssetManagerLoadHandler` とは異なる。こちらは `Asset` の読み込み処理を直接実行する場合に用いるハンドラである。
	 */
	export interface AssetLoadHandler {
		/**
		 * 読み込失敗の通知を受ける関数。
		 * @param asset 読み込みに失敗したアセット
		 * @param error 失敗の内容を表すエラー
		 */
		_onAssetError(asset: Asset, error: AssetLoadError): void;

		/**
		 * 読み込み完了の通知を受ける関数。
		 * @param asset 読み込みが完了したアセット
		 */
		_onAssetLoad(asset: Asset): void;
	}
}
