import { Asset } from "./Asset";
import { ExceptionFactory } from "./errors";
import { Scene, SceneLoadState, SceneParameterObject } from "./Scene";
import { Trigger } from "./Trigger";

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
	targetReset: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込みが完了した時にfireされるTrigger。
	 * `explicitEnd` に真を渡して生成した場合、ローディングシーンを終了するには
	 * このTriggerのfire後に明示的に `end()` を呼び出す必要がある。
	 */
	targetReady: Trigger<Scene>;
	/**
	 * ローディングシーンの読み込み待ち対象シーンがアセットを読み込む度にfireされるTrigger。
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
		this.targetReset = new Trigger<Scene>();
		this.targetReady = new Trigger<Scene>();
		this.targetAssetLoaded = new Trigger<Asset>();
		this._explicitEnd = !!param.explicitEnd;
		this._targetScene = undefined;
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
		if (this._loadingState < SceneLoadState.LoadedFired) {
			this.loaded.addOnce(this._doReset, this);
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
		if (!this._targetScene || this._targetScene._loadingState < SceneLoadState.Ready) {
			var state = this._targetScene ? SceneLoadState[this._targetScene._loadingState] : "(no scene)";
			var msg = "LoadingScene#end(): the target scene is in invalid state: " + state;
			throw ExceptionFactory.createAssertionError(msg);
		}

		this.game.popScene(true);
		this.game._fireSceneLoaded(this._targetScene);
		this._clearTargetScene();
	}

	/**
	 * @private
	 */
	_clearTargetScene(): void {
		if (!this._targetScene) return;
		this._targetScene._ready.removeAll({ owner: this });
		this._targetScene.assetLoaded.removeAll({ owner: this });
		this._targetScene = undefined;
	}

	/**
	 * @private
	 */
	_doReset(): void {
		this.targetReset.fire(this._targetScene);
		if (this._targetScene._loadingState < SceneLoadState.ReadyFired) {
			this._targetScene._ready.add(this._fireTriggerOnTargetReady, this);
			this._targetScene.assetLoaded.add(this._fireTriggerOnTargetAssetLoad, this);
			this._targetScene._load();
		} else {
			this._fireTriggerOnTargetReady(this._targetScene);
		}
	}

	/**
	 * @private
	 */
	_fireTriggerOnTargetAssetLoad(asset: Asset): void {
		this.targetAssetLoaded.fire(asset);
	}

	/**
	 * @private
	 */
	_fireTriggerOnTargetReady(scene: Scene): void {
		this.targetReady.fire(scene);
		if (!this._explicitEnd) {
			this.end();
		}
	}
}
