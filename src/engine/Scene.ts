import { ExceptionFactory } from "@akashic/pdi-common-impl";
import { Trigger } from "@akashic/trigger";
import { AssetLike } from "../pdi-types/AssetLike";
import { AssetLoadFailureInfo } from "../pdi-types/AssetLoadFailureInfo";
import { CommonOffset } from "../pdi-types/commons";
import { StorageLoadError } from "../pdi-types/errors";
import { AssetAccessor } from "./AssetAccessor";
import { AssetHolder } from "./AssetHolder";
import { Camera } from "./Camera";
import { Camera2D } from "./Camera2D";
import { DynamicAssetConfiguration } from "./DynamicAssetConfiguration";
import { E, PointDownEvent, PointMoveEvent, PointSource, PointUpEvent } from "./entities/E";
import { MessageEvent, OperationEvent } from "./Event";
import { Game } from "./Game";
import { getGameInAssetContext } from "./getGameInAssetContext";
import { LocalTickModeString } from "./LocalTickModeString";
import { StorageLoader, StorageLoaderHandler, StorageReadKey, StorageValueStore, StorageValueStoreSerialization } from "./Storage";
import { TickGenerationModeString } from "./TickGenerationModeString";
import { Timer } from "./Timer";
import { TimerIdentifier, TimerManager } from "./TimerManager";

export type SceneRequestAssetHandler = () => void;

/**
 * `Scene` のコンストラクタに渡すことができるパラメータ。
 * 説明のない各メンバの詳細は `Scene` の同名メンバの説明を参照すること。
 */
export interface SceneParameterObject {
	/**
	 * このシーンの属するゲーム。
	 * ゲーム開発者が指定する必要はない。
	 * @default g.game
	 */
	game?: Game;

	/**
	 * このシーンで用いるアセットIDの配列。
	 *
	 * アセットIDとは、 game.jsonのassetsオブジェクトの各プロパティのキー文字列である。
	 * アセットIDでなくパスで指定したい場合は `assetPaths` を利用できる。両方指定してもよい。
	 *
	 * @default undefined
	 */
	assetIds?: (string | DynamicAssetConfiguration)[];

	/**
	 * このシーンで用いるアセットのファイルパスの配列。
	 *
	 * 各要素は `/` から始まる絶対パスでなければならない。
	 * ここでルートディレクトリ `/` はgame.json のあるディレクトリを指す。
	 * ただしオーディオアセットに限り、拡張子を含まないパスであること。
	 * (e.g. `/image/character01.png`, `/audio/bgm01`)
	 *
	 * パスでなくアセットIDで指定したい場合は `assetIds` を利用できる。両方指定してもよい。
	 * game.jsonのassetsに定義がないアセット(ダイナミックアセット)は指定できない。
	 *
	 * @default undefined
	 */
	assetPaths?: string[];

	/**
	 * このシーンで用いるストレージのキーを表す `StorageReadKey` の配列。
	 * @default undefined
	 */
	storageKeys?: StorageReadKey[];

	/**
	 * このシーンのローカルティック消化ポリシー。
	 *
	 * * `"full-local"` が与えられた場合、このシーンはローカルシーンと呼ばれる。
	 *   ローカルシーンでは、他プレイヤーと独立な時間進行処理(ローカルティックの消化)が行われる。
	 * * `"non-local"` が与えられた場合、このシーンは非ローカルシーンと呼ばれる。
	 *   非ローカルシーンでは、他プレイヤーと共通の時間進行処理((非ローカル)ティックの消化)が行われる(onUpdateがfireされる)。
	 *   ローカルティックを消化することはない。
	 * * `"interpolate-local"` が与えられた場合、このシーンはローカルティック補間シーンと呼ばれる。
	 *   ローカルティック補間シーンでは、非ローカルシーン同様にティックを消化するが、
	 *   消化すべき非ローカルティックがない場合にローカルティックが補間され消化される。
	 *
	 * ローカルシーンに属するエンティティは、すべてローカルである(強制的にローカルエンティティとして生成される)。
	 * ローカルシーンは特にアセットロード中のような、他プレイヤーと同期すべきでないシーンのために存在する機能である。
	 *
	 * `LocalTickModeString` の代わりに `boolean` を与えることもできる。
	 * 偽は `"non-local"` 、 真は `"full-local"` と解釈される。
	 * @default "non-local"
	 */
	local?: boolean | LocalTickModeString;

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
	 * 省略された場合、 `"by-clock"` 。
	 * `Manual` を指定した場合、 `Game#raiseTick()` を呼び出さない限りティックが生成されない(時間経過しない)。
	 * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこの値の影響を受けない。
	 * またこのシーンへの遷移直後、一度だけこの値に関わらずティックが生成される。
	 */
	tickGenerationMode?: TickGenerationModeString;
}

