import type { Event } from "@akashic/playlog";
import type { EventFilterController } from "./EventFilterController";

/**
 * イベントフィルタ。
 *
 * 詳細は `Game#addEventFilter()` のドキュメントを参照。
 */
export type EventFilter = (events: Event[], controller: EventFilterController) => Event[];
