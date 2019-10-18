import { ExceptionFactory } from "./commons/ExceptionFactory";
import { AssetManager } from "./domain/AssetManager";
import { Camera } from "./domain/Camera";
import { Camera2D } from "./domain/Camera2D";
import { E } from "./domain/entities/E";
import { MessageEvent, OperationEvent, PointDownEvent, PointMoveEvent, PointSource, PointUpEvent } from "./domain/Event";
import { Matrix } from "./domain/Matrix";
import { StorageLoader, StorageLoaderHandler, StorageReadKey, StorageValueStore, StorageValueStoreSerialization } from "./domain/Storage";
import { Timer } from "./domain/Timer";
import { TimerIdentifier, TimerManager } from "./domain/TimerManager";
import { Game } from "./Game";
import { AssetLike } from "./interfaces/AssetLike";
import { AssetLoadFailureInfo } from "./interfaces/AssetLoadFailureInfo";
import { CommonOffset } from "./interfaces/commons";
import { Destroyable } from "./interfaces/Destroyable";
import { DynamicAssetConfiguration } from "./interfaces/DynamicAssetConfiguration";
import { AssetLoadError, StorageLoadError } from "./interfaces/errors";
import { LocalTickMode } from "./interfaces/LocalTickMode";
import { Registrable } from "./interfaces/Registrable";
import { TickGenerationMode } from "./interfaces/TickGenerationMode";
import { Trigger } from "./Trigger";

/**
 * SceneAssetHolder のコンストラクタに指定できるパラメータ。
 * 通常、ゲーム開発者が利用する必要はない。
 */
export interface SceneAssetHolderParameterObject {
	/**
	 * 属するシーン。
	 * このインスタンスが読み込んだアセットは、このシーンの `assets` から参照できる。
	 * またこのシーンの破棄時に破棄される。
	 */
	scene: Scene;

	/**
	 * アセットの読み込みに利用するアセットマネージャ。
	 */
	assetManager: AssetManager;

	/**
	 * 読み込むアセット。
	 */
	assetIds: (string | DynamicAssetConfiguration)[];

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
	 * @private
	 */
	_scene: Scene;

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

	constructor(param: SceneAssetHolderParameterObject) {
		this.waitingAssetsCount = param.assetIds.length;
		this._scene = param.scene;
		this._assetManager = param.assetManager;
		this._assetIds = param.assetIds;
		this._assets = [];
		this._handler = param.handler;
		this._handlerOwner = param.handlerOwner || null;
		this._direct = !!param.direct;
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
		this._scene = undefined;
		this._assetIds = undefined;
		this._handler = undefined;
		this._requested = false;
	}

	destroyed(): boolean {
		return !this._scene;
	}

	callHandler(): void {
		this._handler.call(this._handlerOwner);
	}

	/**
	 * @private
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError, assetManager: AssetManager): void {
		if (this.destroyed() || this._scene.destroyed()) return;
		var failureInfo = {
			asset: asset,
			error: error,
			cancelRetry: false
		};
		this._scene.assetLoadFailed.fire(failureInfo);
		if (error.retriable && !failureInfo.cancelRetry) {
			this._assetManager.retryLoad(asset);
		} else {
			// game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
			if (this._assetManager.configuration[asset.id]) this._scene.game.terminateGame();
		}
		this._scene.assetLoadCompleted.fire(asset);
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: AssetLike): void {
		if (this.destroyed() || this._scene.destroyed()) return;

		this._scene.assets[asset.id] = asset;
		this._scene.assetLoaded.fire(asset);
		this._scene.assetLoadCompleted.fire(asset);
		this._assets.push(asset);

		--this.waitingAssetsCount;
		if (this.waitingAssetsCount < 0)
			throw ExceptionFactory.createAssertionError("SceneAssetHolder#_onAssetLoad: broken waitingAssetsCount");
		if (this.waitingAssetsCount > 0) return;

		if (this._direct) {
			this.callHandler();
		} else {
			this._scene.game._callSceneAssetHolderHandler(this);
		}
	}
}

/**
 * `Scene` のコンストラクタに渡すことができるパラメータ。
 * 説明のない各メンバの詳細は `Scene` の同名メンバの説明を参照すること。
 */
export interface SceneParameterObject {
	/**
	 * このシーンの属するゲーム。
	 */
	game: Game;

