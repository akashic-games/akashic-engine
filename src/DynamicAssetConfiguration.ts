import type {
	AssetConfigurationCommonBase,
	AudioAssetConfigurationBase,
	BinaryAssetConfigurationBase,
	ImageAssetConfigurationBase,
	ScriptAssetConfigurationBase,
	TextAssetConfigurationBase,
	VectorImageAssetConfigurationBase,
	VideoAssetConfigurationBase
} from "@akashic/game-configuration";

export type DynamicAssetConfiguration =
	| DynamicAudioAssetConfigurationBase
	| DynamicImageAssetConfigurationBase
	| DynamicVectorImageAssetConfigurationBase
	| DynamicTextAssetConfigurationBase
	| DynamicScriptAssetConfigurationBase
	| DynamicVideoAssetConfigurationBase
	| DynamicBinaryAssetConfigurationBase;

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
export interface DynamicImageAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<ImageAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * VectorImageAssetの設定。
 */
export interface DynamicVectorImageAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<VectorImageAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * VideoAssetの設定。
 */
export interface DynamicVideoAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<VideoAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * AudioAssetの設定。
 */
export interface DynamicAudioAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<AudioAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * TextAssetの設定。
 */
export interface DynamicTextAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<TextAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * ScriptAssetの設定。
 */
export interface DynamicScriptAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<ScriptAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

/**
 * BinaryAssetの設定。
 */
export interface DynamicBinaryAssetConfigurationBase
	extends Omit<DynamicAssetConfigurationBase, "type">,
	Omit<BinaryAssetConfigurationBase, UnneededKeysForDynamicAsset> {}

// interface メンバは多重継承できないため、 DynamicAssetConfigurationBase の type メンバ を Omit する
type UnneededKeysForDynamicAsset = "path" | "virtualPath" | "global";