/**
 * そのSceneの状態を表す列挙子。
 *
 * - "destroyed": すでに破棄されているシーンで、再利用が不可能になっている状態を表す
 * - "standby": 初期化された状態のシーンで、シーンスタックへ追加されることを待っている状態を表す
 * - "active": シーンスタックの一番上にいるシーンで、ゲームのカレントシーンとして活性化されている状態を表す
 * - "deactive": シーンスタックにいるが一番上ではないシーンで、裏側で非活性状態になっていることを表す
 * - "before-destroyed": これから破棄されるシーンで、再利用が不可能になっている状態を表す
 */
export type SceneStateString = "destroyed" | "standby" | "active" | "deactive" | "before-destroyed";

export type SceneLoadStateString = "initial" | "ready" | "ready-fired" | "loaded-fired";

/**
 * シーンを表すクラス。
 */
export class Scene implements StorageLoaderHandler {
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
	 * このシーンで利用できるアセットへのアクセッサ。
	 *
	 * 歴史的経緯による `assets` との違いに注意。
	 * `assets` は「このシーンの生成時に読み込んだアセット」に「アセットIDをキーにして」アクセスするテーブルである。
	 * 他方この `asset` は `getImageById()`, `getAllTexts()` などのメソッドを持つオブジェクトである。
	 * アセットIDだけでなくパスでのアクセスや、複数アセットの一括取得ができる点で異なる。
	 */
	asset: AssetAccessor;

	/**
	 * このシーンの属するゲーム。
	 */
	game: Game;

	/**
	 * このシーンのローカルティック消化ポリシー。
	 *
	 * * `"non-local"` が与えられた場合、このシーンは非ローカルシーンと呼ばれる。
	 *   非ローカルシーンでは、他プレイヤーと共通の時間進行処理((非ローカル)ティックの消化)が行われる(onUpdateがfireされる)。
	 * * `"full-local"` が与えられた場合、このシーンはローカルシーンと呼ばれる。
	 *   ローカルシーンでは、他プレイヤーと独立な時間進行処理(ローカルティックの消化)が行われる。
	 * * `"interpolate-local"` が与えられた場合、このシーンはローカルティック補間シーンと呼ばれる。
	 *   ローカルティック補間シーンは、非ローカルシーン同様にティックを消化するが、
	 *   消化すべき非ローカルティックがない場合にローカルティックが補間され消化される。
	 *
	 * ローカルシーンとローカルティック補間シーンに属するエンティティは、
	 * すべてローカルである(強制的にローカルエンティティとして生成される)。
	 * ローカルシーンは特にアセットロード中のような、他プレイヤーと同期すべきでないシーンのために存在する機能である。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	local: LocalTickModeString;

	/**
	 * 時間経過の契機(ティック)をどのように生成するか。
	 * `"manual"` の場合、 `Game#raiseTick()` を呼び出さない限りティックが生成されない(時間経過しない)。
	 * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこの値の影響を受けない。
	 * またこのシーンへの遷移直後、一度だけこの値に関わらずティックが生成される。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	tickGenerationMode: TickGenerationModeString;

	/**
	 * シーンの識別用の名前。
	 */
	name: string | undefined;

	/**
	 * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
	 */
	onUpdate: Trigger<void>;