	/**
	 * このシーンで用いるアセットIDの配列。
	 * なおアセットIDとは、 game.jsonのassetsオブジェクトに含まれるキー文字列である。
	 * @default undefined
	 */
	assetIds?: (string | DynamicAssetConfiguration)[];

	/**
	 * このシーンで用いるストレージのキーを表す `StorageReadKey` の配列。
	 * @default undefined
	 */
	storageKeys?: StorageReadKey[];

	/**
	 * このシーンのローカルティック消化ポリシー。
	 *
	 * * `LocalTickMode.FullLocal` が与えられた場合、このシーンはローカルシーンと呼ばれる。
	 *   ローカルシーンでは、他プレイヤーと独立な時間進行処理(ローカルティックの消化)が行われる。
	 * * `LocalTickMode.NonLocal` が与えられた場合、このシーンは非ローカルシーンと呼ばれる。
	 *   非ローカルシーンでは、他プレイヤーと共通の時間進行処理((非ローカル)ティックの消化)が行われる(updateがfireされる)。
	 *   ローカルティックを消化することはない。
	 * * `LocalTickMode.InterpolateLocal` が与えられた場合、このシーンはローカルティック補間シーンと呼ばれる。
	 *   ローカルティック補間シーンでは、非ローカルシーン同様にティックを消化するが、
	 *   消化すべき非ローカルティックがない場合にローカルティックが補間され消化される。
	 *
	 * ローカルシーンに属するエンティティは、すべてローカルである(強制的にローカルエンティティとして生成される)。
	 * ローカルシーンは特にアセットロード中のような、他プレイヤーと同期すべきでないシーンのために存在する機能である。
	 *
	 * `LocalTickMode` の代わりに `boolean` を与えることもできる。
	 * 偽は `LocalTickMode.NonLocal` 、 真は `FullLocal` と解釈される。
	 * @default LocalTickMode.NonLocal
	 */
	local?: boolean | LocalTickMode;

	/**
	 * このシーンの識別用の名前。
	 * @default undefined
	 */
	name?: string;

	/**
	 * このシーンで復元するストレージデータ。
	 *
	 * falsyでない場合、 `Scene#serializeStorageValues()` の戻り値でなければならない。
	 * この値を指定した場合、 `storageValues` の値は `serializeStorageValues()` を呼び出したシーン(元シーン)の持っていた値を再現したものになる。
	 * この時、 `storageKeys` の値は元シーンと同じでなければならない。
	 * @default undefined
	 */
	storageValuesSerialization?: StorageValueStoreSerialization;

	/**
	 * 時間経過の契機(ティック)をどのように生成するか。
	 *
	 * 省略された場合、 `TickGenerationMode.ByClock` 。
	 * `Manual` を指定した場合、 `Game#raiseTick()` を呼び出さない限りティックが生成されない(時間経過しない)。
	 * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこの値の影響を受けない。
	 * またこのシーンへの遷移直後、一度だけこの値に関わらずティックが生成される。
	 */
	tickGenerationMode?: TickGenerationMode;
}

/**
 * そのSceneの状態を表す列挙子。
 *
 * - Destroyed: すでに破棄されているシーンで、再利用が不可能になっている状態を表す
 * - Standby: 初期化された状態のシーンで、シーンスタックへ追加されることを待っている状態を表す
 * - Active: シーンスタックの一番上にいるシーンで、ゲームのカレントシーンとして活性化されている状態を表す
 * - Deactive: シーンスタックにいるが一番上ではないシーンで、裏側で非活性状態になっていることを表す
 * - BeforeDestroyed: これから破棄されるシーンで、再利用が不可能になっている状態を表す
 */
export enum SceneState {
	Destroyed,
	Standby,
	Active,
	Deactive,
	BeforeDestroyed
}

export enum SceneLoadState {
	Initial = 0,
	Ready = 1,
	ReadyFired = 2,
	LoadedFired = 3
}

/**
 * シーンを表すクラス。
 */
export class Scene implements Destroyable, Registrable<E>, StorageLoaderHandler {
	/**
	 * このシーンの子エンティティ。
	 *
	 * エンティティは `Scene#append()` によって追加され、 `Scene#remove()` によって削除される。
	 */
	children: E[];

