/**
 * akashic-engine 独自のエラー型定義。
 */

import type { ErrorLike } from "@akashic/pdi-types";
import type { AssetGenerationConfiguration } from "./AssetGenerationConfiguration";
import type { DynamicAssetConfiguration } from "./DynamicAssetConfiguration";

export interface RequestAssetDetail {
	failureAssetIds: (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[];
}

export interface RequestAssetLoadError extends ErrorLike {
	name: "RequestAssetLoadError";
	detail: RequestAssetDetail;
}
