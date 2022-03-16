import type { Event } from "@akashic/playlog";

/**
 * イベントフィルタ内で利用可能なコントローラ。
 */
export interface EventFilterController {
	/**
	 * 引数に指定したイベントを次のイベントフィルタの呼び出し時に処理する。
	 * @param pev イベント
	 */
	processNext(pev: Event): void;
}
