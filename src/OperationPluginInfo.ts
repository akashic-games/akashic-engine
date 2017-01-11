namespace g {
	/**
	 * 操作プラグインのインスタンス生成に必要な情報。
	 */
	export interface OperationPluginInfo {
		/**
		 * このプラグインに割り当てるコード番号。
		 * このプラグインが通知する操作から生成された `OperationEvent` が、 `code` にこの値を持つ。
		 */
		code: number;

		/**
		 * プラグインの定義を含むスクリプトファイルのパス。
		 *
		 * プラグインの定義を得るために、この値が require() に渡される。
		 * 相対パスであるとき、その基準は game.json のあるディレクトリである。
		 * また対応するスクリプトアセットは `"global": true` が指定されていなければならない。
		 */
		script: string;

		/**
		 * プラグインを new する際に引き渡すオプション。
		 */
		option?: any;

		/**
		 * このプラグインを手動で `start()` するか否か。
		 *
		 * 真である場合、このプラグインの `start()` は暗黙に呼び出されなくなる。
		 * 指定されなかった場合、偽。
		 */
		manualStart?: boolean;
	}

	/**
	 * エンジン内部で用いる、操作プラグインの管理情報
	 * 本インターフェースをゲーム開発者が利用する必要はない。
	 */
	export interface InternalOperationPluginInfo extends OperationPluginInfo {
		_plugin: OperationPlugin;
	}
}
