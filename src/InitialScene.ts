import type { AssetBundleConfiguration } from "@akashic/game-configuration";
import { Trigger } from "@akashic/trigger";
import type { SceneParameterObject } from "./Scene";
import { Scene } from "./Scene";

/**
 * グローバルアセットを読み込むための初期シーン。
 */
export class InitialScene extends Scene {
	/**
	 * ゲームの実行に必要なグローバルアセットがすべて読み込まれた際に発火される Trigger。
	 * `gameConfiguration` に `assetBundle` が指定されている場合は、そのアセットもすべて読み込み完了後に発火される。
	 * 一方、`this.onLoad` は `gameConfiguration` の `assetBundle` 指定を無視して発火する点に注意が必要。
	 */
	onAllAssetsLoad: Trigger<void>;

	constructor(param: SceneParameterObject) {
		super(param);
		this.onAllAssetsLoad = new Trigger();
		this.onLoad.add(this._handleLoad, this);
	}

	override destroy(): void {
		super.destroy();
		if (!this.onAllAssetsLoad.destroyed()) {
			this.onAllAssetsLoad.destroy();
		}
		this.onAllAssetsLoad = undefined!;
	}

	_handleLoad(): void {
		if (this.game._configuration.assetBundle) {
			const assetBundle: AssetBundleConfiguration = this.game._moduleManager._internalRequire(this.game._configuration.assetBundle);
			this.game._assetManager.setAssetBundle(assetBundle);
			const assetIds = Object.keys(assetBundle.assets);
			this.requestAssets(assetIds, this._handleRequestAssets.bind(this));
		} else {
			this.onAllAssetsLoad.fire();
		}
	}

	_handleRequestAssets(): void {
		this.onAllAssetsLoad.fire();
	}
}
