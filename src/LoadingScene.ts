import type { Asset } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import { ExceptionFactory } from "./ExceptionFactory";
import type { SceneParameterObject } from "./Scene";
import { Scene } from "./Scene";

export interface LoadingSceneParameterObject extends SceneParameterObject {
	/**
	 * 読み込み完了時に暗黙に呼び出される `LoadingScene#end()` を抑止するか否か。
	 *
	 * この値を真にする場合、ゲーム開発者はローディングシーンを終了するために明示的に `end()` を呼び出す必要がある。
	 * `end()` の呼び出しは `targetReady` のfire後でなければならない点に注意すること。
	 *
	 * @default false
	 */
	explicitEnd?: boolean;
}

/**
 * Assetの読み込み中に表示されるシーン。
 *
 * 本シーンは通常のシーンと異なり、ゲーム内時間(`Game#age`)と独立に実行される。
 * アセットやストレージデータを読み込んでいる間、ゲーム内時間が進んでいない状態でも、
 * `LoadingScene` は画面に変化を与えることができる(`update` がfireされる)。
 *
 * ゲーム開発者は、ローディング中の演出を実装した独自の `LoadingScene` を
 * `Game#loadingScene` に代入することでエンジンに利用させることができる。
 *
 * ゲーム内時間と独立に処理される `LoadingScene` での処理には再現性がない(他プレイヤーと状態が共有されない)。
 * そのため `Game` に対して副作用のある操作を行ってはならない点に注意すること。
 */
export class LoadingScene extends Scene {
	/**
	 * ローディングシーンの読み込み待ち対象シーンが切り替わった場合にfireされるTrigger。
	 * ゲーム開発者は、このTriggerにaddしてローディングシーンの内容を初期化することができる。
	 */
	onTargetReset: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込みが完了した時にfireされるTrigger。
	 * `explicitEnd` に真を渡して生成した場合、ローディングシーンを終了するには
	 * このTriggerのfire後に明示的に `end()` を呼び出す必要がある。
	 */
	onTargetReady: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込み待ち対象シーンがアセットを読み込む度にfireされるTrigger。
	 */
	onTargetAssetLoad: Trigger<Asset>;
	/**
	 * ローディングシーンの読み込み待ち対象シーンが切り替わった場合にfireされるTrigger。
	 * ゲーム開発者は、このTriggerにaddしてローディングシーンの内容を初期化することができる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onTargetReset` を利用すること。
	 */
	targetReset: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込みが完了した時にfireされるTrigger。
	 * `explicitEnd` に真を渡して生成した場合、ローディングシーンを終了するには
	 * このTriggerのfire後に明示的に `end()` を呼び出す必要がある。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onTargetReady` を利用すること。
	 */
	targetReady: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込み待ち対象シーンがアセットを読み込む度にfireされるTrigger。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onTargetAssetLoad` を利用すること。
	 */
	targetAssetLoaded: Trigger<Asset>;

	/**
	 * @private
	 */
	_explicitEnd: boolean;

	/**
	 * @private
	 */
	_targetScene: Scene;

	/**
	 * `LoadingScene` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: LoadingSceneParameterObject) {
		param.local = true; // LoadingScene は強制的にローカルにする
		super(param);
		this.onTargetReset = new Trigger<Scene>();
		this.onTargetReady = new Trigger<Scene>();
		this.onTargetAssetLoad = new Trigger<Asset>();
		this.targetReset = this.onTargetReset;
		this.targetReady = this.onTargetReady;
		this.targetAssetLoaded = this.onTargetAssetLoad;
		this._explicitEnd = !!param.explicitEnd;
		this._targetScene = undefined!;
	}

	destroy(): void {
		this._clearTargetScene();
		super.destroy();
	}

	/**
	 * アセットロード待ち対象シーンを変更する。
	 *
	 * このメソッドは、新たにシーンのロード待ちが必要になった場合にエンジンによって呼び出される。
	 * (派生クラスはこの処理をオーバーライドしてもよいが、その場合その中で
	 * このメソッド自身 (`g.LoadingScene.prototype.reset`) を呼び出す (`call()` する) 必要がある。)
	 *
	 * @param targetScene アセットロード待ちが必要なシーン
	 */
	reset(targetScene: Scene): void {
		this._clearTargetScene();
		this._targetScene = targetScene;
		if (this._loadingState !== "loaded-fired") {
			this.onLoad.addOnce(this._doReset, this);
		} else {
			this._doReset();
		}
	}

	/**
	 * アセットロード待ち対象シーンの残りのロード待ちアセット数を取得する。
	 */
	getTargetWaitingAssetsCount(): number {
		return this._targetScene ? this._targetScene._sceneAssetHolder.waitingAssetsCount : 0;
	}

	/**
	 * ローディングシーンを終了する。
	 *
	 * `Scene#end()` と異なり、このメソッドの呼び出しはこのシーンを破棄しない。(ローディングシーンは再利用される。)
	 * このメソッドが呼び出される時、 `targetReady` がfireされた後でなければならない。
	 */
	end(): void {
		if (!this._targetScene || this._targetScene._loadingState === "initial") {
			const state = this._targetScene ? this._targetScene._loadingState : "(no scene)";
			const msg = "LoadingScene#end(): the target scene is in invalid state: " + state;
			throw ExceptionFactory.createAssertionError(msg);
		}

		this.game._popSceneRaw(true);
		this.game._pushPostTickTask(this._targetScene._fireLoaded, this._targetScene);
		this._clearTargetScene();
	}

	/**
	 * @private
	 */
	_clearTargetScene(): void {
		if (!this._targetScene) return;
		this.onLoad.removeAll({ owner: this, func: this._doReset });
		this._targetScene._onReady.removeAll({ owner: this });
		this._targetScene.onAssetLoad.removeAll({ owner: this });
		this._targetScene = undefined!;
	}

	/**
	 * @private
	 */
	_doReset(): void {
		this.onTargetReset.fire(this._targetScene);
		if (this._targetScene._loadingState === "initial" || this._targetScene._loadingState === "ready") {
			this._targetScene._onReady.add(this._handleReady, this);
			this._targetScene.onAssetLoad.add(this._handleAssetLoad, this);
			this._targetScene._load();
		} else {
			this._handleReady(this._targetScene);
		}
	}

	/**
	 * @private
	 */
	_handleAssetLoad(asset: Asset): void {
		this.onTargetAssetLoad.fire(asset);
	}

	/**
	 * @private
	 */
	_handleReady(scene: Scene): void {
		this.onTargetReady.fire(scene);
		if (!this._explicitEnd) {
			this.end();
		}
	}
}