	/**
	 * このシーンで利用できるアセット。
	 *
	 * アセットID をkeyに、対応するアセットのインスタンスを得ることができる。
	 * keyはこのシーンの生成時、コンストラクタの第二引数 `assetIds` に渡された配列に含まれる文字列でなければならない。
	 */
	assets: { [key: string]: AssetLike };

	/**
	 * このシーンの属するゲーム。
	 */
	game: Game;

	/**
	 * このシーンのローカルティック消化ポリシー。
	 *
	 * * `LocalTickMode.NonLocal` が与えられた場合、このシーンは非ローカルシーンと呼ばれる。
	 *   非ローカルシーンでは、他プレイヤーと共通の時間進行処理((非ローカル)ティックの消化)が行われる(updateがfireされる)。
	 * * `LocalTickMode.FullLocal` が与えられた場合、このシーンはローカルシーンと呼ばれる。
	 *   ローカルシーンでは、他プレイヤーと独立な時間進行処理(ローカルティックの消化)が行われる。
	 * * `LocalTickMode.InterpolateLocal` が与えられた場合、このシーンはローカルティック補間シーンと呼ばれる。
	 *   ローカルティック補間シーンは、非ローカルシーン同様にティックを消化するが、
	 *   消化すべき非ローカルティックがない場合にローカルティックが補間され消化される。
	 *
	 * ローカルシーンとローカルティック補間シーンに属するエンティティは、
	 * すべてローカルである(強制的にローカルエンティティとして生成される)。
	 * ローカルシーンは特にアセットロード中のような、他プレイヤーと同期すべきでないシーンのために存在する機能である。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	local: LocalTickMode;

	/**
	 * 時間経過の契機(ティック)をどのように生成するか。
	 * `Manual` の場合、 `Game#raiseTick()` を呼び出さない限りティックが生成されない(時間経過しない)。
	 * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこの値の影響を受けない。
	 * またこのシーンへの遷移直後、一度だけこの値に関わらずティックが生成される。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	tickGenerationMode: TickGenerationMode;

	/**
	 * シーンの識別用の名前。
	 */
	name: string;

	/**
	 * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
	 */
	update: Trigger<void>;

	/**
	 * 読み込み完了イベント。
	 *
	 * このシーンの生成時に(コンストラクタで)指定されたすべてのアセットの読み込みが終了した後、一度だけfireされる。
	 * このシーンのアセットを利用するすべての処理は、このイベントのfire後に実行されなければならない。
	 */
	loaded: Trigger<Scene>;

	/**
	 * アセット読み込み成功イベント。
	 *
	 * このシーンのアセットが一つ読み込まれる度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 */
	assetLoaded: Trigger<AssetLike>;

	/**
	 * アセット読み込み失敗イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 * このイベントをhandleする場合、ハンドラは `AssetLoadFailureInfo#cancelRetry` を真にすることでゲーム続行を断念することができる。
	 */
	assetLoadFailed: Trigger<AssetLoadFailureInfo>;

	/**
	 * アセット読み込み完了イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗または成功する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 */
	assetLoadCompleted: Trigger<AssetLike>;

	/**
	 * シーンの状態。
	 */
	state: SceneState;

	/**
	 * シーンの状態変更イベント。
	 * 状態が初期化直後の `Standby` 状態以外に変化するときfireされる。
	 */
	stateChanged: Trigger<SceneState>;

	/**
	 * 汎用メッセージイベント。
	 */
	message: Trigger<MessageEvent>;

	/**
	 * シーン内でのpoint downイベント。
	 *
	 * このイベントは `E#pointDown` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint downイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	pointDownCapture: Trigger<PointDownEvent>;

	/**
	 * シーン内でのpoint moveイベント。
	 *
	 * このイベントは `E#pointMove` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint moveイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	pointMoveCapture: Trigger<PointMoveEvent>;

	/**
	 * シーン内でのpoint upイベント。
	 *
	 * このイベントは `E#pointUp` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint upイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	pointUpCapture: Trigger<PointUpEvent>;

	/**
	 * シーン内での操作イベント。
	 */
	operation: Trigger<OperationEvent>;

