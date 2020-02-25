import { Trigger } from "@akashic/trigger";
import * as pl from "@akashic/playlog";
import { ExceptionFactory } from "./commons/ExceptionFactory";
import { SurfaceAtlasSet } from "./commons/SurfaceAtlasSet";
import { AssetManager } from "./domain/AssetManager";
import { AudioSystemManager } from "./domain/AudioSystemManager";
import { Camera } from "./domain/Camera";
import { DefaultLoadingScene } from "./domain/DefaultLoadingScene";
import { E, PointSource } from "./domain/entities/E";
import { Event, EventType, JoinEvent, LeaveEvent, SeedEvent, PlayerInfoEvent } from "./domain/Event";
import { EventConverter } from "./domain/EventConverter";
import { LoadingScene } from "./domain/LoadingScene";
import { ModuleManager } from "./domain/ModuleManager";
import { OperationPluginManager } from "./domain/OperationPluginManager";
import { PointEventResolver } from "./domain/PointEventResolver";
import { RandomGenerator } from "./domain/RandomGenerator";
import { Storage } from "./domain/Storage";
import { XorshiftRandomGenerator } from "./domain/XorshiftRandomGenerator";
import { AssetLike } from "./interfaces/AssetLike";
import { RendererLike } from "./interfaces/RendererLike";
import { ResourceFactoryLike } from "./interfaces/ResourceFactoryLike";
import { ScriptAssetRuntimeValueBase } from "./interfaces/ScriptAssetRuntimeValue";
import { SurfaceAtlasSetLike } from "./interfaces/SurfaceAtlasSetLike";
import { Scene, SceneAssetHolder, SceneLoadState } from "./Scene";
import { CommonOffset, CommonSize } from "./types/commons";
import { EventFilter } from "./types/EventFilter";
import { GameConfiguration } from "./types/GameConfiguration";
import { GameMainParameterObject } from "./types/GameMainParameterObject";
import { OperationPlugin } from "./types/OperationPlugin";
import { InternalOperationPluginInfo } from "./types/OperationPluginInfo";
import { InternalOperationPluginOperation } from "./types/OperationPluginOperation";
import { OperationPluginViewInfo } from "./types/OperationPluginViewInfo";
import { Registrable } from "./types/Registrable";

import * as g from "./index.runtime";

/**
 * シーン遷移要求のタイプ。
 */
const enum SceneChangeType {
	/**
	 * シーンスタックのトップにシーンを追加する。
	 */
	Push,
	/**
	 * シーンスタックから直近のシーンを削除し、シーンを追加する。
	 */
	Replace,
	/**
	 * シーンスタックから直近のシーンを削除する。
	 */
	Pop,

	/**
	 * シーンの_readyをfireする。
	 */
	FireReady,
	/**
	 * シーンのloadedをfireする。
	 */
	FireLoaded,
	/**
	 * SceneAssetHolderのハンドラを呼び出す。
	 */
	CallAssetHolderHandler
}

/**
 * シーン遷移要求。
 */
interface SceneChangeRequest {
	/**
	 * 遷移の種類。
	 */
	type: SceneChangeType;

	/**
	 * 遷移先になるシーン。
	 * `type` が `Push`, `Replace`, `FireReady` または `FireLoaded` の時のみ存在。
	 */
	scene?: Scene;

	/**
	 * 現在のシーンを破棄するか否か。
	 * `type` が `Pop` または `Replace` の時のみ存在。
	 */
	preserveCurrent?: boolean;

	/**
	 * ハンドラを呼び出す `SceneAssetHolder` 。
	 * `type` が `CallAssetHolderHandler` の時のみ存在。
	 */
	assetHolder?: SceneAssetHolder;
}

export interface GameResetParameterObject {
	/**
	 * `Game#age` に設定する値。
	 * 省略された場合、元の値が維持される。
	 */
	age?: number;

	/**
	 * `Game#random` に設定するシード値。
	 * 省略された場合、元の値が維持される。
	 */
	randSeed?: number;
}

/**
 * `Game` のコンストラクタに渡すことができるパラメータ。
 */
export interface GameParameterObject {
	/**
	 * require("@akashic/akashic-engine") により得られる値。
	 */
	engineModule: any;

	/**
	 * この `Game` の設定。典型的には game.json の内容をパースしたものを期待する
	 */
	configuration: GameConfiguration;

	/**
	 * この `Game` が用いる、リソースのファクトリ
	 */
	resourceFactory: ResourceFactoryLike;

	/**
	 * アセットのパスの基準となるディレクトリ。
	 * @default ""
	 */
	assetBase?: string;

	/**
	 * このゲームを実行するユーザのID。
	 * @default undefined
	 */
	selfId?: string;

	/**
	 * このゲームの操作プラグインに与えるviewの情報。
	 * @default undefined
	 */
	operationPluginViewInfo?: OperationPluginViewInfo;
}

/**
 * コンテンツそのものを表すクラス。
 *
 * 本クラスのインスタンスは暗黙に生成され、ゲーム開発者が生成することはない。
 * ゲーム開発者はg.gameによって本クラスのインスタンスを参照できる。
 *
 * 多くの機能を持つが、本クラスをゲーム開発者が利用するのは以下のようなケースである。
 * 1. Sceneの生成時、コンストラクタに引数として渡す
 * 2. Sceneに紐付かないイベント Game#join, Game#leave, Game#playerInfo, Game#seed を処理する
 * 3. 乱数を発生させるため、Game#randomにアクセスしRandomGeneratorを取得する
 * 4. ゲームのメタ情報を確認するため、Game#width, Game#height, Game#fpsにアクセスする
 * 5. グローバルアセットを取得するため、Game#assetsにアクセスする
 * 6. LoadingSceneを変更するため、Game#loadingSceneにゲーム開発者の定義したLoadingSceneを指定する
 * 7. スナップショット機能を作るため、Game#snapshotRequestにアクセスする
 * 8. 現在フォーカスされているCamera情報を得るため、Game#focusingCameraにアクセスする
 * 9. AudioSystemを直接制御するため、Game#audioにアクセスする
 * 10.Sceneのスタック情報を調べるため、Game#scenesにアクセスする
 * 11.操作プラグインを直接制御するため、Game#operationPluginManagerにアクセスする
 */
