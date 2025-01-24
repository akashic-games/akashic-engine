import type { Asset, AssetLoadHandler, ScriptAsset, ScriptAssetRuntimeValue } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export interface BundledScriptAssetParameterObject {
	id: string;
	type: string;
	path: string;
	execute: (execEnv: ScriptAssetRuntimeValue) => any;
}

export class BundledScriptAsset implements ScriptAsset {
	type: "script";
	script: string;
	exports?: string[] | undefined;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: Trigger<Asset>;
	execute: (execEnv: ScriptAssetRuntimeValue) => any;

	constructor(param: BundledScriptAssetParameterObject) {
		this.type = "script";
		this.id = param.id;
		this.script = "";
		this.path = param.path;
		this.originalPath = param.path;
		this.onDestroyed = new Trigger();
		this.execute = param.execute.bind(this);
	}

	inUse(): boolean {
		return true;
	}

	destroy(): void {
		if (!this.onDestroyed.destroyed()) {
			this.onDestroyed.destroy();
		}
		this.execute = undefined!;
	}

	destroyed(): boolean {
		return !this.execute;
	}

	_load(loader: AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}

	_assetPathFilter(path: string): string {
		return path;
	}
}
