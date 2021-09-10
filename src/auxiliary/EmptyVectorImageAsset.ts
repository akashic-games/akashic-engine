import { Asset, AssetLoadHandler, Surface, VectorImageAsset, VectorImageAssetHint } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export class EmptyVectorImageAsset implements VectorImageAsset {
	id: string;
	path: string;
	originalPath: string;
	type: "vector-image" = "vector-image";
	width: number = 0;
	height: number = 0;
	hint: VectorImageAssetHint | undefined;

	onDestroyed: Trigger<Asset> = new Trigger();

	constructor(id: string, path: string, width: number, height: number, hint?: VectorImageAssetHint) {
		this.id = id;
		this.path = path;
		this.originalPath = path;
		this.width = width;
		this.height = height;
		this.hint = hint;
	}

	createSurface(_width: number, _height: number, _sx?: number, _sy?: number, _sWidth?: number, _sHeight?: number): Surface | null {
		return null;
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
