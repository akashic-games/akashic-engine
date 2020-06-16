import { Event } from "@akashic/playlog";

/**
 * イベントフィルタ。
 *
 * 詳細は `Game#addEventFilter()` のドキュメントを参照。
 */
export type EventFilter = (events: Event[]) => Event[];