	/**
	 * シーン内で利用可能なストレージの値を保持する `StorageValueStore`。
	 */
	storageValues: StorageValueStore;

	/**
	 * @private
	 */
	_storageLoader: StorageLoader;

	/**
	 * アセットとストレージの読み込みが終わったことを通知するTrigger。
	 * @private
	 */
	_ready: Trigger<Scene>;

	/**
	 * 読み込みが開始されたか否か。
	 * すなわち、 `_load()` が呼び出された後か否か。
	 *
	 * 歴史的経緯により、このフラグの意味は「読み込みが終わった後」でも「loadedがfireされた後」でもない点に注意。
	 * なお前者「(アセットとストレージの)読み込みが終わった後」は `_loadingState === SceneLoadState.Ready` に与えられる。
	 *
	 * シーンの読み込みは概ね次の順で処理が進行する。
	 * * `_loaded` が真になる
	 * * 各種読み込みが完了する
	 * * `_loadingState` が `SceneLoadState.Ready` になる
	 * * `_ready` がfireされる
	 * * `_loadingState` が `SceneLoadState.ReadyFired` になる
	 * * `loaded` がfireされる
	 * * `_loadingState` が `SceneLoadState.LoadedFired` になる
	 * @private
	 */
	_loaded: boolean;

	/**
	 * 先読みが要求されたか否か。
	 * すなわち、 `prefetch()` が呼び出された後か否か。
	 * @private
	 */
	_prefetchRequested: boolean;

	/**
	 * アセットとストレージの読み込みが終わった後か否か。
	 * 「 `loaded` がfireされた後」ではない点に注意。
	 * @private
	 */
	_loadingState: SceneLoadState;

	/**
	 * タイマー。通常は本変数直接ではなく、createTimer/deleteTimer/setInterval/clearInterval等の機構を利用する。
	 * @private
	 */
	_timer: TimerManager;

	/**
	 * シーンのアセットの保持者。
	 * @private
	 */
	_sceneAssetHolder: SceneAssetHolder;

	/**
	 * `Scene#requestAssets()` で動的に要求されたアセットの保持者。
	 * @private
	 */
	_assetHolders: SceneAssetHolder[];

	/**
	 * 各種パラメータを指定して `Scene` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: SceneParameterObject) {
		var game: Game;
		var local: LocalTickMode;
		var tickGenerationMode: TickGenerationMode;
		var assetIds: (string | DynamicAssetConfiguration)[];

		game = param.game;
		assetIds = param.assetIds;
		if (!param.storageKeys) {
			this._storageLoader = undefined;
			this.storageValues = undefined;
		} else {
			this._storageLoader = game.storage._createLoader(param.storageKeys, param.storageValuesSerialization);
			this.storageValues = this._storageLoader._valueStore;
		}

		local =
			param.local === undefined
				? LocalTickMode.NonLocal
				: param.local === false
				? LocalTickMode.NonLocal
				: param.local === true
				? LocalTickMode.FullLocal
				: <LocalTickMode>param.local;
		tickGenerationMode = param.tickGenerationMode !== undefined ? param.tickGenerationMode : TickGenerationMode.ByClock;
		this.name = param.name;

		if (!assetIds) assetIds = [];

		this.game = game;
		this.local = local;
		this.tickGenerationMode = tickGenerationMode;

		this.loaded = new Trigger<Scene>();
		this._ready = new Trigger<Scene>();
		this.assets = {};

		this._loaded = false;
		this._prefetchRequested = false;
		this._loadingState = SceneLoadState.Initial;

		this.update = new Trigger<void>();
		this._timer = new TimerManager(this.update, this.game.fps);

		this.assetLoaded = new Trigger<AssetLike>();
		this.assetLoadFailed = new Trigger<AssetLoadFailureInfo>();
		this.assetLoadCompleted = new Trigger<AssetLike>();

		this.message = new Trigger<MessageEvent>();
		this.pointDownCapture = new Trigger<PointDownEvent>();
		this.pointMoveCapture = new Trigger<PointMoveEvent>();
		this.pointUpCapture = new Trigger<PointUpEvent>();
		this.operation = new Trigger<OperationEvent>();

		this.children = [];
		this.state = SceneState.Standby;
		this.stateChanged = new Trigger<SceneState>();

		this._assetHolders = [];
		this._sceneAssetHolder = new SceneAssetHolder({
			scene: this,
			assetManager: this.game._assetManager,
			assetIds: assetIds,
			handler: this._onSceneAssetsLoad,
			handlerOwner: this,
			direct: true
		});
	}

	/**
	 * このシーンが変更されたことをエンジンに通知する。
	 *
	 * このメソッドは、このシーンに紐づいている `E` の `modified()` を呼び出すことで暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param isBubbling この関数をこのシーンの子の `modified()` から呼び出す場合、真を渡さなくてはならない。省略された場合、偽。
	 */
	modified(isBubbling?: boolean): void {
		this.game.modified = true;
	}

