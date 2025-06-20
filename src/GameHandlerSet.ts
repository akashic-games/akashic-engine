import type * as pl from "@akashic/playlog";
import type { EventFilter } from "./EventFilter";
import type { LocalTickModeString } from "./LocalTickModeString";
import type { TickGenerationModeString } from "./TickGenerationModeString";

export interface SceneMode {
	local: LocalTickModeString;
	tickGenerationMode: TickGenerationModeString;
}

/**
 * エンジンから呼び出される実装依存処理
 */
export interface GameHandlerSet {
	/**
	 * ティックを発生させる。
	 * @param events そのティックで追加で発生させるイベント
	 */
	raiseTick(events?: pl.Event[]): void;

	/**
	 * イベントを発生させる。
	 *
	 * @param event 発生させるイベント
	 */
	raiseEvent(event: pl.Event): void;

	/**
	 * イベントフィルタを追加する。
	 *
	 * @param func イベントフィルタ
	 * @param handleEmpty イベントが存在しない場合でも定期的にフィルタを呼び出すか否か。省略された場合、偽。
	 */
	addEventFilter(func: EventFilter, handleEmpty?: boolean): void;

	/**
	 * イベントフィルタを削除する
	 * @param func イベントフィルタ
	 */
	removeEventFilter(func: EventFilter): void;

	/**
	 * 全てのイベントフィルタを削除する
	 */
	removeAllEventFilters(): void;

	/**
	 * g.Scene のモード変更を通知する
	 * @param mode
	 */
	changeSceneMode(mode: SceneMode): void;

	/**
	 * このインスタンスにおいてスナップショットの保存を行うべきかを返す。
	 */
	shouldSaveSnapshot(): boolean;

	/**
	 * スナップショットを保存する。
	 *
	 * @param frame スナップショットのフレーム。
	 * @param snapshot 保存するスナップショット。JSONとして妥当な値でなければならない。
	 * @param randGenSer 乱数生成器のシリアリゼーション。
	 * @param nextEntityId 次のエンティティID
	 * @param timestamp 保存時の時刻。 `g.TimestampEvent` を利用するゲームの場合、それらと同じ基準の時間情報を与えなければならない。
	 */
	saveSnapshot(frame: number, snapshot: any, randGenSer: any, nextEntityId: number, timestamp?: number): void;

	/**
	 * ローカルティック生成を中断する。
	 * `isActiveInstance()` が真のインスタンスでは何もしない。
	 *
	 * 中断されたローカルティック生成は、次の契機で再開される。
	 *  * 明示的に `resumeLocalTick()` を呼び出した場合
	 *  * 非ローカルティックを受信した場合
	 *  * ローカルイベントを受信した場合
	 *
	 * 制限事項: 現実装では、次のいずれかの場合、このメソッドでローカルティックを中断させてはならない。
	 *  * シーン遷移時 (`g.game.pushScene()`, `popScene() などの呼び出し時から、遷移先シーンの最初の onUpdate 通知まで)
	 *  * ローディングシーン中
	 *  * `g.Scene#requestAssets()` 呼び出し後、コールバックが呼ばれるまでの間
	 * この制限は将来的に緩和される。
	 */
	suspendLocalTick(): void;

	/**
	 * ローカルティック生成を再開する。
	 * 中断されていない場合は何もしない。
	 */
	resumeLocalTick(): void;

	/**
	 * このインスタンスの種別を取得する
	 */
	getInstanceType(): "active" | "passive";

	/**
	 * 現在時刻を取得する。
	 *
	 * 値は1970-01-01T00:00:00Zからのミリ秒での経過時刻である。
	 * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻である。
	 */
	getCurrentTime(): number;
}
