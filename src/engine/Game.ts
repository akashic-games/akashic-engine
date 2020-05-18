import * as pl from "@akashic/playlog";
import { Trigger } from "@akashic/trigger";
import { ExceptionFactory } from "../pdi-common-impls/ExceptionFactory";
import { AssetLike } from "../pdi-types/AssetLike";
import { CommonOffset, CommonSize } from "../pdi-types/commons";
import { PlatformPointEvent, PlatformPointType } from "../pdi-types/PlatformPointEvent";
import { RendererLike } from "../pdi-types/RendererLike";
import { ResourceFactoryLike } from "../pdi-types/ResourceFactoryLike";
import { ScriptAssetRuntimeValueBase } from "../pdi-types/ScriptAssetRuntimeValue";
import { AssetManager } from "./AssetManager";
import { AudioSystemManager } from "./AudioSystemManager";
import { Camera } from "./Camera";
import { DefaultLoadingScene } from "./DefaultLoadingScene";
import { E, PointSource } from "./entities/E";
import { Event, EventTypeString, JoinEvent, LeaveEvent, SeedEvent, PlayerInfoEvent } from "./Event";
import { EventConverter } from "./EventConverter";
import { EventFilter } from "./EventFilter";
import { GameConfiguration } from "./GameConfiguration";
import { GameHandlerSet } from "./GameHandlerSet";
import { GameMainParameterObject } from "./GameMainParameterObject";
import { LoadingScene } from "./LoadingScene";
import { LocalTickModeString } from "./LocalTickModeString";
import { ModuleManager } from "./ModuleManager";
import { OperationPlugin } from "./OperationPlugin";
import { OperationPluginManager } from "./OperationPluginManager";
import { InternalOperationPluginOperation } from "./OperationPluginOperation";
import { OperationPluginViewInfo } from "./OperationPluginViewInfo";
import { PointEventResolver } from "./PointEventResolver";
import { RandomGenerator } from "./RandomGenerator";
import { Scene } from "./Scene";
import { Storage } from "./Storage";
import { SurfaceAtlasSet } from "./SurfaceAtlasSet";
import { SurfaceAtlasSetLike } from "./SurfaceAtlasSetLike";
import { TickGenerationModeString } from "./TickGenerationModeString";
import { XorshiftRandomGenerator } from "./XorshiftRandomGenerator";

/**
 * post-tick タスクのタイプ。
 */
const enum PostTickTaskType {
	/**
	 * シーンスタックのトップにシーンを追加する。
	 */
	PushScene,
	/**
	 * シーンスタックから直近のシーンを削除し、シーンを追加する。
	 */
	ReplaceScene,
	/**
	 * シーンスタックから直近のシーンを削除する。
	 */
	PopScene,

	/**
	 * 任意の関数を呼び出す。
	 */
	Call
}

/**
 * post-tick タスク。
 *
 * tick 消化タイミングに同期して行われるタスクを表す。
 */
interface PostTickTask {
	/**
	 * 遷移の種類。
	 */
	type: PostTickTaskType;

	/**
	 * 遷移先になるシーン。
	 * `type` が `Push` または `Replace` の時のみ存在。
	 */
	scene?: Scene;

	/**
	 * 現在のシーンを破棄するか否か。
	 * `type` が `Pop` または `Replace` の時のみ存在。
	 */
	preserveCurrent?: boolean;

	/**
	 * 呼び出す関数。
	 * `type` が `Call` の時のみ存在。
	 */
	fun?: Function;

	/**
	 * `fun` の `this` として使う値。
	 * `type` が `Call` の時のみ存在。
	 */
	owner?: any;
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

	/**
	 * 乱数生成器のシリアリゼーション。
	 * 省略された場合、元の値が維持される。
	 */
	randGenSer?: any;
}

/**
 * `Game` のコンストラクタに渡すことができるパラメータ。
 */
