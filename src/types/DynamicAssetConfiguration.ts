import { AudioAssetHint } from "../pdi-types/AudioAssetHint";
import { ImageAssetHint } from "../pdi-types/ImageAssetHint";
import { AssetConfigurationCommonBase } from "./AssetConfiguration";

export type DynamicAssetConfiguration =
	| DynamicAudioAssetConfigurationBase
	| DynamicImageAssetConfigurationBase
	| DynamicTextAssetConfigurationBase
	| DynamicScriptAssetConfigurationBase
	| DynamicVideoAssetConfigurationBase;

/**
 * (実行時に定義される)Assetの設定を表すインターフェース。
 * game.jsonに記述される値の型ではない点に注意。
 */
export interface DynamicAssetConfigurationBase extends AssetConfigurationCommonBase {
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
 * ImageAssetの設定。
 */
export interface DynamicImageAssetConfigurationBase extends DynamicAssetConfigurationBase {
	/**
	 * Assetの種類。
	 */
	type: "image";

	/**
	 * 幅。
	 */
	width: number;

	/**
	 * 高さ。
	 */
	height: number;

	/**
	 * ヒント。akashic-engineが最適なパフォーマンスを発揮するための情報。
	 */
	hint?: ImageAssetHint;
}

/**
 * VideoAssetの設定。
 */
export interface DynamicVideoAssetConfigurationBase extends DynamicAssetConfigurationBase {
	/**
	 * Assetの種類。
	 */
	type: "video";

	/**
	 * 幅。
	 */
	width: number;

	/**
	 * 高さ。
	 */
	height: number;

	/**
	 * ループ。
	 */
	loop?: boolean;

	/**
	 * width,heightではなく実サイズを用いる指定。
	 */
	useRealSize?: boolean;
}

/**
 * AudioAssetの設定。
 */
export interface DynamicAudioAssetConfigurationBase extends DynamicAssetConfigurationBase {
	/**
	 * Assetの種類。
	 */
	type: "audio";

	/**
	 * AudioAssetのsystem指定。
	 */
	systemId: "music" | "sound";

	/**
	 * 再生時間。
	 */
	duration: number;

	/**
	 * ループ。
	 */
	loop?: boolean;

	/**
	 * ヒント。akashic-engineが最適なパフォーマンスを発揮するための情報。
	 */
	hint?: AudioAssetHint;
}

/**
 * TextAssetの設定。
 */
export interface DynamicTextAssetConfigurationBase extends DynamicAssetConfigurationBase {
	/**
	 * Assetの種類。
	 */
	type: "text";
}

/**
 * ScriptAssetの設定。
 */
export interface DynamicScriptAssetConfigurationBase extends DynamicAssetConfigurationBase {
	/**
	 * Assetの種類。
	 */
	type: "script";
}
