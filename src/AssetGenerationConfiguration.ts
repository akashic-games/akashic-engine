import type { AssetConfigurationCommonBase } from "@akashic/game-configuration";

export type AssetGenerationConfiguration = VectorImageAssetGenerationConfiguration;

/**
 * Asset を動的に生成するための設定を表すインターフェース。
 */
export interface AssetGenerationConfigurationBase extends AssetConfigurationCommonBase {
	/**
	 * このアセットのIDとして用いる値。
	 * この値はひとつのAssetManagerの中でユニークでなければならない。
	 */
	id: string;
}

/**
 * VectorImageAsset を動的生成するための設定。
 */
export interface VectorImageAssetGenerationConfiguration extends Omit<AssetGenerationConfigurationBase, "type"> {
	type: "vector-image";
	data: string;
}
