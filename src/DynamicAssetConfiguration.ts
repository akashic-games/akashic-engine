import type { AssetConfigurationCommonBase, AudioAssetConfigurationBase, ImageAssetConfigurationBase, ScriptAssetConfigurationBase, TextAssetConfigurationBase, VideoAssetConfigurationBase } from "@akashic/game-configuration";

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

type OmitProperties = "type" | "path" | "virtualPath"| "global";

/**
 * ImageAssetの設定。
 */
 export interface DynamicImageAssetConfigurationBase extends DynamicAssetConfigurationBase, Omit<ImageAssetConfigurationBase, OmitProperties> {
	 type: "image";
 }
 
/**
 * VideoAssetの設定。
 */
export interface DynamicVideoAssetConfigurationBase extends DynamicAssetConfigurationBase, Omit<VideoAssetConfigurationBase, OmitProperties> {
	type: "video";
}

/**
 * AudioAssetの設定。
 */
export interface DynamicAudioAssetConfigurationBase extends DynamicAssetConfigurationBase, Omit<AudioAssetConfigurationBase, OmitProperties> {
	type: "audio";
}

/**
 * TextAssetの設定。
 */
export interface DynamicTextAssetConfigurationBase extends DynamicAssetConfigurationBase, Omit<TextAssetConfigurationBase, OmitProperties> {
	type: "text";
}

/**
 * ScriptAssetの設定。
 */
export interface DynamicScriptAssetConfigurationBase extends DynamicAssetConfigurationBase, Omit<ScriptAssetConfigurationBase, OmitProperties> {
	type: "script";
}
