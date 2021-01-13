import { AssetConfiguration, AssetConfigurationMap, AudioSystemConfigurationMap, ModuleMainScriptsMap } from "./AssetConfiguration";
import { OperationPluginInfo } from "./OperationPluginInfo";

/**
 * game.jsonによって定義される値。
 */
export interface GameJSON {
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
	 */
	main: string;

	/**
	 * AudioSystemの追加定義。キーにsystem名を書く。不要(デフォルトの "sound" と "music" しか使わない)なら省略してよい。
	 */
	audio?: AudioSystemConfigurationMap;

	/**
	 * アセット宣言。
	 */
	assets: AssetConfigurationMap | AssetConfiguration[];

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
	 */
	globalScripts?: string[];

	/**
	 * require()解決用ののエントリポイントを格納したテーブル。
	 *
	 * require()の第一引数をキーとした値が本テーブルに存在した場合、require()時にその値をパスとしたスクリプトアセットを評価する。
	 */
	moduleMainScripts?: ModuleMainScriptsMap;

	/**
	 * デフォルトローディングシーンについての指定。
	 * 省略時または "default" を指定すると `DefaultLoadingScene` を表示する。
	 * "compact"を指定すると以下のようなローディングシーンを表示する。
	 *   * 背景が透過
	 *   * プログレスバーが画面中央ではなく右下の方に小さく表示される
	 * デフォルトローディングシーンを非表示にしたい場合は "none" を指定する。
	 */
	defaultLoadingScene?: "default" | "compact" | "none";
}

/**
 * ゲームの設定を表すインターフェース。
 */
export interface GameConfiguration extends GameJSON {
	fps: number;
	assets: AssetConfigurationMap;
}
