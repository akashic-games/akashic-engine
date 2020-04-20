import { Trigger } from "@akashic/trigger";
import { ExceptionFactory } from "./commons/ExceptionFactory";
import { AssetManager } from "./domain/AssetManager";
import { Game } from "./Game";
import { AssetLike } from "./interfaces/AssetLike";
import { AssetLoadFailureInfo } from "./interfaces/AssetLoadFailureInfo";
import { DynamicAssetConfiguration } from "./types/DynamicAssetConfiguration";
import { AssetLoadError } from "./types/errors";

export interface DestroyedCheckable {
	destroyed(): boolean;
}

export interface AssetHolderHandlerSet<UserData> {
	/**
	 * 各ハンドラの呼び出し時に this として利用される値。
	 */
	owner: DestroyedCheckable;

	/**
	 * アセットが一つ読み込まれるたびに呼び出されるハンドラ。
	 * @param asset 読み込まれたアセット
	 */
	handleLoad: (asset: AssetLike) => void;

	/**
	 * アセットが一つ読み込み失敗するごとに呼び出されるハンドラ。
	 * @param failureInfo 読み込み失敗情報
	 */
	handleLoadFailure: (failureInfo: AssetLoadFailureInfo) => void;

	/**
	 * 全アセットの読み込みを終えた時に呼び出されるハンドラ。
	 * @param holder 読み込みを終えた AssetHolder
	 * @param succeed 読み込みに成功した場合 true, リトライ不能のエラーで断念した時 false
	 */
	handleFinish: (holder: AssetHolder<UserData>, succeed: boolean) => void;
}

/**
 * AssetHolder のコンストラクタに指定できるパラメータ。
 * 通常、ゲーム開発者が利用する必要はない。
 */
export interface AssetHolderParameterObject<UserData> {
	/**
	 * アセットの読み込みに利用するアセットマネージャ。
	 */
	assetManager: AssetManager;

	/**
	 * 読み込むアセット。
	 */
	assetIds?: (string | DynamicAssetConfiguration)[];

	/**
	 * 読み込むアセット。
	 */
	assetPaths?: string[];

	/**
	 * このインスタンスの状態を通知するハンドラ群。
	 */
	handlerSet: AssetHolderHandlerSet<UserData>;

	// /**
	//  * `handler` を直接呼ぶか。
	//  * 真である場合、 `handler` は読み込み完了後に直接呼び出される。
	//  * でなければ次の `Game#tick()` 呼び出し時点まで遅延される。
	//  * 省略された場合、偽。
	//  */
	// direct?: boolean;

	/**
	 * このインスタンスに紐づけるユーザ定義データ。
	 */
	userData: UserData | null;
}

/**
 * シーンのアセットの読み込みと破棄を管理するクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class AssetHolder<UserData> {
	/**
	 * 読み込みを待つ残りのアセット数。
	 * この値は参照のためにのみ公開される。この値を外部から書き換えてはならない。
	 */
	waitingAssetsCount: number;

	/**
	 * インスタンス生成時に与えられたユーザ定義データ。
	 * この値は参照のためにのみ公開される。この値を外部から書き換えてはならない。
	 */
	userData: UserData | null;

	/**
	 * @private
	 */
	_handlerSet: AssetHolderHandlerSet<UserData>;

	/**
	 * @private
	 */
	_assetManager: AssetManager;

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

	constructor(param: AssetHolderParameterObject<UserData>) {
		const assetManager = param.assetManager;
		const assetIds = param.assetIds ? param.assetIds.concat() : [];
		assetIds.push.apply(assetIds, assetManager.resolvePatternsToAssetIds(param.assetPaths || []));

		this.waitingAssetsCount = assetIds.length;
		this.userData = param.userData;
		this._assetManager = assetManager;
		this._assetIds = assetIds;
		this._assets = [];
		this._handlerSet = param.handlerSet;
		this._requested = false;
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
		this.userData = undefined;
		this._handlerSet = undefined;
		this._assetIds = undefined;
		this._requested = false;
	}

	destroyed(): boolean {
		return !this._handlerSet;
	}

	/**
	 * @private
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError): void {
		const hs = this._handlerSet;
		if (this.destroyed() || hs.owner.destroyed()) return;
		var failureInfo = {
			asset: asset,
			error: error,
			cancelRetry: false
		};

		hs.handleLoadFailure.call(hs.owner, failureInfo);

		if (error.retriable && !failureInfo.cancelRetry) {
			this._assetManager.retryLoad(asset);
		} else {
			// game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
			if (this._assetManager.configuration[asset.id]) {
				hs.handleFinish.call(hs.owner, this, false);
			}
		}
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: AssetLike): void {
		const hs = this._handlerSet;
		if (this.destroyed() || hs.owner.destroyed()) return;

		hs.handleLoad.call(hs.owner, asset);
		this._assets.push(asset);

		--this.waitingAssetsCount;
		if (this.waitingAssetsCount < 0) throw ExceptionFactory.createAssertionError("AssetHolder#_onAssetLoad: broken waitingAssetsCount");
		if (this.waitingAssetsCount > 0) return;

		hs.handleFinish.call(hs.owner, this, true);
	}
}