export abstract class Game implements Registrable<E> {
	/**
	 * このコンテンツに関連付けられるエンティティ。(ローカルなエンティティを除く)
	 */
	db: { [idx: number]: E };
	/**
	 * このコンテンツを描画するためのオブジェクト群。
	 */
	renderers: RendererLike[];
	/**
	 * シーンのスタック。
	 */
	scenes: Scene[];
	/**
	 * このGameで利用可能な乱数生成機群。
	 */
	random: RandomGenerator;
	/**
	 * プレイヤーがゲームに参加したことを表すイベント。
	 */
	join: Trigger<JoinEvent>;
	/**
	 * プレイヤーがゲームから離脱したことを表すイベント。
	 */
	leave: Trigger<LeaveEvent>;
	/**
	 * 新しいプレイヤー情報が発生したことを示すイベント。
	 */
	playerInfo: Trigger<PlayerInfoEvent>;
	/**
	 * 新しい乱数シードが発生したことを示すイベント。
	 */
	seed: Trigger<SeedEvent>;
	/**
	 * このコンテンツの累計経過時間。
	 * 通常は `this.scene().local` が偽である状態で `tick()` の呼ばれた回数だが、シーン切り替え時等 `tick()` が呼ばれた時以外で加算される事もある。
	 */
	age: number;
	/**
	 * フレーム辺りの時間経過間隔。初期値は30である。
	 */
	fps: number;
	/**
	 * ゲーム画面の幅。
	 */
	width: number;
	/**
	 * ゲーム画面の高さ。
	 */
	height: number;

	/**
	 * グローバルアセットのマップ。this._initialScene.assets のエイリアス。
	 */
	assets: { [key: string]: AssetLike };

	/**
	 * グローバルアセットが読み込み済みの場合真。でなければ偽。
	 */
	isLoaded: boolean;

	/**
	 * アセットのロード中に表示するシーン。
	 * ゲーム開発者はこの値を書き換えることでローディングシーンを変更してよい。
	 */
	loadingScene: LoadingScene;

	/**
	 * Assetの読み込みに使うベースパス。
	 * ゲーム開発者が参照する必要はない。
	 * 値はプラットフォーム由来のパス(絶対パス)とゲームごとの基準パス(相対パス)をつないだものになる。
	 */
	assetBase: string;

	/**
	 * このゲームを実行している「自分」のID。
	 *
	 * この値は、 `Game#join` で渡される `Player` のフィールド `id` と等価性を比較できる値である。
	 * すなわちゲーム開発者は、join してきた`Player`の `id` とこの値を比較することで、
	 * このゲームのインスタンスを実行している「自分」が参加者であるか否かを決定することができる。
	 *
	 * この値は必ずしも常に存在するとは限らないことに注意。存在しない場合、 `undefined` である。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	// ゲーム開発者がこのIDに付随する情報(名前など)を、ローカルエンティティでの表示や
	// 干渉などで利用したい場合は、外部システムに問い合わせる必要がある。
	selfId: string;

	/**
	 * 本ゲームで利用可能なオーディオシステム群。musicとsoundが登録されている。
	 */
	audio: AudioSystemManager;

	/**
	 * デフォルトで利用されるオーディオシステムのID。デフォルト値はsound。
	 */
	defaultAudioSystemId: "music" | "sound";

	/**
	 * スナップショット要求通知。
	 * ゲーム開発者はこれをhandleして可能ならスナップショットを作成しGame#saveSnapshotを呼び出すべきである。
	 */
	// NOTE: このクラスはこのTriggerをfireしない。派生クラスがfireせねばならない。
	snapshotRequest: Trigger<void>;

	/**
	 * 外部インターフェース。
	 *
	 * 実行環境によって、環境依存の値が設定される。
	 * ゲーム開発者はこの値を用いる場合、各実行環境のドキュメントを参照すべきである。
	 */
	// このクラス自身は、初期値 `{}` を代入することを除き、この値を参照・設定しない。
	external: any;

	/**
	 * 各種リソースのファクトリ。
	 */
	resourceFactory: ResourceFactoryLike;

	/**
	 * ストレージ。
	 */
	storage: Storage;

	/**
	 * ゲーム開発者向けのコンテナ。
	 *
	 * この値はゲームエンジンのロジックからは使用されず、ゲーム開発者は任意の目的に使用してよい。
	 */
	vars: any;

	/**
	 * このゲームの各プレイを識別する値。
	 *
	 * このゲームに複数のプレイヤーがいる場合、すなわち `Game#join` が複数回fireされている場合、各プレイヤー間でこの値は同一である。
	 * この値は、特に `game.external` で提供される外部APIに与えるなど、Akashic Engine外部とのやりとりで使われることを想定する値である。
	 *
	 * 実行中、この値が変化しないことは保証されない。ゲーム開発者はこの値を保持すべきではない。
	 * また、この値に応じてゲームの処理や内部状態を変化させるべきではない。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	playId: string;

	/**
	 * ロードしている操作プラグインを保持するオブジェクト。
	 */
	operationPlugins: { [key: number]: OperationPlugin };

	/**
	 * 画面サイズの変更時にfireされるTrigger。
	 */
	resized: Trigger<CommonSize>;

	/**
	 * スキップ状態の変化時にfireされるTrigger。
	 *
	 * スキップ状態に遷移する時に真、非スキップ状態に遷移する時に偽が与えられる。
	 * この通知は、ゲーム開発者が「スキップ中の演出省略」などの最適化を行うために提供されている。
	 *
	 * この通知のfire頻度は、ゲームの実行状態などに依存して異なりうることに注意。
	 * 例えば多人数プレイされている時、それぞれの環境でfireされ方が異なりうる。
	 * ゲーム開発者は、この通知に起因する処理で、ゲームのグローバルな実行状態を変化させてはならない。
	 */
	skippingChanged: Trigger<boolean>;