export interface GameParameterObject {
	/**
	 * require("@akashic/akashic-engine") により得られる値。
	 * この値はスクリプトアセットの実行時に `g` のグローバル変数の基底として利用される。
	 * (モジュールの仕様上この値を `g.Game` 自身が生成するのが難しいため、外部から与えている)
	 * TODO: 変数名の検討
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
	 * この `Game` が用いるハンドラセット
	 */
	handlerSet: GameHandlerSet;

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
export class Game {
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
	onJoin: Trigger<JoinEvent>;
	/**
	 * プレイヤーがゲームから離脱したことを表すイベント。
	 */
	onLeave: Trigger<LeaveEvent>;
	/**
	 * 新しいプレイヤー情報が発生したことを示すイベント。
	 */
	onPlayerInfo: Trigger<PlayerInfoEvent>;
	/**
	 * 新しい乱数シードが発生したことを示すイベント。
	 */
	onSeed: Trigger<SeedEvent>;
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
	onSnapshotRequest: Trigger<void>;

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
	 * ハンドラセット。
	 */
	handlerSet: GameHandlerSet;

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
	onResized: Trigger<CommonSize>;

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
	onSkipChange: Trigger<boolean>;

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
	 * 直近の `Scene#local` の値。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	lastLocalTickMode: LocalTickModeString | null;

	/**
	 * 直近の `Scene#tickGenerationMode` の値。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	lastTickGenerationMode: TickGenerationModeString | null;

	/**
	 * ゲーム全体で共有するサーフェスアトラス。
	 */
	surfaceAtlasSet: SurfaceAtlasSetLike;

	/**
	 * 操作プラグインの管理者。
	 */
	operationPluginManager: OperationPluginManager;

	/**
	 * `this.scenes` の変化時にfireされるTrigger。
	 * このTriggerはアセットロード(Scene#onLoadのfire)を待たず、変化した時点で即fireされることに注意。
	 */
	onSceneChange: Trigger<Scene | undefined>;

	/**
	 * プレイヤーがゲームに参加したことを表すイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onJoin` を利用すること。
	 */
	join: Trigger<JoinEvent>;

	/**
	 * プレイヤーがゲームから離脱したことを表すイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onLeave` を利用すること。
	 */
	leave: Trigger<LeaveEvent>;

	/**
	 * 新しいプレイヤー情報が発生したことを示すイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPlayerInfo` を利用すること。
	 */
	playerInfo: Trigger<PlayerInfoEvent>;

	/**
	 * 新しい乱数シードが発生したことを示すイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onSeed` を利用すること。
	 */
	seed: Trigger<SeedEvent>;

	/**
	 * スナップショット要求通知。
	 * ゲーム開発者はこれをhandleして可能ならスナップショットを作成しGame#saveSnapshotを呼び出すべきである。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onSnapshotRequest` を利用すること。
	 */
	// NOTE: このクラスはこのTriggerをfireしない。派生クラスがfireせねばならない。
	snapshotRequest: Trigger<void>;

	/**
	 * 画面サイズの変更時にfireされるTrigger。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onResized` を利用すること。
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
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onSkipChange` を利用すること。
	 */
	skippingChanged: Trigger<boolean>;

	/**
	 * ゲームが早送りに状態にあるかどうか。
	 *
	 * スキップ状態であれば真、非スキップ状態であれば偽である。
	 * ゲーム開発者は、この値に起因する処理で、ゲームのグローバルな実行状態を変化させてはならない。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	isSkipping: boolean;

	/**
	 * イベントとTriggerのマップ。
	 * @private
	 */
	_eventTriggerMap: { [key in EventTypeString]?: Trigger<Event> };

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
	 * `this.onSceneChange` と同様に `this.scenes` の変化時にfireされるTrigger。
	 * `this.onSceneChange` との相違点は以下の通りである。
	 * * 内部でのみ使用される Trigger なので、ゲーム開発者が直接利用すべきではない
	 * * Game#_reset() 時に removeAll() されない (登録内容がリセットされず、残っている)
	 * @private
	 */
	_onSceneChange: Trigger<Scene | undefined>;

	/**
	 * グローバルアセットの読み込み待ちハンドラ。
	 * @private
	 */
	_onLoad: Trigger<Game>;