	/**
	 * 読み込み完了イベント。
	 *
	 * このシーンの生成時に(コンストラクタで)指定されたすべてのアセットの読み込みが終了した後、一度だけfireされる。
	 * このシーンのアセットを利用するすべての処理は、このイベントのfire後に実行されなければならない。
	 */
	onLoad: Trigger<Scene>;

	/**
	 * アセット読み込み成功イベント。
	 *
	 * このシーンのアセットが一つ読み込まれる度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 */
	onAssetLoad: Trigger<AssetLike>;

	/**
	 * アセット読み込み失敗イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 * このイベントをhandleする場合、ハンドラは `AssetLoadFailureInfo#cancelRetry` を真にすることでゲーム続行を断念することができる。
	 */
	onAssetLoadFailure: Trigger<AssetLoadFailureInfo>;

	/**
	 * アセット読み込み完了イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗または成功する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 */
	onAssetLoadComplete: Trigger<AssetLike>;

	/**
	 * シーンの状態。
	 */
	state: SceneStateString;

	/**
	 * シーンの状態変更イベント。
	 * 状態が初期化直後の `"standby"` 状態以外に変化するときfireされる。
	 */
	onStateChange: Trigger<SceneStateString>;

	/**
	 * 汎用メッセージイベント。
	 */
	onMessage: Trigger<MessageEvent>;

	/**
	 * シーン内でのpoint downイベント。
	 *
	 * このイベントは `E#onPointDown` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint downイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	onPointDownCapture: Trigger<PointDownEvent>;

	/**
	 * シーン内でのpoint moveイベント。
	 *
	 * このイベントは `E#onPointMove` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint moveイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	onPointMoveCapture: Trigger<PointMoveEvent>;

	/**
	 * シーン内でのpoint upイベント。
	 *
	 * このイベントは `E#onPointUp` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint upイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 */
	onPointUpCapture: Trigger<PointUpEvent>;

	/**
	 * シーン内での操作イベント。
	 */
	onOperation: Trigger<OperationEvent>;

	/**
	 * シーン内で利用可能なストレージの値を保持する `StorageValueStore`。
	 */
	storageValues: StorageValueStore | undefined;

	/**
	 * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onUpdate` を利用すること。
	 */
	update: Trigger<void>;

	/**
	 * 読み込み完了イベント。
	 *
	 * このシーンの生成時に(コンストラクタで)指定されたすべてのアセットの読み込みが終了した後、一度だけfireされる。
	 * このシーンのアセットを利用するすべての処理は、このイベントのfire後に実行されなければならない。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onLoad` を利用すること。
	 */
	loaded: Trigger<Scene>;

	/**
	 * アセット読み込み成功イベント。
	 *
	 * このシーンのアセットが一つ読み込まれる度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onAssetLoad` を利用すること。
	 */
	assetLoaded: Trigger<AssetLike>;

	/**
	 * アセット読み込み失敗イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 * このイベントをhandleする場合、ハンドラは `AssetLoadFailureInfo#cancelRetry` を真にすることでゲーム続行を断念することができる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onAssetLoadFailure` を利用すること。
	 */
	assetLoadFailed: Trigger<AssetLoadFailureInfo>;

	/**
	 * アセット読み込み完了イベント。
	 *
	 * このシーンのアセットが一つ読み込みに失敗または成功する度にfireされる。
	 * アセット読み込み中の動作をカスタマイズしたい場合に用いる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onAssetLoadComplete` を利用すること。
	 */
	assetLoadCompleted: Trigger<AssetLike>;

	/**
	 * 汎用メッセージイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onMessage` を利用すること。
	 */
	message: Trigger<MessageEvent>;

	/**
	 * シーン内でのpoint downイベント。
	 *
	 * このイベントは `E#onPointDown` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint downイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointDownCapture` を利用すること。
	 */
	pointDownCapture: Trigger<PointDownEvent>;

	/**
	 * シーン内でのpoint moveイベント。
	 *
	 * このイベントは `E#onPointMove` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint moveイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointMoveCapture` を利用すること。
	 */
	pointMoveCapture: Trigger<PointMoveEvent>;

