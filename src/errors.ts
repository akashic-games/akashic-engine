/**
 * akashic-engine 独自のエラー型定義。
 */

import type { ErrorLike } from "@akashic/pdi-types";
import type { AssetGenerationConfiguration } from "./AssetGenerationConfiguration";
import type { DynamicAssetConfiguration } from "./DynamicAssetConfiguration";

/**
 * アセット読み込み失敗の詳細。
 */
export interface RequestAssetDetail {
	/**
	 * 読み込み失敗したアセット ID (またはアセット定義) の配列。
	 */
	failureAssetIds: (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[];
}

/**
 * アセット読み込み失敗を表すエラー。
 *
 * このエラーは `Scene` 生成時に指定されたアセットの読み込み失敗では発生しないことに注意。
 * `Scene#requestAssets()` によるシーン中の動的なアセットリクエストの失敗時、そのコールバックにのみ通知される。
 */
export interface RequestAssetLoadError extends ErrorLike {
	name: "RequestAssetLoadError";
	/**
	 * 読み込み失敗したリクエストの詳細。
	 */
	detail: RequestAssetDetail;
}
