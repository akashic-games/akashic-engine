import { Trigger } from "@akashic/trigger";
import { ExceptionFactory } from "../commons/ExceptionFactory";
import { AssetLike } from "../interfaces/AssetLike";
import { AssetLoadFailureInfo } from "../interfaces/AssetLoadFailureInfo";
import { DynamicAssetConfiguration } from "../types/DynamicAssetConfiguration";
import { AssetLoadError } from "../types/errors";
import { AssetManager } from "./AssetManager";

export interface AsssetLoadHandlerSceneLike {
	assetLoaded: Trigger<AssetLike>;
	assetLoadFailed: Trigger<AssetLoadFailureInfo>;
	assetLoadCompleted: Trigger<AssetLike>;
}

/**
 * SceneAssetHolder のコンストラクタに指定できるパラメータ。
 * 通常、ゲーム開発者が利用する必要はない。
 */
export interface SceneAssetHolderParameterObject {
	/**
	 * アセットの読み込みに利用するアセットマネージャ。
	 */
	assetManager: AssetManager;

	/**
	 * 読み込むアセット。
	 */
	assetIds?: (string | DynamicAssetConfiguration)[];

	/**
	 * 読み込むアセットのパス。
	 */
	assetPaths?: string[];

	/**
	 * 読み込み完了の通知を受けるハンドラ
	 */
	handler: () => void;

	/**
	 * `handler` 呼び出し時、 `this` として使われる値。
	 */
	handlerOwner?: any;

	/**
	 * `handler` を直接呼ぶか。
	 * 真である場合、 `handler` は読み込み完了後に直接呼び出される。
	 * でなければ次の `Game#tick()` 呼び出し時点まで遅延される。
	 * 省略された場合、偽。
	 */
	direct?: boolean;

	/**
	 * `Asset` の読み込みまたは読み込み失敗を受け取る `Scene` のハンドラのインターフェース定義。
	 */
	assetLoadHandler: AsssetLoadHandlerSceneLike;
}

/**
 * シーンのアセットの読み込みと破棄を管理するクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class SceneAssetHolder {
	/**
	 * 読み込みを待つ残りのアセット数。
	 * この値は参照のためにのみ公開される。この値を外部から書き換えてはならない。
	 */
	waitingAssetsCount: number;

	/**
	 * 読み込み完了時に `_direct` が偽の場合にfireされる。
	 */
	loadCompleted: Trigger<SceneAssetHolder>;

	/**
	 * 読み込み失敗時にゲームを終了させる場合にfireされる。
	 */
	loadFailedTerminatedGame: Trigger<void>;

	/**
	 * 読み込み成功時にfireされる。
	 */
	loadSucceed: Trigger<AssetLike>;

	/**
	 * @private
	 */
	_assetManager: AssetManager;

	/**
	 * @private
	 */
	_handler: () => void;

	/**
	 * @private
	 */
	_handlerOwner: any;

	/**
	 * @private
	 */
	_direct: boolean;

	/**
	 * @private
	 */
	_assetIds: (string | DynamicAssetConfiguration)[];

	/**
	 * @private
	 */
	_assets: AssetLike[];

	/**
	 * @private
	 */
	_requested: boolean;

	/**
	 * @private
	 */
	_assetLoadHandler: AsssetLoadHandlerSceneLike;

	constructor(param: SceneAssetHolderParameterObject) {
		const assetManager = param.assetManager;
		const assetIds = param.assetIds ? param.assetIds.concat() : [];
		assetIds.push.apply(assetIds, assetManager.resolvePatternsToAssetIds(param.assetPaths || []));

		this.waitingAssetsCount = assetIds.length;
		this._assetManager = assetManager;
		this._assetIds = assetIds;
		this._assets = [];
		this._handler = param.handler;
		this._handlerOwner = param.handlerOwner || null;
		this._direct = !!param.direct;
		this._requested = false;
		this.loadFailedTerminatedGame = new Trigger<void>();
		this.loadCompleted = new Trigger<SceneAssetHolder>();
		this.loadSucceed = new Trigger<AssetLike>();
		this._assetLoadHandler = param.assetLoadHandler;
	}

	request(): boolean {
		if (this.waitingAssetsCount === 0) return false;
		if (this._requested) return true;
		this._requested = true;
		this._assetManager.requestAssets(this._assetIds, this);
		return true;
	}

	destroy(): void {
		if (this._requested) {
			this._assetManager.unrefAssets(this._assets);
		}
		this.waitingAssetsCount = 0;
		this._assetIds = undefined;
		this._handler = undefined;
		this._requested = false;

		this.loadFailedTerminatedGame.destroy();
		this.loadCompleted.destroy();
		this.loadSucceed.destroy();
	}

	destroyed(): boolean {
		return !this._assetIds;
	}

	callHandler(): void {
		this._handler.call(this._handlerOwner);
	}

	/**
	 * @private
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError): void {
		if (this.destroyed()) return;
		var failureInfo = {
			asset: asset,
			error: error,
			cancelRetry: false
		};
		this._assetLoadHandler.assetLoadFailed.fire(failureInfo);
		if (error.retriable && !failureInfo.cancelRetry) {
			this._assetManager.retryLoad(asset);
		} else {
			// game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
			if (this._assetManager.configuration[asset.id]) this.loadFailedTerminatedGame.fire();
		}
		this._assetLoadHandler.assetLoadCompleted.fire(asset);
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: AssetLike): void {
		if (this.destroyed()) return;
		this.loadSucceed.fire(asset);
		this._assetLoadHandler.assetLoaded.fire(asset);
		this._assetLoadHandler.assetLoadCompleted.fire(asset);
		this._assets.push(asset);

		--this.waitingAssetsCount;
		if (this.waitingAssetsCount < 0)
			throw ExceptionFactory.createAssertionError("SceneAssetHolder#_onAssetLoad: broken waitingAssetsCount");
		if (this.waitingAssetsCount > 0) return;

		if (this._direct) {
			this.callHandler();
		} else {
			this.loadCompleted.fire(this);
		}
	}
}
