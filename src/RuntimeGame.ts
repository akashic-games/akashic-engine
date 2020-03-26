import { Trigger } from "@akashic/trigger";
import { AudioSystemManager } from "./domain/AudioSystemManager";
import { Camera } from "./domain/Camera";
import { PointSource } from "./domain/entities/E";
import { Event, JoinEvent, LeaveEvent, PlayerInfoEvent, SeedEvent } from "./domain/Event";
import { LoadingScene } from "./domain/LoadingScene";
import { OperationPluginManager } from "./domain/OperationPluginManager";
import { RandomGenerator } from "./domain/RandomGenerator";
import { Storage } from "./domain/Storage";
import { AssetLike } from "./interfaces/AssetLike";
import { ResourceFactoryLike } from "./interfaces/ResourceFactoryLike";
import { SurfaceAtlasSetLike } from "./interfaces/SurfaceAtlasSetLike";
import { Scene } from "./Scene";
import { CommonOffset, CommonSize } from "./types/commons";
import { EventFilter } from "./types/EventFilter";
import { LocalTickMode } from "./types/LocalTickMode";
import { OperationPlugin } from "./types/OperationPlugin";
import { TickGenerationMode } from "./types/TickGenerationMode";

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
export interface RuntimeGame {
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
	 * アセットのロード中に表示するシーン。
	 * ゲーム開発者はこの値を書き換えることでローディングシーンを変更してよい。
	 */
	loadingScene: LoadingScene;

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
	 * この `Game` が用いる、リソースのファクトリ
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
	lastLocalTickMode: LocalTickMode | null;

	/**
	 * 直近の `Scene#tickGenerationMode` の値。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	lastTickGenerationMode: TickGenerationMode | null;

	/**
	 * ゲーム全体で共有するサーフェスアトラス。
	 */
	surfaceAtlasSet: SurfaceAtlasSetLike;

	/**
	 * 操作プラグインの管理者。
	 */
	operationPluginManager: OperationPluginManager;

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
	 * 使用中のカメラ。
	 *
	 * `Game#draw()`, `Game#findPointSource()` のデフォルト値として使用される。
	 * この値を変更した場合、変更を描画に反映するためには `Game#modified()` を呼び出す必要がある。
	 */
	focusingCamera: Camera;

	/**
	 * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
	 *
	 * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
	 * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
	 * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `SceneState.Deactive` でfireされる。
	 * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
	 * @param scene 遷移後のシーン
	 */
	pushScene(scene: Scene): void;

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
	replaceScene(scene: Scene, preserveCurrent?: boolean): void;

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
	popScene(preserve?: boolean, step?: number): void;

	/**
	 * 現在のシーンを返す。
	 * ない場合、 `undefined` を返す。
	 */
	scene(): Scene | undefined;

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
	findPointSource(point: CommonOffset, camera?: Camera): PointSource;

	/**
	 * イベントを発生させる。
	 *
	 * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに指定のイベントを発生させることができる。
	 *
	 * @param e 発生させるイベント
	 */
	raiseEvent(e: Event): void;

	/**
	 * ティックを発生させる。
	 *
	 * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに時間経過を要求することができる。
	 * 現在のシーンのティック生成モード `Scene#tickGenerationMode` が `TickGenerationMode.Manual` でない場合、エラー。
	 *
	 * @param events そのティックで追加で発生させるイベント
	 */
	raiseTick(events?: Event[]): void;

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
	addEventFilter(filter: EventFilter, handleEmpty?: boolean): void;

	/**
	 * イベントフィルタを削除する。
	 *
	 * @param filter 削除するイベントフィルタ
	 */
	removeEventFilter(filter: EventFilter): void;

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
	shouldSaveSnapshot(): boolean;

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
	saveSnapshot(snapshot: any, timestamp?: number): void;

	/**
	 * 現在時刻を取得する。
	 *
	 * 値は1970-01-01T00:00:00Zからのミリ秒での経過時刻である。
	 * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻である。
	 */
	getCurrentTime(): number;

	/**
	 * このインスタンスがアクティブインスタンスであるかどうか返す。
	 *
	 * ゲーム開発者は、この値の真偽に起因する処理で、ゲームのローカルな実行状態を変更してはならず、
	 * `raiseEvent()` などによって、グローバルな状態を更新する必要がある。
	 */
	isActiveInstance(): boolean;
}