	/**
	 * _handleLoad() 呼び出しから戻る直前を通知するTrigger。
	 * エントリポイント実行後のシーン遷移直後にfireされる。
	 * このTriggerのfireは一度とは限らないことに注意。_loadAndStart()呼び出しの度に一度fireされる。
	 * @private
	 */
	_onStart: Trigger<void>;

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
	_onOperationPluginOperated: Trigger<InternalOperationPluginOperation>;

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
	 * グローバルアセットの読み込み待ちハンドラ。
	 * @private
	 * @deprecated 非推奨である。将来的に削除される。代わりに `_onLoad` を利用すること。
	 */
	_loaded: Trigger<Game>;
	/**
	 * `this.scenes` の変化時にfireされるTrigger。
	 * このTriggerはアセットロード(Scene#onLoadのfire)を待たず、変化した時点で即fireされることに注意。
	 * @private
	 * @deprecated 非推奨である。将来的に削除される。代わりに `_onSceneChange` を利用すること。
	 */
	_sceneChanged: Trigger<Scene | undefined>;

	/**
	 * _handleLoad() 呼び出しから戻る直前を通知するTrigger。
	 * エントリポイント実行後のシーン遷移直後にfireされる。
	 * このTriggerのfireは一度とは限らないことに注意。_loadAndStart()呼び出しの度に一度fireされる。
	 * @private
	 * @deprecated 非推奨である。将来的に削除される。代わりに `_onStart` を利用すること。
	 */
	_started: Trigger<void>;

	/**
	 * 操作プラグインによる操作を通知するTrigger。
	 * @private
	 * @deprecated 非推奨である。将来的に削除される。代わりに `_onOperationPluginOperated` を利用すること。
	 */
	_operationPluginOperated: Trigger<InternalOperationPluginOperation>;

