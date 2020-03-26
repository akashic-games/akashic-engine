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
import { GameHandlerSet } from "./GameHandlerSet";
import { AssetLike } from "./interfaces/AssetLike";
import { RendererLike } from "./interfaces/RendererLike";
import { ResourceFactoryLike } from "./interfaces/ResourceFactoryLike";
import { ScriptAssetRuntimeValueBase } from "./interfaces/ScriptAssetRuntimeValue";
import { SurfaceAtlasSetLike } from "./interfaces/SurfaceAtlasSetLike";
import { InternalGame } from "./InternalGame";
import { Scene, SceneAssetHolder, SceneLoadState } from "./Scene";
import { CommonOffset, CommonSize } from "./types/commons";
import { EventFilter } from "./types/EventFilter";
import { GameConfiguration } from "./types/GameConfiguration";
import { GameMainParameterObject } from "./types/GameMainParameterObject";
import { LocalTickMode } from "./types/LocalTickMode";
import { OperationPlugin } from "./types/OperationPlugin";
import { InternalOperationPluginOperation } from "./types/OperationPluginOperation";
import { OperationPluginViewInfo } from "./types/OperationPluginViewInfo";
import { PlatformPointEvent, PlatformPointType } from "./types/PlatformPointEvent";
import { TickGenerationMode } from "./types/TickGenerationMode";

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
 */
export class Game implements InternalGame {
	/**
	 * このコンテンツを描画するためのオブジェクト群。
	 */
	renderers: RendererLike[];

	/**
	 * グローバルアセットが読み込み済みの場合真。でなければ偽。
	 */
	isLoaded: boolean;