	/**
	 * 直近の `update` の通知が、ローカルティックによるものか否か。
	 *
	 * ただし一度も `update` 通知が起きていない間は真である。
	 * ローカルシーンおよびローカルティック補間シーン以外のシーンにおいては、常に偽。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	isLastTickLocal: boolean;

	/**
	 * 直近の `update` の通知時(の直前)に(タイムスタンプ待ちを省略する動作などの影響でエンジンが)省いたローカルティックの数。
	 *
	 * 一度も `update` 通知が起きていない間は `0` である。
	 * ローカルティック補間シーンでない場合、常に `0` であることに注意。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	lastOmittedLocalTickCount: number;

	/**
	 * ゲーム全体で共有するサーフェスアトラス。
	 */
	surfaceAtlasSet: SurfaceAtlasSetLike;

	/**
	 * 操作プラグインの管理者。
	 */
	operationPluginManager: OperationPluginManager;

	/**
	 * イベントとTriggerのマップ。
	 * @private
	 */
	_eventTriggerMap: { [key: number]: Trigger<Event> };

	/**
	 * グローバルアセットを読み込むための初期シーン。必ずシーンスタックの一番下に存在する。これをpopScene()することはできない。
	 * @private
	 */
	_initialScene: Scene;

	/**
	 * デフォルトローディングシーン。
	 *
	 * `this.loadingScene` が指定されていない時にローディングシーンとして利用される。
	 * また `this.loadingScene` がアセットを利用する場合、その読み込み待ちの間にも利用される。
	 *
	 * ここに代入される `LoadingScene` はアセットを用いてはならない。
	 * 初期値は `new g.DefaultLoadingScene(this)` である。
	 * @private
	 */
	_defaultLoadingScene: LoadingScene;

	/**
	 * `this.scenes` の変化時にfireされるTrigger。
	 * このTriggerはアセットロード(Scene#loadedのfire)を待たず、変化した時点で即fireされることに注意。
	 * @private
	 */
	_sceneChanged: Trigger<Scene>;

	/**
	 * グローバルアセットの読み込み待ちハンドラ。
	 * @private
	 */
	_loaded: Trigger<Game>;

	/**
	 * _start() 呼び出しから戻る直前を通知するTrigger。
	 * エントリポイント実行後のシーン遷移直後にfireされる。
	 * このTriggerのfireは一度とは限らないことに注意。_loadAndStart()呼び出しの度に一度fireされる。
	 * @private
	 */
	_started: Trigger<void>;

	/**
	 * エントリポイント(mainスクリプト)のパス。
	 * @private
	 */
	_main: string;

	/**
	 * _loadAndStart() に渡された、エントリポイント(mainスクリプト)に渡す引数。
	 * @private
	 */
	_mainParameter: GameMainParameterObject;

	/**
	 * アセットの管理者。
	 * @private
	 */
	_assetManager: AssetManager;

	/**
	 * モジュールの管理者。
	 * @private
	 */
	_moduleManager: ModuleManager;

	/**
	 * イベントコンバータ。
	 * @private
	 */
	_eventConverter: EventConverter;

	/**
	 * ポイントイベントの解決モジュール。
	 * @private
	 */
	_pointEventResolver: PointEventResolver;

	/**
	 * 操作プラグインによる操作を通知するTrigger。
	 * @private
	 */
	_operationPluginOperated: Trigger<InternalOperationPluginOperation>;

	/**
	 * `this.db` のlastInsertId。
	 * `this.db` が空の場合、0が代入されており、以後インクリメントして利用される。
	 * @private
	 */
	_idx: number;

	/**
	 * このゲームに紐づくローカルなエンティティ (`E#local` が真のもの)
	 * @private
	 */
	// ローカルエンティティは他のゲームインスタンス(他参加者・視聴者など)とは独立に生成される可能性がある。
	// そのため `db` (`_idx`) 基準で `id` を与えてしまうと `id` の値がずれることがありうる。
	// これを避けるため、 `db` からローカルエンティティ用のDBを独立させたものがこの値である。
	_localDb: { [id: number]: E };
	/**
	 * ローカルエンティティ用の `this._idx` 。
	 * @private
	 */
	_localIdx: number;

	/**
	 * 次に生成されるカメラのID。
	 * 初期値は 0 であり、以後カメラ生成のたびにインクリメントして利用される。
	 * @private
	 */
	_cameraIdx: number;

	/**
	 * `this.terminateGame()` が呼び出された後か否か。
	 * これが真の場合、 `this.tick()` は何も行わない。
	 * @private
	 */
	_isTerminated: boolean;

	/**
	 * 使用中のカメラの実体。
	 *
	 * focusingcameraがこの値を暗黙的に生成するので、通常ゲーム開発者はこの値を直接指定する必要はない。
	 * @private
	 */
	_focusingCamera: Camera;

	/**
	 * このゲームの設定(game.json の内容)。
	 * @private
	 */
	_configuration: GameConfiguration;

	/**
	 * このゲームの `ScriptAssetRuntimeValueBase` 。
	 * @private
	 */
	_runtimeValueBase: ScriptAssetRuntimeValueBase;

	/**
	 * 画面更新が必要か否かのフラグ。
	 * @private
	 */
	_modified: boolean;

	/**
	 * 実行待ちのシーン遷移要求。
	 */
	private _sceneChangeRequests: SceneChangeRequest[];

	/**
	 * 使用中のカメラ。
	 *
	 * `Game#draw()`, `Game#findPointSource()` のデフォルト値として使用される。
	 * この値を変更した場合、変更を描画に反映するためには `Game#modified()` を呼び出す必要がある。
	 */
	// focusingCameraが変更されても古いカメラをtargetCamerasに持つエンティティのEntityStateFlags.Modifiedを取りこぼすことが無いように、変更時にはrenderを呼べるようアクセサを使う
	get focusingCamera(): Camera {
		return this._focusingCamera;
	}
	set focusingCamera(c: Camera) {
		if (c === this._focusingCamera) return;
		if (this._modified) this.render();
		this._focusingCamera = c;
	}

