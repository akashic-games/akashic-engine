import type { Asset, AssetLoadHandler, TextAsset } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export interface BundledTextAssetParameterObject {
	id: string;
	type: string;
	path: string;
	data: string;
}

export class BundledTextAsset implements TextAsset {
	type: "text";
	data: string;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: Trigger<Asset>;

	constructor(param: BundledTextAssetParameterObject) {
		this.type = "text";
		this.id = param.id;
		this.data = param.data;
		this.path = param.path;
		this.originalPath = param.path;
		this.onDestroyed = new Trigger();
	}

	inUse(): boolean {
		return true;
	}

	destroy(): void {
		if (!this.onDestroyed.destroyed()) {
			this.onDestroyed.destroy();
			this.onDestroyed = undefined!;
		}
		this.data = undefined!;
	}

	destroyed(): boolean {
		return !this.onDestroyed;
	}

	_load(loader: AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	_assetPathFilter(path: string): string {
		return path;
	}
}
