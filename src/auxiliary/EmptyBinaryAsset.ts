import type { Asset, AssetLoadHandler, BinaryAsset } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export class EmptyBinaryAsset implements BinaryAsset {
	id: string;
	path: string;
	originalPath: string;
	type: "binary" = "binary";
	data: ArrayBuffer;

	onDestroyed: Trigger<Asset> = new Trigger();

	constructor(id: string, path: string) {
		this.id = id;
		this.path = path;
		this.originalPath = path;
		this.data = new ArrayBuffer(0);
	}

	inUse(): boolean {
		return false;
	}

	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		this.onDestroyed.destroy();
		this.onDestroyed = undefined!;
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
