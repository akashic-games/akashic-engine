import * as pl from "@akashic/playlog";
import { LocalTickMode } from "./types/LocalTickMode";
import { TickGenerationMode } from "./types/TickGenerationMode";

export interface SceneMode {
	local: LocalTickMode;
	tickGenerationMode: TickGenerationMode;
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
	addEventFilter(func: (pevs: pl.Event[]) => pl.Event[], handleEmpty?: boolean): void;

	/**
	 * イベントフィルタを削除する
	 * @param func イベントフィルタ
	 */
	removeEventFilter(func: (pevs: pl.Event[]) => pl.Event[]): void;

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
	 * @param timestamp 保存時の時刻。 `g.TimestampEvent` を利用するゲームの場合、それらと同じ基準の時間情報を与えなければならない。
	 */
	saveSnapshot(frame: number, snapshot: any, randGenSer: any, timestamp?: number): void;

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
