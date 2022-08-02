import type { AssetConfigurationCommonBase } from "@akashic/game-configuration";

export type AssetGeneration = VectorImageAssetGeneration;

/**
 * Asset を動的に生成するための設定を表すインターフェース。
 */
export interface AssetGenerationBase extends AssetConfigurationCommonBase {
	/**
	 * このアセットのIDとして用いる値。
	 * この値はひとつのAssetManagerの中でユニークでなければならない。
	 */
	id: string;
}

/**
 * VectorImageAsset を動的生成するための設定。
 */
export interface VectorImageAssetGeneration extends Omit<AssetGenerationBase, "type"> {
	type: "vector-image";
	data: string;
}
