import type { Asset, AssetLoadError } from "@akashic/pdi-types";
import type { AssetGenerationConfiguration } from "./AssetGenerationConfiguration";
import type { AssetLoadFailureInfo } from "./AssetLoadFailureInfo";
import type { AssetManager } from "./AssetManager";
import type { DynamicAssetConfiguration } from "./DynamicAssetConfiguration";
import { ExceptionFactory } from "./ExceptionFactory";

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
	handleLoad: (asset: Asset) => void;

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
	assetIds?: (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[];

	/**
	 * 読み込むアセット。
	 */
	assetPaths?: string[];

	/**
	 * このインスタンスの状態を通知するハンドラ群。
	 */
	handlerSet: AssetHolderHandlerSet<UserData>;

	/**
	 * このインスタンスに紐づけるユーザ定義データ。
	 */
	userData: UserData | null;

	/**
	 * エラーが発生したか否かに関わらず常に `handlerSet.handleFinish` を実行するか。
	 */
	alwaysNotifyFinish?: boolean;
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
	_assetIds: (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[];

	/**
	 * @private
	 */
	_assets: Asset[];

	/**
	 * @private
	 */
	_requested: boolean;

	/**
	 * @private
	 */
	_alwaysNotifyFinish: boolean;

	/**
	 * @private
	 */
	_failureAssetIds: (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[];

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
		this._alwaysNotifyFinish = !!param.alwaysNotifyFinish;
		this._failureAssetIds = [];
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
		this.userData = undefined!;
		this._handlerSet = undefined!;
		this._assetIds = undefined!;
		this._failureAssetIds = undefined!;
		this._requested = false;
	}

	destroyed(): boolean {
		return !this._handlerSet;
	}

	/**
	 * @private
	 */
	_onAssetError(asset: Asset, error: AssetLoadError): void {
		const hs = this._handlerSet;
		if (this.destroyed() || hs.owner.destroyed()) return;
		const failureInfo = {
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
			} else if (this._alwaysNotifyFinish) {
				const assetConf = this._peekAssetConfFromAssetId(asset.id);
				this._failureAssetIds.push(assetConf);
				this._decrementWaitingAssetCount();
			}
		}
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: Asset): void {
		const hs = this._handlerSet;
		if (this.destroyed() || hs.owner.destroyed()) return;

		hs.handleLoad.call(hs.owner, asset);
		this._assets.push(asset);

		this._decrementWaitingAssetCount();
	}

	/**
	 * @private
	 */
	_decrementWaitingAssetCount(): void {
		--this.waitingAssetsCount;
		if (this.waitingAssetsCount > 0) return;
		if (this.waitingAssetsCount < 0) throw ExceptionFactory.createAssertionError("AssetHolder#_onAssetLoad: broken waitingAssetsCount");

		const hs = this._handlerSet;
		hs.handleFinish.call(hs.owner, this, true);
	}

	/**
	 * @private
	 */
	_getFailureAssetIds(): (string | DynamicAssetConfiguration | AssetGenerationConfiguration)[] {
		return this._failureAssetIds;
	}

	/**
	 * @private
	 */
	_peekAssetConfFromAssetId(id: string): string | DynamicAssetConfiguration | AssetGenerationConfiguration {
		for (const assetConf of this._assetIds) {
			const assetId = typeof assetConf === "string" ? assetConf : assetConf.id;
			if (id === assetId) {
				return assetConf;
			}
		}
		throw ExceptionFactory.createAssertionError(`AssetHolder#_peekAssetConfFromAssetId: could not peek the asset: ${id}`);
	}
}