	/**
	 * `Game` のインスタンスを生成する。
	 * @deprecated このコンストラクタは非推奨機能である。代わりに `GameParameterObject` を使うコンストラクタを用いるべきである。
	 *
	 * @param gameConfiguration この `Game` の設定。典型的には game.json の内容をパースしたものを期待する
	 * @param resourceFactory この `Game` が用いる、リソースのファクトリ
	 * @param assetBase アセットのパスの基準となるディレクトリ。省略された場合、空文字列
	 * @param selfId このゲームを実行するユーザのID。省略された場合、`undefined`
	 * @param operationPluginViewInfo このゲームの操作プラグインに与えるviewの情報
	 */
	constructor(
		paramOrConfg: GameConfiguration,
		resourceFactory: ResourceFactoryLike,
		assetBase?: string,
		selfId?: string,
		operationPluginViewInfo?: OperationPluginViewInfo
	);

	/**
	 * `Game` のインスタンスを生成する。
	 *
	 * @param param この `Game` に指定するパラメータ
	 */
	constructor(param: GameParameterObject);

	constructor(
		paramOrConfg: GameParameterObject | GameConfiguration,
		resourceFactory?: ResourceFactoryLike,
		assetBase?: string,
		selfId: string = "",
		operationPluginViewInfo?: OperationPluginViewInfo
	) {
		let gameConfiguration: GameConfiguration;
		let engineModule: any;
		if ("resourceFactory" in paramOrConfg) {
			gameConfiguration = this._normalizeConfiguration(paramOrConfg.configuration);
			assetBase = paramOrConfg.assetBase || "";
			resourceFactory = paramOrConfg.resourceFactory;
			selfId = paramOrConfg.selfId;
			operationPluginViewInfo = paramOrConfg.operationPluginViewInfo;
			engineModule = paramOrConfg.engineModule;
		} else {
			gameConfiguration = this._normalizeConfiguration(paramOrConfg);
			engineModule = g;
			// FIXME: インスタンス生成時に直接 `Game` を代入している
			engineModule.setGame(Game);
			console.warn(
				"[deprecated] Game:This constructor is deprecated." +
					" Refer to the API documentation and use Game(param: GameParameterObject) instead."
			);
		}
		this.fps = gameConfiguration.fps;
		this.width = gameConfiguration.width;
		this.height = gameConfiguration.height;
		this.renderers = [];
		this.scenes = [];
		this.random = null;
		this.age = 0;
		this.assetBase = assetBase;
		this.resourceFactory = resourceFactory;
		this.selfId = selfId;
		this.playId = undefined;
		this.audio = new AudioSystemManager(this.resourceFactory);

		this.defaultAudioSystemId = "sound";
		this.storage = new Storage();
		this.assets = {};
		this.surfaceAtlasSet = undefined;

		this.join = new Trigger<JoinEvent>();
		this.leave = new Trigger<LeaveEvent>();
		this.playerInfo = new Trigger<PlayerInfoEvent>();
		this.seed = new Trigger<SeedEvent>();

		this._eventTriggerMap = {};
		this._eventTriggerMap[EventType.Join] = this.join;
		this._eventTriggerMap[EventType.Leave] = this.leave;
		this._eventTriggerMap[EventType.PlayerInfo] = this.playerInfo;
		this._eventTriggerMap[EventType.Seed] = this.seed;
		this._eventTriggerMap[EventType.Message] = undefined;
		this._eventTriggerMap[EventType.PointDown] = undefined;
		this._eventTriggerMap[EventType.PointMove] = undefined;
		this._eventTriggerMap[EventType.PointUp] = undefined;
		this._eventTriggerMap[EventType.Operation] = undefined;

		this.resized = new Trigger<CommonSize>();
		this.skippingChanged = new Trigger<boolean>();

		this.isLastTickLocal = true;
		this.lastOmittedLocalTickCount = 0;

		this._loaded = new Trigger<Game>();
		this._started = new Trigger<void>();
		this.isLoaded = false;
		this.snapshotRequest = new Trigger<void>();

		this.external = {};

		this._runtimeValueBase = Object.create(engineModule, {
			game: {
				value: this,
				enumerable: true
			}
		});

		this._main = gameConfiguration.main;
		this._mainParameter = undefined;
		this._configuration = gameConfiguration;
		this._assetManager = new AssetManager(this, gameConfiguration.assets, gameConfiguration.audio, gameConfiguration.moduleMainScripts);
		this._moduleManager = new ModuleManager(this._runtimeValueBase, this._assetManager);
		this._eventConverter = new EventConverter({ game: this, playerId: this.selfId });
		this._pointEventResolver = new PointEventResolver({ sourceResolver: this, playerId: this.selfId });

		var operationPluginsField = <InternalOperationPluginInfo[]>(gameConfiguration.operationPlugins || []);
		this.operationPluginManager = new OperationPluginManager(this, operationPluginViewInfo, operationPluginsField);
		this._operationPluginOperated = new Trigger<InternalOperationPluginOperation>();
		this.operationPluginManager.operated.add(this._operationPluginOperated.fire, this._operationPluginOperated);

		this._sceneChanged = new Trigger<Scene>();
		this._sceneChanged.add(this._updateEventTriggers, this);

		this._initialScene = new Scene({
			game: this,
			assetIds: this._assetManager.globalAssetIds(),
			local: true,
			name: "akashic:initial-scene"
		});
		this._initialScene.loaded.add(this._onInitialSceneLoaded, this);

		this._reset({ age: 0 });
	}