	/**
	 * このシーンを破棄する。
	 *
	 * 破棄処理の開始時に、このシーンの `stateChanged` が引数 `BeforeDestroyed` でfireされる。
	 * 破棄処理の終了時に、このシーンの `stateChanged` が引数 `Destroyed` でfireされる。
	 * このシーンに紐づいている全ての `E` と全てのTimerは破棄される。
	 * `Scene#setInterval()`, `Scene#setTimeout()` に渡された関数は呼び出されなくなる。
	 *
	 * このメソッドは `Scene#end` や `Game#popScene` などによって要求されたシーンの遷移時に暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	destroy(): void {
		this.state = SceneState.BeforeDestroyed;
		this.stateChanged.fire(this.state);

		// TODO: (GAMEDEV-483) Sceneスタックがそれなりの量になると重くなるのでScene#dbが必要かもしれない
		var gameDb = this.game.db;
		for (var p in gameDb) {
			if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this) gameDb[p].destroy();
		}
		var gameDb = this.game._localDb;
		for (var p in gameDb) {
			if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this) gameDb[p].destroy();
		}

		this._timer.destroy();
		this.update.destroy();
		this.message.destroy();
		this.pointDownCapture.destroy();
		this.pointMoveCapture.destroy();
		this.pointUpCapture.destroy();
		this.operation.destroy();
		this.loaded.destroy();
		this.assetLoaded.destroy();
		this.assetLoadFailed.destroy();
		this.assetLoadCompleted.destroy();
		this.assets = {};

		// アセットを参照しているEより先に解放しないよう最後に解放する
		for (var i = 0; i < this._assetHolders.length; ++i) this._assetHolders[i].destroy();
		this._sceneAssetHolder.destroy();

		this._storageLoader = undefined;

		this.game = undefined;

		this.state = SceneState.Destroyed;
		this.stateChanged.fire(this.state);
		this.stateChanged.destroy();
	}

	/**
	 * 破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.game === undefined;
	}

	/**
	 * 一定間隔で定期的に処理を実行するTimerを作成して返す。
	 *
	 * 戻り値は作成されたTimerである。
	 * 通常は `Scene#setInterval` を利用すればよく、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * `Timer` はフレーム経過処理(`Scene#update`)で実現される疑似的なタイマーである。実時間の影響は受けない。
	 * @param interval Timerの実行間隔（ミリ秒）
	 */
	createTimer(interval: number): Timer {
		return this._timer.createTimer(interval);
	}

	/**
	 * Timerを削除する。
	 * @param timer 削除するTimer
	 */
	deleteTimer(timer: Timer): void {
		this._timer.deleteTimer(timer);
	}

