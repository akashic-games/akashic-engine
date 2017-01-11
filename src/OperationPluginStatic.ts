namespace g {
	/**
	 * Operation Pluginの実装すべきstatic methodについての定義。
	 */
	export interface OperationPluginStatic {
		/**
		 * OperationPluginを生成する。
		 * @param game このプラグインに紐づく `Game`
		 * @param viewInfo このプラグインが参照すべきviewの情報。環境によっては `null` でありうる。
		 * @param option game.jsonに指定されたこのプラグイン向けのオプション
		 */
		new (game: Game, viewInfo: OperationPluginViewInfo, option?: any): OperationPlugin;

		/**
		 * 実行環境がこのpluginをサポートしているか返す。
		 */
		isSupported: () => boolean;
	}
}