	/**
	 * シーン内でのpoint upイベント。
	 *
	 * このイベントは `E#onPointUp` とは独立にfireされる。
	 * すなわち、シーン内に同じ位置でのpoint upイベントに反応する `E` がある場合もない場合もこのイベントはfireされる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointUpCapture` を利用すること。
	 */
	pointUpCapture: Trigger<PointUpEvent>;

	/**
	 * シーン内での操作イベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onOperation` を利用すること。
	 */
	operation: Trigger<OperationEvent>;

	/**
	 * @private
	 */
	_storageLoader: StorageLoader | undefined;

	/**
	 * アセットとストレージの読み込みが終わったことを通知するTrigger。
	 * @private
	 */
	_onReady: Trigger<Scene>;

	/**
	 * アセットとストレージの読み込みが終わったことを通知するTrigger。
	 * @private
	 * @deprecated 非推奨である。将来的に削除される。代わりに `_onReady` を利用すること。
	 */
	_ready: Trigger<Scene>;

	/**
	 * 読み込みが開始されたか否か。
	 * すなわち、 `_load()` が呼び出された後か否か。
	 *
	 * 歴史的経緯により、このフラグの意味は「読み込みが終わった後」でも「onLoadがfireされた後」でもない点に注意。
	 * なお前者「(アセットとストレージの)読み込みが終わった後」は `_loadingState === "ready"` に与えられる。
	 *
	 * シーンの読み込みは概ね次の順で処理が進行する。
	 * * `_loaded` が真になる
	 * * 各種読み込みが完了する
	 * * `_loadingState` が `"ready"` になる
	 * * `_onReady` がfireされる
	 * * `_loadingState` が `"ready-fired"` になる
	 * * `onLoad` がfireされる
	 * * `_loadingState` が `"loaded-fired"` になる
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
	 * 「 `onLoad` がfireされた後」ではない点に注意。
	 * @private
	 */
	_loadingState: SceneLoadStateString;

	/**
	 * タイマー。通常は本変数直接ではなく、createTimer/deleteTimer/setInterval/clearInterval等の機構を利用する。
	 * @private
	 */
	_timer: TimerManager;

	/**
	 * シーンのアセットの保持者。
	 * @private
	 */
	_sceneAssetHolder: AssetHolder<SceneRequestAssetHandler>;

	/**
	 * `Scene#requestAssets()` で動的に要求されたアセットの保持者。
	 * @private
	 */
	_assetHolders: AssetHolder<SceneRequestAssetHandler>[];