	/**
	 * 一定間隔で定期的に実行される処理を作成する。
	 *
	 * `interval` ミリ秒おきに `owner` を `this` として `handler` を呼び出す。
	 * 戻り値は `Scene#clearInterval` の引数に指定して定期実行を解除するために使える値である。
	 * このタイマーはフレーム経過処理(`Scene#update`)で実現される疑似的なタイマーである。実時間の影響は受けない。
	 * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
	 * @param handler 処理
	 * @param interval 実行間隔(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 */
	setInterval(handler: () => void, interval: number, owner?: any): TimerIdentifier;
	/**
	 * 一定間隔で定期的に実行される処理を作成する。
	 * `interval` ミリ秒おきに `owner` を `this` として `handler` を呼び出す。
	 * @param interval 実行間隔(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 * @param handler 処理
	 * @deprecated この引数順は現在非推奨である。関数を先に指定するものを利用すべきである。
	 */
	setInterval(interval: number, owner: any, handler: () => void): TimerIdentifier;
	/**
	 * 一定間隔で定期的に実行される処理を作成する。
	 * `interval` ミリ秒おきに `owner` を `this` として `handler` を呼び出す。
	 * @param interval 実行間隔(ミリ秒)
	 * @param handler 処理
	 * @deprecated この引数順は現在非推奨である。関数を先に指定するものを利用すべきである。
	 */
	setInterval(interval: number, handler: () => void): TimerIdentifier;

	setInterval(handler: (() => void) | number, interval: any, owner?: any): TimerIdentifier {
		const t = this._timer;
		if (typeof handler === "number") {
			this.game.logger.warn(
				"[deprecated] Scene#setInterval(): this arguments ordering is now deprecated. Specify the function first."
			);
			return owner != null
				? t.setInterval(owner /* 2 */, handler /* 0 */, interval /* 1 */)
				: t.setInterval(interval /* 1 */, handler /* 0 */, null);
		}
		return t.setInterval(handler, interval, owner);
	}

	/**
	 * setIntervalで作成した定期処理を解除する。
	 * @param identifier 解除対象
	 */
	clearInterval(identifier: TimerIdentifier): void {
		this._timer.clearInterval(identifier);
	}

	/**
	 * 一定時間後に一度だけ実行される処理を作成する。
	 *
	 * `milliseconds` ミリ秒後(以降)に、一度だけ `owner` を `this` として `handler` を呼び出す。
	 * 戻り値は `Scene#clearTimeout` の引数に指定して処理を削除するために使える値である。
	 *
	 * このタイマーはフレーム経過処理(`Scene#update`)で実現される疑似的なタイマーである。実時間の影響は受けない。
	 * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
	 * (理想的なケースでは、30FPSなら50msのコールバックは66.6ms時点で呼び出される)
	 * 時間経過に対して厳密な処理を行う必要があれば、自力で `Scene#update` 通知を処理すること。
	 *
	 * @param handler 処理
	 * @param milliseconds 時間(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 */
	setTimeout(handler: () => void, milliseconds: number, owner?: any): TimerIdentifier;
	/**
	 * 一定時間後に一度だけ実行される処理を作成する。
	 *
	 * `milliseconds` ミリ秒後(以降)に、一度だけ `owner` を `this` として `handler` を呼び出す。
	 * @param handler 処理
	 * @param milliseconds 時間(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 * @deprecated この引数順は現在非推奨である。関数を先に指定するものを利用すべきである。
	 */
	setTimeout(milliseconds: number, owner: any, handler: () => void): TimerIdentifier;
	/**
	 * 一定時間後に一度だけ実行される処理を作成する。
	 *
	 * `milliseconds` ミリ秒後(以降)に、一度だけ `handler` を呼び出す。
	 * @param handler 処理
	 * @param milliseconds 時間(ミリ秒)
	 * @deprecated この引数順は現在非推奨である。関数を先に指定するものを利用すべきである。
	 */
	setTimeout(milliseconds: number, handler: () => void): TimerIdentifier;

	setTimeout(handler: (() => void) | number, milliseconds: any, owner?: any): TimerIdentifier {
		const t = this._timer;
		if (typeof handler === "number") {
			this.game.logger.warn(
				"[deprecated] Scene#setTimeout(): this arguments ordering is now deprecated. Specify the function first."
			);
			return owner != null
				? t.setTimeout(owner /* 2 */, handler /* 0 */, milliseconds /* 1 */)
				: t.setTimeout(milliseconds /* 1 */, handler /* 0 */, null);
		}
		return t.setTimeout(handler, milliseconds, owner);
	}

	/**
	 * setTimeoutで作成した処理を削除する。
	 * @param identifier 解除対象
	 */
	clearTimeout(identifier: TimerIdentifier): void {
		this._timer.clearTimeout(identifier);
	}

