namespace g {
	/**
	 * Assetの設定の共通部分。
	 */
	export interface AssetConfigurationBase {
		/**
		 * Assetの種類。"image", "audio", "script", "text" のいずれか。
		 */
		type: string;

		/**
		 * 幅。 `type` が `"image"`, `"video"` の場合にのみ存在。
		 */
		width?: number;

		/**
		 * 高さ。 `type` が `"image"`, `"video"` の場合にのみ存在。
		 */
		height?: number;

		/**
		 * AudioAssetのsystem指定。 `type` が `"audio"` の場合にのみ存在。
		 */
		systemId?: string;

		/**
		 * 再生時間。 `type` が `"audio"` の場合にのみ存在。
		 */
		duration?: number;

		/**
		 * ループ。 `type` が `"video"` の場合にのみ存在。
		 */
		loop?: boolean;

		/**
		 * width,heightではなく実サイズを用いる指定。 `type` が `"video"` の場合にのみ存在。
		 */
		useRealSize?: boolean;
	}

	/**
	 * Assetの設定を表すインターフェース。
	 * game.json の "assets" の各プロパティに記述される値の型。
	 */
	export interface AssetConfiguration extends AssetConfigurationBase {
		/**
		 * Assetを表すファイルへの相対パス。
		 */
		path: string;

		/**
		 * グローバルアセットか否か。省略された場合、偽。
		 * この値が真であるアセットは、ゲームコンテンツから常に `Game#assets` 経由で参照できる。`Scene` のコンストラクタで利用を宣言する必要がない。
		 */
		global?: boolean;
	}

	/**
	 * (実行時に定義される)Assetの設定を表すインターフェース。
	 * game.jsonに記述される値の型ではない点に注意。
	 */
	export interface DynamicAssetConfiguration extends AssetConfigurationBase {
		/**
		 * このアセットのIDとして用いる値。
		 * この値はひとつのAssetManagerの中でユニークでなければならない。
		 */
		id: string;

		/**
		 * Assetを表すファイルのURI。
		 */
		uri: string;
	}

	/**
	 * アセット宣言
	 */
	export type AssetConfigurationMap = {[key: string]: AssetConfiguration};

	/**
	 * AudioSystemの設定を表すインターフェース。
	 */
	export interface AudioSystemConfiguration {
		music?: boolean;
	}

	/**
	 * ゲームの設定を表すインターフェース。
	 * game.jsonによって定義される。
	 */
	export interface GameConfiguration {
		/**
		 * ゲーム画面の幅。
		 */
		width: number;

		/**
		 * ゲーム画面の高さ。
		 */
		height: number;

		/**
		 * ゲームのFPS。省略時は30。
		 */
		fps?: number;

		/**
		 * エントリポイント。require() できるパス。
		 *
		 * 省略された場合、アセット mainScene (典型的には script/mainScene.js)と
		 * スナップショットローダ snapshotLoader (典型的には script/snapshotLoader.js; 必要なら)を使う従来の挙動が採用される。
		 * 省略可能だが、省略は非推奨である。
		 */
		main?: string;

		/**
		 * AudioSystemの追加定義。キーにsystem名を書く。不要(デフォルトの "sound" と "music" しか使わない)なら省略してよい。
		 */
		audio?: {[key: string]: AudioSystemConfiguration};

		/**
		 * アセット宣言。ユニットテスト記述の都合上省略を許すが、通常非undefinedでしか使わない。
		 */
		assets?: AssetConfigurationMap;

		/**
		 * 操作プラグインの情報。
		 */
		operationPlugins?: OperationPluginInfo[];

		/**
		 * スクリプトアセットの簡略記述用テーブル。
		 *
		 * グローバルアセットである *.js ファイル、*.json ファイルに限り、この配列にファイル名(コンテンツルートディレクトリから相対パス)を書くことができる。
		 * ここにファイル名を書いた場合、 `assets` でのアセット定義は不要であり、拡張子 js であれば `ScriptAsset` として、
		 * 拡張子 json であれば `TextAsset` として扱われる。また常に "global": true として扱われる。
		 * ここに記述されたファイルのアセットIDは不定である。ゲーム開発者がこのファイルを読み込むためには、相対パスによる (`require()` を用いねばならない)
		 * 
		 * エンジンユーザはあらかじめ　`globalScripts` を相当する `assets` に変換しておく必要がある。
		 */
		globalScripts?: string[];
	}
}