	/**
	 * 各種パラメータを指定して `Scene` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: SceneParameterObject = {}) {
		var game = param.game || getGameInAssetContext();
		var local =
			param.local === undefined
				? "non-local"
				: param.local === false
				? "non-local"
				: param.local === true
				? "full-local"
				: param.local;
		var tickGenerationMode = param.tickGenerationMode !== undefined ? param.tickGenerationMode : "by-clock";

		if (!param.storageKeys) {
			this._storageLoader = undefined;
			this.storageValues = undefined;
		} else {
			this._storageLoader = game.storage._createLoader(param.storageKeys, param.storageValuesSerialization);
			this.storageValues = this._storageLoader._valueStore;
		}

		this.name = param.name;
		this.game = game;
		this.local = local;
		this.tickGenerationMode = tickGenerationMode;

		this.onLoad = new Trigger<Scene>();
		this.loaded = this.onLoad;
		this._onReady = new Trigger<Scene>();
		this._ready = this._onReady;
		this.assets = {};
		this.asset = new AssetAccessor(game._assetManager);

		this._loaded = false;
		this._prefetchRequested = false;
		this._loadingState = "initial";

		this.onUpdate = new Trigger<void>();
		this.update = this.onUpdate;
		this._timer = new TimerManager(this.onUpdate, this.game.fps);

		this.onAssetLoad = new Trigger<AssetLike>();
		this.onAssetLoadFailure = new Trigger<AssetLoadFailureInfo>();
		this.onAssetLoadComplete = new Trigger<AssetLike>();
		this.assetLoaded = this.onAssetLoad;
		this.assetLoadFailed = this.onAssetLoadFailure;
		this.assetLoadCompleted = this.onAssetLoadComplete;

		this.onMessage = new Trigger<MessageEvent>();
		this.onPointDownCapture = new Trigger<PointDownEvent>();
		this.onPointMoveCapture = new Trigger<PointMoveEvent>();
		this.onPointUpCapture = new Trigger<PointUpEvent>();
		this.onOperation = new Trigger<OperationEvent>();
		this.message = this.onMessage;
		this.pointDownCapture = this.onPointDownCapture;
		this.pointMoveCapture = this.onPointMoveCapture;
		this.pointUpCapture = this.onPointUpCapture;
		this.operation = this.onOperation;

		this.children = [];
		this.state = "standby";
		this.onStateChange = new Trigger<SceneStateString>();

		this._assetHolders = [];
		this._sceneAssetHolder = new AssetHolder<SceneRequestAssetHandler>({
			assetManager: this.game._assetManager,
			assetIds: param.assetIds,
			assetPaths: param.assetPaths,
			handlerSet: {
				owner: this,
				handleLoad: this._handleSceneAssetLoad,
				handleLoadFailure: this._handleSceneAssetLoadFailure,
				handleFinish: this._handleSceneAssetLoadFinish
			},
			userData: null
		});
	}

	/**
	 * このシーンが変更されたことをエンジンに通知する。
	 *
	 * このメソッドは、このシーンに紐づいている `E` の `modified()` を呼び出すことで暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param isBubbling この関数をこのシーンの子の `modified()` から呼び出す場合、真を渡さなくてはならない。省略された場合、偽。
	 */
	modified(_isBubbling?: boolean): void {
		this.game.modified();
	}

