import type { AssetConfigurationCommonBase } from "@akashic/game-configuration";

export type DynamicGeneratedAssetConfiguration =
	| DynamicGeneratedAudioAssetConfigurationBase
	| DynamicGeneratedImageAssetConfigurationBase
	| DynamicGeneratedVectorImageAssetConfigurationBase
	| DynamicGeneratedTextAssetConfigurationBase
	| DynamicGeneratedScriptAssetConfigurationBase
	| DynamicGeneratedVideoAssetConfigurationBase;

/**
 * Asset を動的に生成するための設定を表すインターフェース。
 */
export interface DynamicGeneratedAssetConfigurationBase extends AssetConfigurationCommonBase {
	/**
	 * このアセットのIDとして用いる値。
	 * この値はひとつのAssetManagerの中でユニークでなければならない。
	 */
	id: string;
}

/**
 * ImageAsset を動的生成するための設定。
 */
export interface DynamicGeneratedImageAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "image";
}

/**
 * VectorImageAsset を動的生成するための設定。
 */
export interface DynamicGeneratedVectorImageAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "vector-image";
	data: string;
}

/**
 * VideoAsset を動的生成するための設定。
 */
export interface DynamicGeneratedVideoAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "video";
}

/**
 * AudioAsset を動的生成するための設定。
 */
export interface DynamicGeneratedAudioAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "audio";
}

/**
 * TextAsset を動的生成するための設定。
 */
export interface DynamicGeneratedTextAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "text";
}

/**
 * ScriptAsset を動的生成するための設定。
 */
export interface DynamicGeneratedScriptAssetConfigurationBase extends Omit<DynamicGeneratedAssetConfigurationBase, "type"> {
	type: "script";
}