	/**
	 * 実行待ちの post-tick タスク。
	 */
	private _postTickTasks: PostTickTask[];

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
	 *
	 * @param param この `Game` に指定するパラメータ
	 */
	constructor(param: GameParameterObject) {
		const gameConfiguration = this._normalizeConfiguration(param.configuration);
		this.fps = gameConfiguration.fps;
		this.width = gameConfiguration.width;
		this.height = gameConfiguration.height;
		this.renderers = [];
		this.scenes = [];
		this.random = null;
		this.age = 0;
		this.assetBase = param.assetBase || "";
		this.resourceFactory = param.resourceFactory;
		this.handlerSet = param.handlerSet;
		this.selfId = param.selfId;
		this.playId = undefined;
		this.isSkipping = false;
		this.audio = new AudioSystemManager(this.resourceFactory);

		this.defaultAudioSystemId = "sound";
		this.storage = new Storage();
		this.assets = {};
		this.surfaceAtlasSet = undefined;

		this.onJoin = new Trigger<JoinEvent>();
		this.onLeave = new Trigger<LeaveEvent>();
		this.onPlayerInfo = new Trigger<PlayerInfoEvent>();
		this.onSeed = new Trigger<SeedEvent>();
		this.join = this.onJoin;
		this.leave = this.onLeave;
		this.playerInfo = this.onPlayerInfo;
		this.seed = this.onSeed;

		this._eventTriggerMap = {
			join: this.onJoin,
			leave: this.onLeave,
			"player-info": this.onPlayerInfo,
			seed: this.onSeed,
			message: undefined,
			"point-down": undefined,
			"point-move": undefined,
			"point-up": undefined,
			operation: undefined
		};

		this.onResized = new Trigger<CommonSize>();
		this.onSkipChange = new Trigger<boolean>();
		this.resized = this.onResized;
		this.skippingChanged = this.onSkipChange;

		this.isLastTickLocal = true;
		this.lastOmittedLocalTickCount = 0;
		this.lastLocalTickMode = null;
		this.lastTickGenerationMode = null;

		this._onLoad = new Trigger<Game>();
		this._onStart = new Trigger<void>();
		this._loaded = this._onLoad;
		this._started = this._onStart;

		this.isLoaded = false;
		this.onSnapshotRequest = new Trigger<void>();
		this.snapshotRequest = this.onSnapshotRequest;

		this.external = {};

		this._runtimeValueBase = Object.create(param.engineModule, {
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

		const operationPluginsField = gameConfiguration.operationPlugins || [];
		this.operationPluginManager = new OperationPluginManager(this, param.operationPluginViewInfo, operationPluginsField);
		this._onOperationPluginOperated = new Trigger<InternalOperationPluginOperation>();
		this._operationPluginOperated = this._onOperationPluginOperated;
		this.operationPluginManager.onOperate.add(this._onOperationPluginOperated.fire, this._onOperationPluginOperated);

		this.onSceneChange = new Trigger<Scene>();
		this._onSceneChange = new Trigger<Scene>();
		this._onSceneChange.add(this._handleSceneChanged, this);
		this._sceneChanged = this._onSceneChange;

		this._initialScene = new Scene({
			game: this,
			assetIds: this._assetManager.globalAssetIds(),
			local: true,
			name: "akashic:initial-scene"
		});
		this._initialScene.onLoad.add(this._handleInitialSceneLoad, this);

		this._reset({ age: 0 });
	}

	/**
	 * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
	 *
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は現在のフレームの終わり(Scene#update の fire 後) まで遅延される。
	 * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `"deactive"` でfireされる。
	 * その後 `scene.stateChanged` が引数 `"active"` でfireされる。
	 * @param scene 遷移後のシーン
	 */
	pushScene(scene: Scene): void {
		this._postTickTasks.push({
			type: PostTickTaskType.PushScene,
			scene: scene
		});
	}

	/**
	 * 現在のシーンの置き換えを要求する。
	 *
	 * 現在のシーンをシーンスタックから取り除き、指定のシーンを追加することを要求する。
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は現在のフレームの終わり(Scene#update の fire 後) まで遅延される。
	 * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
	 * またその時 `stateChanged` が引数 `"destroyed"` でfireされる。
	 * その後 `scene.stateChanged` が引数 `"active"` でfireされる。
	 *
	 * @param scene 遷移後のシーン
	 * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
	 */
	replaceScene(scene: Scene, preserveCurrent?: boolean): void {
		this._postTickTasks.push({
			type: PostTickTaskType.ReplaceScene,
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
	 * またその時 `stateChanged` が引数 `"destroyed"` でfireされる。
	 * その後一つ前のシーンの `stateChanged` が引数 `"active"` でfireされる。
	 * また、step数がスタックされているシーンの数以上の場合、例外が投げられる。
	 *
	 * @param preserve 真の場合、シーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
	 * @param step 取り除くシーンの数。省略された場合、1
	 */
	popScene(preserve?: boolean, step: number = 1): void {
		for (let i = 0; i < step; i++) {
			this._postTickTasks.push({ type: PostTickTaskType.PopScene, preserveCurrent: preserve });
		}
	}

	/**
	 * 現在のシーンを返す。
	 * ない場合、 `undefined` を返す。
	 */
	scene(): Scene | undefined {
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

			scene.onUpdate.fire();
			if (advanceAge) ++this.age;
		}

		if (this._postTickTasks.length) {
			this._flushPostTickTasks();
			return scene !== this.scenes[this.scenes.length - 1];
		}
		return false;
	}

	/**
	 * このGameを描画する。
	 *
	 * このゲームに紐づけられた `Renderer` (`this.renderers` に含まれるすべての `Renderer` で、この `Game` の描画を行う。
	 * 描画内容に変更がない場合、描画処理がスキップされる点に注意。強制的に描画をする場合は `this.modified()` を呼ぶこと。
	 * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	render(): void {
		if (!this._modified) return;

		const scene = this.scene();
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

			const children = scene.children;
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
	 * 対象のポイントイベントのターゲットエンティティ(`PointTarget#target`)を解決し、それを補完した playlog.Event を返す。
	 * Down -> Move -> Up とは異なる順番で呼び出された場合 `null` を返す。
	 * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
	 * @param e プラットフォームのポイントイベント
	 */
	resolvePointEvent(e: PlatformPointEvent): pl.Event | null {
		switch (e.type) {
			case PlatformPointType.Down:
				return this._pointEventResolver.pointDown(e);
			case PlatformPointType.Move:
				return this._pointEventResolver.pointMove(e);
			case PlatformPointType.Up:
				return this._pointEventResolver.pointUp(e);
		}
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
	 * このゲームを終了する。
	 *
	 * エンジンに対して続行の断念を通知する。
	 * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
	 * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
	 */
	terminateGame(): void {
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
	raiseEvent(e: Event): void {
		this.handlerSet.raiseEvent(this._eventConverter.toPlaylogEvent(e));
	}

	/**
	 * ティックを発生させる。
	 *
	 * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに時間経過を要求することができる。
	 * 現在のシーンのティック生成モード `Scene#tickGenerationMode` が `"manual"` でない場合、エラー。
	 *
	 * @param events そのティックで追加で発生させるイベント
	 */
	raiseTick(events?: Event[]): void {
		if (events == null || !events.length) {
			this.handlerSet.raiseTick();
			return;
		}
		const plEvents: pl.Event[] = [];
		for (let i = 0; i < events.length; i++) {
			plEvents.push(this._eventConverter.toPlaylogEvent(events[i]));
		}
		this.handlerSet.raiseTick(plEvents);
	}

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
	addEventFilter(filter: EventFilter, handleEmpty?: boolean): void {
		this.handlerSet.addEventFilter(filter, handleEmpty);
	}

	/**
	 * イベントフィルタを削除する。
	 *
	 * @param filter 削除するイベントフィルタ
	 */
	removeEventFilter(filter: EventFilter): void {
		this.handlerSet.removeEventFilter(filter);
	}

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
	shouldSaveSnapshot(): boolean {
		return this.handlerSet.shouldSaveSnapshot();
	}

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
	saveSnapshot(snapshot: any, timestamp?: number): void {
		this.handlerSet.saveSnapshot(this.age, snapshot, this.random.serialize(), timestamp);
	}

	/**
	 * 現在時刻を取得する。
	 *
	 * 値は1970-01-01T00:00:00Zからのミリ秒での経過時刻である。
	 * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻である。
	 */
	getCurrentTime(): number {
		return this.handlerSet.getCurrentTime();
	}

	/**
	 * このインスタンスがアクティブインスタンスであるかどうか返す。
	 *
	 * ゲーム開発者は、この値の真偽に起因する処理で、ゲームのローカルな実行状態を変更してはならず、
	 * `raiseEvent()` などによって、グローバルな状態を更新する必要がある。
	 */
	isActiveInstance(): boolean {
		return this.handlerSet.getInstanceType() === "active";
	}

	_pushPostTickTask(fun: () => void, owner: any): void {
		this._postTickTasks.push({
			type: PostTickTaskType.Call,
			fun,
			owner
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
				this._flushPostTickTasks();
			}
			if (!this.isLoaded) {
				// _initialSceneの読み込みが終わっていない: _initialScene自体は使い回すので単にpopする。
				this.scenes.pop();
			}
		}

		if (param) {
			if (param.age !== undefined) this.age = param.age;
			if (param.randGenSer !== undefined) {
				this.random = XorshiftRandomGenerator.deserialize(param.randGenSer);
			} else if (param.randSeed !== undefined) {
				this.random = new XorshiftRandomGenerator(param.randSeed);
			}
		}

		this.audio._reset();
		this._onLoad.removeAll({ func: this._handleLoad, owner: this });
		this.onJoin.removeAll();
		this.onLeave.removeAll();
		this.onSeed.removeAll();
		this.onResized.removeAll();
		this.onSkipChange.removeAll();
		this.onSceneChange.removeAll();
		this.handlerSet.removeAllEventFilters();

		this.isSkipping = false;
		this.onSkipChange.add(this._handleSkipChange, this);

		this._idx = 0;
		this._localIdx = 0;
		this._cameraIdx = 0;
		this.db = {};
		this._localDb = {};
		this._modified = true;
		this.loadingScene = undefined;
		this._focusingCamera = undefined;
		this.lastLocalTickMode = null;
		this.lastTickGenerationMode = null;
		this.onSnapshotRequest.removeAll();
		this._postTickTasks = [];
		this._eventConverter = new EventConverter({ game: this, playerId: this.selfId });
		this._pointEventResolver = new PointEventResolver({ sourceResolver: this, playerId: this.selfId });

		this._isTerminated = false;
		this.vars = {};

		if (this.surfaceAtlasSet) this.surfaceAtlasSet.destroy();
		this.surfaceAtlasSet = new SurfaceAtlasSet({ resourceFactory: this.resourceFactory });

		switch (this._configuration.defaultLoadingScene) {
			case "none":
				// Note: 何も描画しない実装として利用している
				this._defaultLoadingScene = new LoadingScene({ game: this });
				break;
			case "compact":
				this._defaultLoadingScene = new DefaultLoadingScene({ game: this, style: "compact" });
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
				this._flushPostTickTasks();
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
		this.onJoin.destroy();
		this.onJoin = undefined;
		this.onLeave.destroy();
		this.onLeave = undefined;
		this.onSeed.destroy();
		this.onSeed = undefined;
		this.onPlayerInfo.destroy();
		this.onPlayerInfo = undefined;

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
		this.onSnapshotRequest.destroy();
		this.onSnapshotRequest = undefined;
		this.handlerSet = undefined;

		// TODO より能動的にdestroy処理を入れるべきかもしれない
		this.resourceFactory = undefined;
		this.storage = undefined;

		this.playId = undefined;
		this.operationPlugins = undefined; // this._operationPluginManager.pluginsのエイリアスなので、特に破棄処理はしない。
		this.onResized.destroy();
		this.onResized = undefined;
		this.onSkipChange.destroy();
		this.onSkipChange = undefined;
		this._eventTriggerMap = undefined;
		this._initialScene = undefined;
		this._defaultLoadingScene = undefined;
		this.onSceneChange.destroy();
		this.onSceneChange = undefined;
		this._onSceneChange.destroy();
		this._onSceneChange = undefined;
		this._onLoad.destroy();
		this._onLoad = undefined;
		this._onStart.destroy();
		this._onStart = undefined;
		this._main = undefined;
		this._mainParameter = undefined;
		this._assetManager.destroy();
		this._assetManager = undefined;
		this._eventConverter = undefined;
		this._pointEventResolver = undefined;
		this.audio = undefined;
		this.operationPluginManager = undefined;
		this._onOperationPluginOperated.destroy();
		this._onOperationPluginOperated = undefined;
		this._idx = 0;
		this._localDb = {};
		this._localIdx = 0;
		this._cameraIdx = 0;
		this._isTerminated = true;
		this._focusingCamera = undefined;
		this._configuration = undefined;
		this._postTickTasks = [];
		this.surfaceAtlasSet.destroy();
		this.surfaceAtlasSet = undefined;

		this.join = undefined;
		this.leave = undefined;
		this.seed = undefined;
		this.playerInfo = undefined;
		this.snapshotRequest = undefined;
		this.resized = undefined;
		this.skippingChanged = undefined;
		this._sceneChanged = undefined;
		this._loaded = undefined;
		this._started = undefined;
		this._operationPluginOperated = undefined;
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
			this._onLoad.add(this._handleLoad, this);
			this.pushScene(this._initialScene);
			this._flushPostTickTasks();
		} else {
			this._handleLoad();
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
		this._flushPostTickTasks();
	}

	/**
	 * @private
	 */
	_updateEventTriggers(scene: Scene): void {
		this._modified = true;
		if (!scene) {
			this._eventTriggerMap.message = undefined;
			this._eventTriggerMap["point-down"] = undefined;
			this._eventTriggerMap["point-move"] = undefined;
			this._eventTriggerMap["point-up"] = undefined;
			this._eventTriggerMap.operation = undefined;
			return;
		}

		this._eventTriggerMap.message = scene.onMessage;
		this._eventTriggerMap["point-down"] = scene.onPointDownCapture;
		this._eventTriggerMap["point-move"] = scene.onPointMoveCapture;
		this._eventTriggerMap["point-up"] = scene.onPointUpCapture;
		this._eventTriggerMap.operation = scene.onOperation;
		scene._activate();
	}

	/**
	 * @private
	 */
	_handleInitialSceneLoad(): void {
		this._initialScene.onLoad.remove(this._handleInitialSceneLoad, this);
		this.assets = this._initialScene.assets;
		this.isLoaded = true;
		this._onLoad.fire();
	}

	_handleOperationPluginOperated(op: InternalOperationPluginOperation): void {
		const pev = this._eventConverter.makePlaylogOperationEvent(op);
		this.handlerSet.raiseEvent(pev);
	}

	_handleSceneChanged(scene?: Scene): void {
		this._updateEventTriggers(scene);
		const local = scene ? scene.local : "full-local";
		const tickGenerationMode = scene ? scene.tickGenerationMode : "by-clock";
		if (this.lastLocalTickMode === local && this.lastTickGenerationMode === tickGenerationMode) {
			return;
		}
		this.lastLocalTickMode = local;
		this.lastTickGenerationMode = tickGenerationMode;
		this.handlerSet.changeSceneMode({
			local,
			tickGenerationMode
		});
	}

	/**
	 * @private
	 */
	_terminateGame(): void {
		// do nothing.
	}

	/**
	 * post-tick タスクを実行する。
	 *
	 * `pushScene()` などのシーン遷移や `_pushPostTickTask()` によって要求された post-tick タスクを実行する。
	 * 通常このメソッドは、毎フレーム一度、フレームの最後に呼び出されることを期待する (`Game#tick()` がこの呼び出しを行う)。
	 * ただしゲーム開始時 (グローバルアセット読み込み・スナップショットローダ起動後またはmainScene実行開始時) に関しては、
	 * シーン追加がゲーム開発者の記述によらない (`tick()` の外側である) ため、それぞれの箇所で明示的にこのメソッドを呼び出す。
	 * @private
	 */
	_flushPostTickTasks(): void {
		do {
			var reqs = this._postTickTasks;
			this._postTickTasks = [];
			for (var i = 0; i < reqs.length; ++i) {
				var req = reqs[i];
				switch (req.type) {
					case PostTickTaskType.PushScene:
						var oldScene = this.scene();
						if (oldScene) {
							oldScene._deactivate();
						}
						this._doPushScene(req.scene);
						break;
					case PostTickTaskType.ReplaceScene:
						// Note: replaceSceneの場合、pop時点では_sceneChangedをfireしない。_doPushScene() で一度だけfireする。
						this._doPopScene(req.preserveCurrent, false);
						this._doPushScene(req.scene);
						break;
					case PostTickTaskType.PopScene:
						this._doPopScene(req.preserveCurrent, true);
						break;
					case PostTickTaskType.Call:
						req.fun.call(req.owner);
						break;
					default:
						throw ExceptionFactory.createAssertionError("Game#_flushPostTickTasks: unknown post-tick task type.");
				}
			}
		} while (this._postTickTasks.length > 0); // flush中に追加される限りflushを続行する
	}

	_handleSkipChange(isSkipping: boolean): void {
		this.isSkipping = isSkipping;
	}

	private _doPopScene(preserveCurrent: boolean, fireSceneChanged: boolean): void {
		var scene = this.scenes.pop();
		if (scene === this._initialScene)
			throw ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; attempting to pop the initial scene");
		if (!preserveCurrent) scene.destroy();
		if (fireSceneChanged) {
			this.onSceneChange.fire(this.scene());
			this._onSceneChange.fire(this.scene());
		}
	}

	private _handleLoad(): void {
		this.operationPluginManager.initialize();
		this.operationPlugins = this.operationPluginManager.plugins;

		const mainFun = this._moduleManager._require(this._main);
		if (!mainFun || typeof mainFun !== "function")
			throw ExceptionFactory.createAssertionError("Game#_handleLoad: Entry point '" + this._main + "' not found.");
		mainFun(this._mainParameter);
		this._flushPostTickTasks(); // シーン遷移を要求する可能性がある(というかまずする)
		this._onStart.fire();
	}

	private _doPushScene(scene: Scene, loadingScene?: LoadingScene): void {
		if (!loadingScene) loadingScene = this.loadingScene || this._defaultLoadingScene;
		this.scenes.push(scene);

		if (scene._needsLoading() && scene._loadingState !== "loaded-fired") {
			if (this._defaultLoadingScene._needsLoading())
				throw ExceptionFactory.createAssertionError(
					"Game#_doPushScene: _defaultLoadingScene must not depend on any assets/storages."
				);
			this._doPushScene(loadingScene, this._defaultLoadingScene);
			loadingScene.reset(scene);
		} else {
			this.onSceneChange.fire(scene);
			this._onSceneChange.fire(scene);
			// 読み込み待ちのアセットがなければその場で(loadingSceneに任せず)ロード、SceneReadyを発生させてからLoadingSceneEndを起こす。
			if (!scene._loaded) {
				scene._load();
				this._pushPostTickTask(scene._fireLoaded, scene);
			}
		}
		this._modified = true;
	}
}