	/**
	 * このシーンを破棄する。
	 *
	 * 破棄処理の開始時に、このシーンの `onStateChange` が引数 `BeforeDestroyed` でfireされる。
	 * 破棄処理の終了時に、このシーンの `onStateChange` が引数 `Destroyed` でfireされる。
	 * このシーンに紐づいている全ての `E` と全てのTimerは破棄される。
	 * `Scene#setInterval()`, `Scene#setTimeout()` に渡された関数は呼び出されなくなる。
	 *
	 * このメソッドは `Scene#end` や `Game#popScene` などによって要求されたシーンの遷移時に暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	destroy(): void {
		this.state = "before-destroyed";
		this.onStateChange.fire(this.state);

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
		this.onUpdate.destroy();
		this.onMessage.destroy();
		this.onPointDownCapture.destroy();
		this.onPointMoveCapture.destroy();
		this.onPointUpCapture.destroy();
		this.onOperation.destroy();
		this.onLoad.destroy();
		this.onAssetLoad.destroy();
		this.onAssetLoadFailure.destroy();
		this.onAssetLoadComplete.destroy();
		this.assets = {};

		// アセットを参照しているEより先に解放しないよう最後に解放する
		for (var i = 0; i < this._assetHolders.length; ++i) this._assetHolders[i].destroy();
		this._sceneAssetHolder.destroy();

		this._storageLoader = undefined;

		this.game = undefined!;

		this.state = "destroyed";
		this.onStateChange.fire(this.state);
		this.onStateChange.destroy();
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
	 * `Timer` はフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
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
	 * このタイマーはフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
	 * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
	 * @param handler 処理
	 * @param interval 実行間隔(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 */
	setInterval(handler: () => void, interval: number, owner?: any): TimerIdentifier {
		return this._timer.setInterval(handler, interval, owner);
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
	 * このタイマーはフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
	 * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
	 * (理想的なケースでは、30FPSなら50msのコールバックは66.6ms時点で呼び出される)
	 * 時間経過に対して厳密な処理を行う必要があれば、自力で `Scene#onUpdate` 通知を処理すること。
	 *
	 * @param handler 処理
	 * @param milliseconds 時間(ミリ秒)
	 * @param owner handlerの所有者。省略された場合、null
	 */
	setTimeout(handler: () => void, milliseconds: number, owner?: any): TimerIdentifier {
		return this._timer.setTimeout(handler, milliseconds, owner);
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
		// @ts-ignore
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
	insertBefore(e: E, target: E | undefined): void {
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
		const mayConsumeLocalTick = this.local !== "non-local";
		const children = this.children;
		const m = camera && camera instanceof Camera2D ? camera.getMatrix() : undefined;

		for (var i = children.length - 1; i >= 0; --i) {
			const ret = children[i].findPointSourceByPoint(point, m, force);
			if (ret) {
				ret.local = (ret.target && ret.target.local) || mayConsumeLocalTick;
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

	requestAssets(assetIds: (string | DynamicAssetConfiguration)[], handler: SceneRequestAssetHandler): void {
		if (this._loadingState !== "ready-fired" && this._loadingState !== "loaded-fired") {
			// このメソッドは読み込み完了前には呼び出せない。これは実装上の制限である。
			// やろうと思えば _load() で読み込む対象として加えることができる。が、その場合 `handler` を呼び出す方法が単純でないので対応を見送る。
			throw ExceptionFactory.createAssertionError("Scene#requestAsset(): can be called after loaded.");
		}

		var holder = new AssetHolder<SceneRequestAssetHandler>({
			assetManager: this.game._assetManager,
			assetIds: assetIds,
			handlerSet: {
				owner: this,
				handleLoad: this._handleSceneAssetLoad,
				handleLoadFailure: this._handleSceneAssetLoadFailure,
				handleFinish: this._handleSceneAssetLoadFinish
			},
			userData: () => {
				// 不要なクロージャは避けたいが生存チェックのため不可避
				if (!this.destroyed()) handler();
			}
		});
		this._assetHolders.push(holder);
		holder.request();
	}

	/**
	 * @private
	 */
	_activate(): void {
		this.state = "active";
		this.onStateChange.fire(this.state);
	}

	/**
	 * @private
	 */
	_deactivate(): void {
		this.state = "deactive";
		this.onStateChange.fire(this.state);
	}

	/**
	 * @private
	 */
	_needsLoading(): boolean {
		return this._sceneAssetHolder.waitingAssetsCount > 0 || (!!this._storageLoader && !this._storageLoader._loaded);
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
	_handleSceneAssetLoad(asset: AssetLike): void {
		this.assets[asset.id] = asset;
		this.onAssetLoad.fire(asset);
		this.onAssetLoadComplete.fire(asset);
	}

	/**
	 * @private
	 */
	_handleSceneAssetLoadFailure(failureInfo: AssetLoadFailureInfo): void {
		this.onAssetLoadFailure.fire(failureInfo);
		this.onAssetLoadComplete.fire(failureInfo.asset);
	}

	/**
	 * @private
	 */
	_handleSceneAssetLoadFinish(holder: AssetHolder<SceneRequestAssetHandler>, succeed: boolean): void {
		if (!succeed) {
			this.game.terminateGame();
			return;
		}

		// 動的アセット (`requestAssets()` 由来) の場合
		if (holder.userData) {
			this.game._pushPostTickTask(holder.userData, null);
			return;
		}

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
	_onStorageLoadError(_error: StorageLoadError): void {
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
		// 即座に `_onReady` をfireすることはしない。tick()のタイミングで行うため、リクエストをgameに投げておく。
		this._loadingState = "ready";
		this.game._pushPostTickTask(this._fireReady, this);
	}

	/**
	 * @private
	 */
	_fireReady(): void {
		if (this.destroyed()) return;
		this._onReady.fire(this);
		this._loadingState = "ready-fired";
	}

	/**
	 * @private
	 */
	_fireLoaded(): void {
		if (this.destroyed()) return;
		if (this._loadingState === "loaded-fired") return;
		this.onLoad.fire(this);
		this._loadingState = "loaded-fired";
	}
}