	/**
	 * ハンドラセット。
	 */
	handlerSet: GameHandlerSet;

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
	 * このTriggerはアセットロード(Scene#onLoadのfire)を待たず、変化した時点で即fireされることに注意。
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

	// defined in RuntimeGame
	scenes: Scene[];
	random: RandomGenerator;
	onJoin: Trigger<JoinEvent>;
	onLeave: Trigger<LeaveEvent>;
	onPlayerInfo: Trigger<PlayerInfoEvent>;
	onSeed: Trigger<SeedEvent>;
	age: number;
	fps: number;
	width: number;
	height: number;
	assets: { [key: string]: AssetLike };
	loadingScene: LoadingScene;
	selfId: string;
	audio: AudioSystemManager;
	defaultAudioSystemId: "music" | "sound";
	onSnapshotRequest: Trigger<void>;
	external: any;
	resourceFactory: ResourceFactoryLike;
	storage: Storage;
	vars: any;
	playId: string;
	operationPlugins: { [key: number]: OperationPlugin };
	onResized: Trigger<CommonSize>;
	onSkipChange: Trigger<boolean>;
	isLastTickLocal: boolean;
	lastOmittedLocalTickCount: number;
	lastLocalTickMode: LocalTickMode | null;
	lastTickGenerationMode: TickGenerationMode | null;
	surfaceAtlasSet: SurfaceAtlasSetLike;
	operationPluginManager: OperationPluginManager;
	join: Trigger<JoinEvent>;
	leave: Trigger<LeaveEvent>;
	playerInfo: Trigger<PlayerInfoEvent>;
	seed: Trigger<SeedEvent>;
	snapshotRequest: Trigger<void>;
	resized: Trigger<CommonSize>;
	skippingChanged: Trigger<boolean>;

	// defined in InternalGame
	db: { [idx: number]: E };
	assetBase: string;
	_localDb: { [id: number]: E };
	_assetManager: AssetManager;
	_moduleManager: ModuleManager;

	/**
	 * 実行待ちのシーン遷移要求。
	 */
	private _sceneChangeRequests: SceneChangeRequest[];

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

		this._eventTriggerMap = {};
		this._eventTriggerMap[EventType.Join] = this.onJoin;
		this._eventTriggerMap[EventType.Leave] = this.onLeave;
		this._eventTriggerMap[EventType.PlayerInfo] = this.onPlayerInfo;
		this._eventTriggerMap[EventType.Seed] = this.onSeed;
		this._eventTriggerMap[EventType.Message] = undefined;
		this._eventTriggerMap[EventType.PointDown] = undefined;
		this._eventTriggerMap[EventType.PointMove] = undefined;
		this._eventTriggerMap[EventType.PointUp] = undefined;
		this._eventTriggerMap[EventType.Operation] = undefined;

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

	// defined in RuntimeGame
	pushScene(scene: Scene): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.Push,
			scene: scene
		});
	}

	// defined in RuntimeGame
	replaceScene(scene: Scene, preserveCurrent?: boolean): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.Replace,
			scene: scene,
			preserveCurrent: preserveCurrent
		});
	}

	// defined in RuntimeGame
	popScene(preserve?: boolean, step: number = 1): void {
		for (let i = 0; i < step; i++) {
			this._sceneChangeRequests.push({ type: SceneChangeType.Pop, preserveCurrent: preserve });
		}
	}

	// defined in RuntimeGame
	scene(): Scene | undefined {
		if (!this.scenes.length) return undefined;
		return this.scenes[this.scenes.length - 1];
	}

	// defined in RuntimeGame
	findPointSource(point: CommonOffset, camera?: Camera): PointSource {
		if (!camera) camera = this.focusingCamera;
		return this.scene().findPointSourceByPoint(point, false, camera);
	}

	// defined in RuntimeGame
	raiseEvent(e: Event): void {
		this.handlerSet.raiseEvent(this._eventConverter.toPlaylogEvent(e));
	}

	// defined in RuntimeGame
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

	// defined in RuntimeGame
	addEventFilter(filter: EventFilter, handleEmpty?: boolean): void {
		this.handlerSet.addEventFilter(filter, handleEmpty);
	}

	// defined in RuntimeGame
	removeEventFilter(filter: EventFilter): void {
		this.handlerSet.removeEventFilter(filter);
	}

	// defined in RuntimeGame
	shouldSaveSnapshot(): boolean {
		return this.handlerSet.shouldSaveSnapshot();
	}

	// defined in RuntimeGame
	saveSnapshot(snapshot: any, timestamp?: number): void {
		this.handlerSet.saveSnapshot(this.age, snapshot, this.random.serialize(), timestamp);
	}

	// defined in RuntimeGame
	getCurrentTime(): number {
		return this.handlerSet.getCurrentTime();
	}

	// defined in RuntimeGame
	isActiveInstance(): boolean {
		return this.handlerSet.getInstanceType() === "active";
	}

	// defined in InternalGame
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

	// defined in InternalGame
	unregister(e: E): void {
		if (e.local) {
			delete this._localDb[e.id];
		} else {
			delete this.db[e.id];
		}
	}

	// defined in InternalGame
	terminateGame(): void {
		this._isTerminated = true;
		this._terminateGame();
	}

	// defined in InternalGame
	modified(): void {
		this._modified = true;
	}

	// defined in InternalGame
	_fireSceneReady(scene: Scene): void {
		this._sceneChangeRequests.push({
			type: SceneChangeType.FireReady,
			scene: scene
		});
	}

	// defined in InternalGame
	_fireSceneLoaded(scene: Scene): void {
		if (scene._loadingState < SceneLoadState.LoadedFired) {
			this._sceneChangeRequests.push({
				type: SceneChangeType.FireLoaded,
				scene: scene
			});
		}
	}

	// defined in InternalGame
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
		this.handlerSet.removeAllEventFilters();

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
		this._sceneChangeRequests = [];
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
		this._sceneChangeRequests = [];
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
			this._flushSceneChangeRequests();
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

		this._eventTriggerMap[EventType.Message] = scene.onMessage;
		this._eventTriggerMap[EventType.PointDown] = scene.onPointDownCapture;
		this._eventTriggerMap[EventType.PointMove] = scene.onPointMoveCapture;
		this._eventTriggerMap[EventType.PointUp] = scene.onPointUpCapture;
		this._eventTriggerMap[EventType.Operation] = scene.onOperation;
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
		const local = scene ? scene.local : LocalTickMode.FullLocal;
		const tickGenerationMode = scene ? scene.tickGenerationMode : TickGenerationMode.ByClock;
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
		if (fireSceneChanged) this._onSceneChange.fire(this.scene());
	}

	private _handleLoad(): void {
		this.operationPluginManager.initialize();
		this.operationPlugins = this.operationPluginManager.plugins;

		const mainFun = this._moduleManager._require(this._main);
		if (!mainFun || typeof mainFun !== "function")
			throw ExceptionFactory.createAssertionError("Game#_handleLoad: Entry point '" + this._main + "' not found.");
		mainFun(this._mainParameter);
		this._flushSceneChangeRequests(); // シーン遷移を要求する可能性がある(というかまずする)
		this._onStart.fire();
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
			this._onSceneChange.fire(scene);
			if (!scene._loaded) {
				scene._load();
				this._fireSceneLoaded(scene);
			}
		}
		this._modified = true;
	}
}