	/**
	 * このシーンが現在のシーンであるかどうかを返す。
	 */
	isCurrentScene(): boolean {
		return this.game.scene() === this;
	}

	/**
	 * 次のシーンへの遷移を要求する。
	 *
	 * このメソッドは、 `toPush` が真ならば `Game#pushScene()` の、でなければ `Game#replaceScene` のエイリアスである。
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
	 * @param next 遷移後のシーン
	 * @param toPush 現在のシーンを残したままにするなら真、削除して遷移するなら偽を指定する。省略された場合偽
	 */
	gotoScene(next: Scene, toPush?: boolean): void {
		if (!this.isCurrentScene()) throw ExceptionFactory.createAssertionError("Scene#gotoScene: this scene is not the current scene");
		if (toPush) {
			this.game.pushScene(next);
		} else {
			this.game.replaceScene(next);
		}
	}

	/**
	 * このシーンの削除と、一つ前のシーンへの遷移を要求する。
	 *
	 * このメソッドは `Game#popScene()` のエイリアスである。
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
	 */
	end(): void {
		if (!this.isCurrentScene()) throw ExceptionFactory.createAssertionError("Scene#end: this scene is not the current scene");

		this.game.popScene();
	}

	/**
	 * このSceneにエンティティを登録する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
	 * @param e 登録するエンティティ
	 */
	register(e: E): void {
		this.game.register(e);
		e.scene = this;
	}

	/**
	 * このSceneからエンティティの登録を削除する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
	 * @param e 登録を削除するエンティティ
	 */
	unregister(e: E): void {
		e.scene = undefined;
		this.game.unregister(e);
	}

	/**
	 * 子エンティティを追加する。
	 *
	 * `this.children` の末尾に `e` を追加する(`e` はそれまでに追加されたすべての子エンティティより手前に表示される)。
	 *
	 * @param e 子エンティティとして追加するエンティティ
	 */
	append(e: E): void {
		this.insertBefore(e, undefined);
	}

	/**
	 * 子エンティティを挿入する。
	 *
	 * `this.children` の`target`の位置に `e` を挿入する。
	 * `target` が`this` の子でない場合、`append(e)`と同じ動作となる。
	 *
	 * @param e 子エンティティとして追加するエンティティ
	 * @param target 挿入位置にある子エンティティ
	 */
	insertBefore(e: E, target: E): void {
		if (e.parent) e.remove();

		e.parent = this;

		var index = -1;
		if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
			this.children.splice(index, 0, e);
		} else {
			this.children.push(e);
		}
		this.modified(true);
	}

	/**
	 * 子エンティティを削除する。
	 * `this` の子から `e` を削除する。 `e` が `this` の子でない場合、何もしない。
	 * @param e 削除する子エンティティ
	 */
	remove(e: E): void {
		var index = this.children.indexOf(e);
		if (index === -1) return;
		this.children[index].parent = undefined;
		this.children.splice(index, 1);
		this.modified(true);
	}

	/**
	 * シーン内でその座標に反応する `PointSource` を返す。
	 * @param point 対象の座標
	 * @param force touchable指定を無視する場合真を指定する。指定されなかった場合偽
	 * @param camera 対象のカメラ。指定されなかった場合undefined
	 */
	findPointSourceByPoint(point: CommonOffset, force?: boolean, camera?: Camera): PointSource {
		var mayConsumeLocalTick = this.local !== LocalTickMode.NonLocal;
		var children = this.children;
		var m: Matrix = undefined;
		if (camera && camera instanceof Camera2D) m = camera.getMatrix();

		for (var i = children.length - 1; i >= 0; --i) {
			var ret = children[i].findPointSourceByPoint(point, m, force, camera);
			if (ret) {
				ret.local = ret.target.local || mayConsumeLocalTick;
				return ret;
			}
		}
		return { target: undefined, point: undefined, local: mayConsumeLocalTick };
	}