	/**
	 * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
	 *
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
	 * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `SceneState.Deactive` でfireされる。
	 * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
	 * @param scene 遷移後のシーン
	 */
	pushScene(scene: Scene): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.Push,
			scene: scene
		});
	}

	/**
	 * 現在のシーンの置き換えを要求する。
	 *
	 * 現在のシーンをシーンスタックから取り除き、指定のシーンを追加することを要求する。
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
	 * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
	 * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
	 * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
	 *
	 * @param scene 遷移後のシーン
	 * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
	 */
	replaceScene(scene: Scene, preserveCurrent?: boolean): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.Replace,
			scene: scene,
			preserveCurrent: preserveCurrent
		});
	}

	/**
	 * シーンスタックから現在のシーンを取り除くことを要求する
	 *
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
	 * 引数 `preserve` が偽の場合、このメソッドの呼び出しにより取り除かれたシーンは全て破棄される。
	 * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
	 * その後一つ前のシーンの `stateChanged` が引数 `SceneState.Active` でfireされる。
	 * また、step数がスタックされているシーンの数以上の場合、例外が投げられる。
	 *
	 * @param preserve 真の場合、シーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
	 * @param step 取り除くシーンの数。省略された場合、1
	 */
	popScene(preserve?: boolean, step: number = 1): void {
		for (let i = 0; i < step; i++) {
			this._sceneChangeRequests.push({ type: SceneChangeType.Pop, preserveCurrent: preserve });
		}
	}

	/**
	 * 現在のシーンを返す。
	 * ない場合、 `undefined` を返す。
	 */
	scene(): Scene {
		if (!this.scenes.length) return undefined;
		return this.scenes[this.scenes.length - 1];
	}

	/**
	 * この `Game` の時間経過とそれに伴う処理を行う。
	 *
	 * 現在の `Scene` に対して `Scene#update` をfireし、 `events` に設定されたイベントを処理する。
	 * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
	 *
	 * 戻り値は呼び出し前後でシーンが変わった(別のシーンに遷移した)場合、真。でなければ偽。
	 * @param advanceAge 偽を与えた場合、`this.age` を進めない。
	 * @param omittedTickCount タイムスタンプ待ちを省略する動作などにより、(前回の呼び出し以降に)省かれたローカルティックの数。省略された場合、 `0` 。
	 * @param events ティックに含ませるイベント。省略された場合、 `undefined` 。
	 */
	tick(advanceAge: boolean, omittedTickCount?: number, events?: pl.Event[]): boolean {
		let scene: Scene;

		if (this._isTerminated) return false;

		this.isLastTickLocal = !advanceAge;
		this.lastOmittedLocalTickCount = omittedTickCount || 0;
		if (this.scenes.length) {
			scene = this.scenes[this.scenes.length - 1];
			if (events && events.length) {
				for (let i = 0; i < events.length; ++i) {
					const event = this._eventConverter.toGameEvent(events[i]);
					const trigger = this._eventTriggerMap[event.type];
					if (trigger) trigger.fire(event);
				}
			}

			scene.update.fire();
			if (advanceAge) ++this.age;
		}

		if (this._sceneChangeRequests.length) {
			this._flushSceneChangeRequests();
			return scene !== this.scenes[this.scenes.length - 1];
		}
		return false;
	}

	/**
	 * このGameを描画する。
	 *
	 * このゲームに紐づけられた `Renderer` (`this.renderers` に含まれるすべての `Renderer` で、この `Game` の描画を行う。
	 * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	render(): void {
		var scene = this.scene();
		if (!scene) return;

		const camera = this.focusingCamera;
		const renderers = this.renderers; // unsafe

		for (let i = 0; i < renderers.length; ++i) {
			const renderer = renderers[i];

			renderer.begin();
			renderer.save();
			renderer.clear();
			if (camera) {
				renderer.save();
				camera._applyTransformToRenderer(renderer);
			}

			var children = scene.children;
			for (let j = 0; j < children.length; ++j) children[j].render(renderer, camera);

			if (camera) {
				renderer.restore();
			}

			renderer.restore();
			renderer.end();
		}
		this._modified = false;
	}

	/**
	 * その座標に反応する `PointSource` を返す。
	 *
	 * 戻り値は、対象が見つかった場合、 `target` に見つかった `E` を持つ `PointSource` である。
	 * 対象が見つからなかった場合、 `undefined` である。
	 *
	 * 戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
	 * - `E#touchable` が真である
	 * - カメラ `camera` から可視である中で最も手前にある
	 *
	 * @param point 対象の座標
	 * @param camera 対象のカメラ。指定しなければ `Game.focusingCamera` が使われる
	 */
	findPointSource(point: CommonOffset, camera?: Camera): PointSource {
		if (!camera) camera = this.focusingCamera;
		return this.scene().findPointSourceByPoint(point, false, camera);
	}

	/**
	 * このGameにエンティティを登録する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
	 * `e.id` が `undefined` である場合、このメソッドの呼び出し後、 `e.id` には `this` に一意の値が設定される。
	 * `e.local` が偽である場合、このメソッドの呼び出し後、 `this.db[e.id] === e` が成立する。
	 * `e.local` が真である場合、 `e.id` の値は不定である。
	 *
	 * @param e 登録するエンティティ
	 */
	register(e: E): void {
		if (e.local) {
			if (e.id === undefined) {
				e.id = --this._localIdx;
			} else {
				// register前にidがある: スナップショットからの復元用パス
				// スナップショットはローカルエンティティを残さないはずだが、実装上はできるようにしておく。
				if (e.id > 0) throw ExceptionFactory.createAssertionError("Game#register: invalid local id: " + e.id);
				if (this._localDb.hasOwnProperty(String(e.id)))
					throw ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
				if (this._localIdx > e.id) this._localIdx = e.id;
			}
			this._localDb[e.id] = e;
		} else {
			if (e.id === undefined) {
				e.id = ++this._idx;
			} else {
				// register前にidがある: スナップショットからの復元用パス
				if (e.id < 0) throw ExceptionFactory.createAssertionError("Game#register: invalid non-local id: " + e.id);
				if (this.db.hasOwnProperty(String(e.id)))
					throw ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
				// _idxがユニークな値を作れるよう更新しておく
				if (this._idx < e.id) this._idx = e.id;
			}
			this.db[e.id] = e;
		}
	}

	/**
	 * このGameからエンティティの登録を削除する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
	 * このメソッドの呼び出し後、 `this.db[e.id]` は未定義である。
	 * @param e 登録を削除するエンティティ
	 */
	unregister(e: E): void {
		if (e.local) {
			delete this._localDb[e.id];
		} else {
			delete this.db[e.id];
		}
	}

	/**
	 * このゲームを離脱する。
	 *
	 * 多人数プレイの場合、他のクライアントでは `Game#leave` イベントがfireされる。
	 * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
	 */
	leaveGame(): void {
		this._leaveGame();
	}

	/**
	 * このゲームを終了する。
	 *
	 * エンジンに対して続行の断念を通知する。
	 * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
	 * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
	 */
	terminateGame(): void {
		this._leaveGame();
		this._isTerminated = true;
		this._terminateGame();
	}

	/**
	 * 画面更新が必要のフラグを設定する。
	 */
	modified(): void {
		this._modified = true;
	}

	/**
	 * イベントを発生させる。
	 *
	 * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに指定のイベントを発生させることができる。
	 *
	 * @param e 発生させるイベント
	 */
	abstract raiseEvent(e: Event): void;

	/**
	 * ティックを発生させる。
	 *
	 * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに時間経過を要求することができる。
	 * 現在のシーンのティック生成モード `Scene#tickGenerationMode` が `TickGenerationMode.Manual` でない場合、エラー。
	 *
	 * @param events そのティックで追加で発生させるイベント
	 */
	abstract raiseTick(events?: Event[]): void;

	/**
	 * イベントフィルタを追加する。
	 *
	 * 一つ以上のイベントフィルタが存在する場合、このゲームで発生したイベントは、通常の処理の代わりにイベントフィルタに渡される。
	 * エンジンは、イベントフィルタが戻り値として返したイベントを、まるでそのイベントが発生したかのように処理する。
	 *
	 * イベントフィルタはローカルイベントに対しても適用される。
	 * イベントフィルタはローカルティック補間シーンやローカルシーンの間であっても適用される。
	 * 複数のイベントフィルタが存在する場合、そのすべてが適用される。適用順は登録の順である。
	 *
	 * @param filter 追加するイベントフィルタ
	 * @param handleEmpty イベントが存在しない場合でも定期的にフィルタを呼び出すか否か。省略された場合、偽。
	 */
	abstract addEventFilter(filter: EventFilter, handleEmpty?: boolean): void;

	/**
	 * イベントフィルタを削除する。
	 *
	 * @param filter 削除するイベントフィルタ
	 */
	abstract removeEventFilter(filter: EventFilter): void;

	/**
	 * このインスタンスにおいてスナップショットの保存を行うべきかを返す。
	 *
	 * スナップショット保存に対応するゲームであっても、
	 * 必ずしもすべてのインスタンスにおいてスナップショット保存を行うべきとは限らない。
	 * たとえば多人数プレイ時には、複数のクライアントで同一のゲームが実行される。
	 * スナップショットを保存するのはそのうちの一つのインスタンスのみでよい。
	 * 本メソッドはそのような場合に、自身がスナップショットを保存すべきかどうかを判定するために用いることができる。
	 *
	 * スナップショット保存に対応するゲームは、このメソッドが真を返す時にのみ `Game#saveSnapshot()` を呼び出すべきである。
	 * 戻り値は、スナップショットの保存を行うべきであれば真、でなければ偽である。
	 */
	abstract shouldSaveSnapshot(): boolean;

	/**
	 * スナップショットを保存する。
	 *
	 * 引数 `snapshot` の値は、スナップショット読み込み関数 (snapshot loader) に引数として渡されるものになる。
	 * このメソッドを呼び出すゲームは必ずsnapshot loaderを実装しなければならない。
	 * (snapshot loaderとは、idが "snapshotLoader" であるglobalなScriptAssetに定義された関数である。
	 * 詳細はスナップショットについてのドキュメントを参照)
	 *
	 * このメソッドは `Game#shouldSaveSnapshot()` が真を返す `Game` に対してのみ呼び出されるべきである。
	 * そうでない場合、このメソッドの動作は不定である。
	 *
	 * このメソッドを呼び出す推奨タイミングは、Trigger `Game#snapshotRequest` をhandleすることで得られる。
	 * ゲームは、 `snapshotRequest` がfireされたとき (それが可能なタイミングであれば) スナップショットを
	 * 生成してこのメソッドに渡すべきである。ゲーム開発者は推奨タイミング以外でもこのメソッドを呼び出すことができる。
	 * ただしその頻度は推奨タイミングの発火頻度と同程度に抑えられるべきである。
	 *
	 * @param snapshot 保存するスナップショット。JSONとして妥当な値でなければならない。
	 * @param timestamp 保存時の時刻。 `g.TimestampEvent` を利用するゲームの場合、それらと同じ基準の時間情報を与えなければならない。
	 */
	abstract saveSnapshot(snapshot: any, timestamp?: number): void;

	/**
	 * 現在時刻を取得する。
	 *
	 * 値は1970-01-01T00:00:00Zからのミリ秒での経過時刻である。
	 * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻である。
	 */
	abstract getCurrentTime(): number;

	/**
	 * このインスタンスがアクティブインスタンスであるかどうか返す。
	 *
	 * ゲーム開発者は、この値の真偽に起因する処理で、ゲームのローカルな実行状態を変更してはならず、
	 * `raiseEvent()` などによって、グローバルな状態を更新する必要がある。
	 */
	abstract isActiveInstance(): boolean;

	/**
	 * @private
	 */
	_fireSceneReady(scene: Scene): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.FireReady,
			scene: scene
		});
	}

	/**
	 * @private
	 */
	_fireSceneLoaded(scene: Scene): void {
		if (scene._loadingState < SceneLoadState.LoadedFired) {
			this._sceneChangeRequests.push({
				type: SceneChangeType.FireLoaded,
				scene: scene
			});
		}
	}

	/**
	 * @private
	 */
	_callSceneAssetHolderHandler(assetHolder: SceneAssetHolder): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.CallAssetHolderHandler,
			assetHolder: assetHolder
		});
	}

	/**
	 * @private
	 */
	_normalizeConfiguration(gameConfiguration: GameConfiguration): GameConfiguration {
		if (!gameConfiguration) throw ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: invalid arguments");
		if (gameConfiguration.assets == null) gameConfiguration.assets = {};
		if (gameConfiguration.fps == null) gameConfiguration.fps = 30;
		if (typeof gameConfiguration.fps !== "number")
			throw ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be given as a number");
		if (!(0 <= gameConfiguration.fps && gameConfiguration.fps <= 60))
			throw ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be a number in (0, 60].");
		if (typeof gameConfiguration.width !== "number")
			throw ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: width must be given as a number");
		if (typeof gameConfiguration.height !== "number")
			throw ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: height must be given as a number");
		return gameConfiguration;
	}

	/**
	 * @private
	 */
	_setAudioPlaybackRate(playbackRate: number): void {
		this.audio._setPlaybackRate(playbackRate);
	}

	/**
	 * @private
	 */
	_setMuted(muted: boolean): void {
		this.audio._setMuted(muted);
	}

	/**
	 * g.OperationEventのデータをデコードする。
	 * @private
	 */
	_decodeOperationPluginOperation(code: number, op: (number | string)[]): any {
		const plugins = this.operationPluginManager.plugins;
		if (!plugins[code] || !plugins[code].decode) return op;
		return plugins[code].decode(op);
	}

	/**
	 * ゲーム状態のリセット。
	 * @private
	 */
	_reset(param?: GameResetParameterObject): void {
		this.operationPluginManager.stopAll();
		if (this.scene()) {
			while (this.scene() !== this._initialScene) {
				this.popScene();
				this._flushSceneChangeRequests();
			}
			if (!this.isLoaded) {
				// _initialSceneの読み込みが終わっていない: _initialScene自体は使い回すので単にpopする。
				this.scenes.pop();
			}
		}

		if (param) {
			if (param.age !== undefined) this.age = param.age;
			if (param.randSeed !== undefined) this.random = new XorshiftRandomGenerator(param.randSeed);
		}

		this.audio._reset();
		this._loaded.removeAll({ func: this._start, owner: this });
		this.join.removeAll();
		this.leave.removeAll();
		this.seed.removeAll();
		this.resized.removeAll();
		this.skippingChanged.removeAll();

		this._idx = 0;
		this._localIdx = 0;
		this._cameraIdx = 0;
		this.db = {};
		this._localDb = {};
		this._modified = true;
		this.loadingScene = undefined;
		this._focusingCamera = undefined;
		this.snapshotRequest.removeAll();
		this._sceneChangeRequests = [];

		this._isTerminated = false;
		this.vars = {};

		if (this.surfaceAtlasSet) this.surfaceAtlasSet.destroy();
		this.surfaceAtlasSet = new SurfaceAtlasSet({ resourceFactory: this.resourceFactory });

		switch (this._configuration.defaultLoadingScene) {
			case "none":
				// Note: 何も描画しない実装として利用している
				this._defaultLoadingScene = new LoadingScene({ game: this });
				break;
			default:
				this._defaultLoadingScene = new DefaultLoadingScene({ game: this });
				break;
		}
	}

	/**
	 * ゲームを破棄する。
	 * エンジンユーザとコンテンツに開放された一部プロパティ(external, vars)は維持する点に注意。
	 * @private
	 */
	_destroy(): void {
		// ユーザコードを扱う操作プラグインを真っ先に破棄
		this.operationPluginManager.destroy();

		// 到達できるシーンを全て破棄
		if (this.scene()) {
			while (this.scene() !== this._initialScene) {
				this.popScene();
				this._flushSceneChangeRequests();
			}
		}
		this._initialScene.destroy();
		if (this.loadingScene && !this.loadingScene.destroyed()) {
			this.loadingScene.destroy();
		}
		if (!this._defaultLoadingScene.destroyed()) {
			this._defaultLoadingScene.destroy();
		}

		// NOTE: fps, width, height, external, vars はそのまま保持しておく
		this.db = undefined;
		this.renderers = undefined;
		this.scenes = undefined;
		this.random = undefined;
		this.join.destroy();
		this.join = undefined;
		this.leave.destroy();
		this.leave = undefined;
		this.seed.destroy();
		this.seed = undefined;
		this.playerInfo.destroy();
		this.playerInfo = undefined;
		this._modified = false;
		this.age = 0;
		this.assets = undefined; // this._initialScene.assets のエイリアスなので、特に破棄処理はしない。
		this.isLoaded = false;
		this.loadingScene = undefined;
		this.assetBase = "";
		this.selfId = undefined;
		this.audio.music.stopAll();
		this.audio.sound.stopAll();
		this.audio = undefined;
		this.defaultAudioSystemId = undefined;
		this.snapshotRequest.destroy();
		this.snapshotRequest = undefined;

		// TODO より能動的にdestroy処理を入れるべきかもしれない
		this.resourceFactory = undefined;
		this.storage = undefined;

		this.playId = undefined;
		this.operationPlugins = undefined; // this._operationPluginManager.pluginsのエイリアスなので、特に破棄処理はしない。
		this.resized.destroy();
		this.resized = undefined;
		this.skippingChanged.destroy();
		this.skippingChanged = undefined;
		this._eventTriggerMap = undefined;
		this._initialScene = undefined;
		this._defaultLoadingScene = undefined;
		this._sceneChanged.destroy();
		this._sceneChanged = undefined;
		this._loaded.destroy();
		this._loaded = undefined;
		this._started.destroy();
		this._started = undefined;
		this._main = undefined;
		this._mainParameter = undefined;
		this._assetManager.destroy();
		this._assetManager = undefined;
		this.audio = undefined;
		this.operationPluginManager = undefined;
		this._operationPluginOperated.destroy();
		this._operationPluginOperated = undefined;
		this._idx = 0;
		this._localDb = {};
		this._localIdx = 0;
		this._cameraIdx = 0;
		this._isTerminated = true;
		this._focusingCamera = undefined;
		this._configuration = undefined;
		this._sceneChangeRequests = [];
		this.surfaceAtlasSet.destroy();
		this.surfaceAtlasSet = undefined;
	}

	/**
	 * ゲームを開始する。
	 *
	 * 存在するシーンをすべて(_initialScene以外; あるなら)破棄し、グローバルアセットを読み込み、完了後ゲーム開発者の実装コードの実行を開始する。
	 * このメソッドの二度目以降の呼び出しの前には、 `this._reset()` を呼び出す必要がある。
	 * @param param ゲームのエントリポイントに渡す値
	 * @private
	 */
	_loadAndStart(param?: GameMainParameterObject): void {
		this._mainParameter = param || {};
		if (!this.isLoaded) {
			this._loaded.add(this._start, this);
			this.pushScene(this._initialScene);
			this._flushSceneChangeRequests();
		} else {
			this._start();
		}
	}

	/**
	 * グローバルアセットの読み込みを開始する。
	 * 単体テスト用 (mainSceneなど特定アセットの存在を前提にする_loadAndStart()はテストに使いにくい) なので、通常ゲーム開発者が利用することはない
	 * @private
	 */
	_startLoadingGlobalAssets(): void {
		if (this.isLoaded) throw ExceptionFactory.createAssertionError("Game#_startLoadingGlobalAssets: already loaded.");
		this.pushScene(this._initialScene);
		this._flushSceneChangeRequests();
	}

	/**
	 * @private
	 */
	_updateEventTriggers(scene: Scene): void {
		this._modified = true;
		if (!scene) {
			this._eventTriggerMap[EventType.Message] = undefined;
			this._eventTriggerMap[EventType.PointDown] = undefined;
			this._eventTriggerMap[EventType.PointMove] = undefined;
			this._eventTriggerMap[EventType.PointUp] = undefined;
			this._eventTriggerMap[EventType.Operation] = undefined;
			return;
		}

		this._eventTriggerMap[EventType.Message] = scene.message;
		this._eventTriggerMap[EventType.PointDown] = scene.pointDownCapture;
		this._eventTriggerMap[EventType.PointMove] = scene.pointMoveCapture;
		this._eventTriggerMap[EventType.PointUp] = scene.pointUpCapture;
		this._eventTriggerMap[EventType.Operation] = scene.operation;
		scene._activate();
	}

	/**
	 * @private
	 */
	_onInitialSceneLoaded(): void {
		this._initialScene.loaded.remove(this._onInitialSceneLoaded, this);
		this.assets = this._initialScene.assets;
		this.isLoaded = true;
		this._loaded.fire();
	}

	/**
	 * @private
	 */
	abstract _leaveGame(): void;

	/**
	 * @private
	 */
	_terminateGame(): void {
		// do nothing.
	}

	/**
	 * 要求されたシーン遷移を実行する。
	 *
	 * `pushScene()` 、 `replaceScene()` や `popScene()` によって要求されたシーン遷移を実行する。
	 * 通常このメソッドは、毎フレーム一度、フレームの最後に呼び出されることを期待する (`Game#tick()` がこの呼び出しを行う)。
	 * ただしゲーム開始時 (グローバルアセット読み込み・スナップショットローダ起動後またはmainScene実行開始時) に関しては、
	 * シーン追加がゲーム開発者の記述によらない (`tick()` の外側である) ため、それぞれの箇所で明示的にこのメソッドを呼び出す。
	 * @private
	 */
	_flushSceneChangeRequests(): void {
		do {
			var reqs = this._sceneChangeRequests;
			this._sceneChangeRequests = [];
			for (var i = 0; i < reqs.length; ++i) {
				var req = reqs[i];
				switch (req.type) {
					case SceneChangeType.Push:
						var oldScene = this.scene();
						if (oldScene) {
							oldScene._deactivate();
						}
						this._doPushScene(req.scene);
						break;
					case SceneChangeType.Replace:
						// Note: replaceSceneの場合、pop時点では_sceneChangedをfireしない。_doPushScene() で一度だけfireする。
						this._doPopScene(req.preserveCurrent, false);
						this._doPushScene(req.scene);
						break;
					case SceneChangeType.Pop:
						this._doPopScene(req.preserveCurrent, true);
						break;
					case SceneChangeType.FireReady:
						if (!req.scene.destroyed()) req.scene._fireReady();
						break;
					case SceneChangeType.FireLoaded:
						if (!req.scene.destroyed()) req.scene._fireLoaded();
						break;
					case SceneChangeType.CallAssetHolderHandler:
						req.assetHolder.callHandler();
						break;
					default:
						throw ExceptionFactory.createAssertionError("Game#_flushSceneChangeRequests: unknown scene change request.");
				}
			}
		} while (this._sceneChangeRequests.length > 0); // flush中に追加される限りflushを続行する
	}

	private _doPopScene(preserveCurrent: boolean, fireSceneChanged: boolean): void {
		var scene = this.scenes.pop();
		if (scene === this._initialScene)
			throw ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; attempting to pop the initial scene");
		if (!preserveCurrent) scene.destroy();
		if (fireSceneChanged) this._sceneChanged.fire(this.scene());
	}

	private _start(): void {
		this.operationPluginManager.initialize();
		this.operationPlugins = this.operationPluginManager.plugins;

		const mainFun = this._moduleManager._require(this._main);
		if (!mainFun || typeof mainFun !== "function")
			throw ExceptionFactory.createAssertionError("Game#_start: Entry point '" + this._main + "' not found.");
		mainFun(this._mainParameter);
		this._flushSceneChangeRequests(); // シーン遷移を要求する可能性がある(というかまずする)
		this._started.fire();
	}

	private _doPushScene(scene: Scene, loadingScene?: LoadingScene): void {
		if (!loadingScene) loadingScene = this.loadingScene || this._defaultLoadingScene;
		this.scenes.push(scene);

		if (scene._needsLoading() && scene._loadingState < SceneLoadState.LoadedFired) {
			if (this._defaultLoadingScene._needsLoading())
				throw ExceptionFactory.createAssertionError(
					"Game#_doPushScene: _defaultLoadingScene must not depend on any assets/storages."
				);
			this._doPushScene(loadingScene, this._defaultLoadingScene);
			loadingScene.reset(scene);
		} else {
			// 読み込み待ちのアセットがなければその場で(loadingSceneに任せず)ロード、SceneReadyを発生させてからLoadingSceneEndを起こす。
			this._sceneChanged.fire(scene);
			if (!scene._loaded) {
				scene._load();
				this._fireSceneLoaded(scene);
			}
		}
		this._modified = true;
	}
}