	/**
	 * アセットの先読みを要求する。
	 *
	 * `Scene` に必要なアセットは、通常、`Game#pushScene()` などによるシーン遷移にともなって暗黙に読み込みが開始される。
	 * ゲーム開発者はこのメソッドを呼び出すことで、シーン遷移前にアセット読み込みを開始する(先読みする)ことができる。
	 * 先読み開始後、シーン遷移時までに読み込みが完了していない場合、通常の読み込み処理同様にローディングシーンが表示される。
	 *
	 * このメソッドは `StorageLoader` についての先読み処理を行わない点に注意。
	 * ストレージの場合、書き込みが行われる可能性があるため、順序を無視して先読みすることはできない。
	 */
	prefetch(): void {
		if (this._loaded) {
			// _load() 呼び出し後に prefetch() する意味はない(先読みではない)。
			return;
		}
		if (this._prefetchRequested) return;
		this._prefetchRequested = true;
		this._sceneAssetHolder.request();
	}

	/**
	 * シーンが読み込んだストレージの値をシリアライズする。
	 *
	 * `Scene#storageValues` の内容をシリアライズする。
	 */
	serializeStorageValues(): StorageValueStoreSerialization {
		if (!this._storageLoader) return undefined;
		return this._storageLoader._valueStoreSerialization;
	}

	requestAssets(assetIds: (string | DynamicAssetConfiguration)[], handler: () => void): void {
		if (this._loadingState < SceneLoadState.ReadyFired) {
			// このメソッドは読み込み完了前には呼び出せない。これは実装上の制限である。
			// やろうと思えば _load() で読み込む対象として加えることができる。が、その場合 `handler` を呼び出す方法が単純でないので対応を見送る。
			throw ExceptionFactory.createAssertionError("Scene#requestAsset(): can be called after loaded.");
		}

		var holder = new SceneAssetHolder({
			scene: this,
			assetManager: this.game._assetManager,
			assetIds: assetIds,
			handler: handler
		});
		this._assetHolders.push(holder);
		holder.request();
	}

	/**
	 * @private
	 */
	_activate(): void {
		this.state = SceneState.Active;
		this.stateChanged.fire(this.state);
	}

	/**
	 * @private
	 */
	_deactivate(): void {
		this.state = SceneState.Deactive;
		this.stateChanged.fire(this.state);
	}

	/**
	 * @private
	 */
	_needsLoading(): boolean {
		return this._sceneAssetHolder.waitingAssetsCount > 0 || (this._storageLoader && !this._storageLoader._loaded);
	}

	/**
	 * @private
	 */
	_load(): void {
		if (this._loaded) return;
		this._loaded = true;

		var needsWait = this._sceneAssetHolder.request();
		if (this._storageLoader) {
			this._storageLoader._load(this);
			needsWait = true;
		}
		if (!needsWait) this._notifySceneReady();
	}

	/**
	 * @private
	 */
	_onSceneAssetsLoad(): void {
		if (!this._loaded) {
			// prefetch() で開始されたアセット読み込みを完了したが、_load() がまだ呼ばれていない。
			// _notifySceneReady() は _load() 呼び出し後まで遅延する。
			return;
		}
		if (this._storageLoader && !this._storageLoader._loaded) {
			// アセット読み込みを完了したが、ストレージの読み込みが終わっていない。
			// _notifySceneReady() は  _onStorageLoaded() 呼び出し後まで遅延する。
			return;
		}
		this._notifySceneReady();
	}

	/**
	 * @private
	 */
	_onStorageLoadError(error: StorageLoadError): void {
		this.game.terminateGame();
	}

	/**
	 * @private
	 */
	_onStorageLoaded(): void {
		if (this._sceneAssetHolder.waitingAssetsCount === 0) this._notifySceneReady();
	}

	/**
	 * @private
	 */
	_notifySceneReady(): void {
		// 即座に `_ready` をfireすることはしない。tick()のタイミングで行うため、リクエストをgameに投げておく。
		this._loadingState = SceneLoadState.Ready;
		this.game._fireSceneReady(this);
	}

	/**
	 * @private
	 */
	_fireReady(): void {
		this._ready.fire(this);
		this._loadingState = SceneLoadState.ReadyFired;
	}

	/**
	 * @private
	 */
	_fireLoaded(): void {
		this.loaded.fire(this);
		this._loadingState = SceneLoadState.LoadedFired;
	}
}
