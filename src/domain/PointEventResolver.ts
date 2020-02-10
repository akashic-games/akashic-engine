import * as pl from "@akashic/playlog";
import { CommonOffset } from "../types/commons";
import { Game } from "../Game";
import { PlatformPointEvent } from "../types/PlatformPointEvent";
import { EventPriority } from "../types/EventPriority";

interface PointEventHolder {
	targetId: number;
	local: boolean;
	point: CommonOffset;
	start: CommonOffset;
	prev: CommonOffset;
	// TODO: タイムスタンプのようなものを入れて一定時間後にクリアする仕組みが必要かもしれない。
	//       pointUpをトリガに解放するので、pointUpを取り逃すとリークする(mapに溜まったままになってしまう)
}

export interface PointEventResolverParameterObject {
	/**
	 * この `PointEventResolver` がエンティティの解決などに用いる `Game` 。
	 */
	game: Game;

	/**
	 * プレイヤーID
	 */
	playerId: string;
}

/**
 * PlatformPointEventからg.Eventへの変換機構。
 *
 * ほぼ座標しか持たないPlatformPointEventに対して、g.Point(Down|Move|Up)Eventはその座標にあるエンティティや、
 * (g.Point(Move|Up)Eventの場合)g.PointDownEventからの座標の差分を持っている。
 * それらの足りない情報を管理・追加して、PlatformPointEventをg.Eventに変換するクラス。
 * Platform実装はpointDown()なしでpointMove()を呼び出してくることも考えられるため、
 * Down -> Move -> Up の流れを保証する機能も持つ。
 */
export class PointEventResolver {
	_game: Game;
	_playerId: string;

	// g.Eと関連した座標データ
	private _pointEventMap: { [key: number]: PointEventHolder } = {};

	constructor(param: PointEventResolverParameterObject) {
		this._game = param.game;
		this._playerId = param.playerId;
	}

	pointDown(e: PlatformPointEvent): pl.PointDownEvent {
		const source = this._game.findPointSource(e.offset);
		const point = source.point ? source.point : e.offset;
		const targetId = source.target ? source.target.id : null;

		this._pointEventMap[e.identifier] = {
			targetId: targetId,
			local: source.local,
			point: point,
			start: { x: e.offset.x, y: e.offset.y },
			prev: { x: e.offset.x, y: e.offset.y }
		};

		// NOTE: 優先度は機械的にJoinedをつけておく。Joinしていない限りPointDownEventなどはリジェクトされる。
		const ret: pl.PointDownEvent = [
			pl.EventCode.PointDown, // 0: イベントコード
			EventPriority.Joined, //   1: 優先度
			this._playerId, //         2: プレイヤーID
			e.identifier, //           3: ポインターID
			point.x, //                4: X座標
			point.y, //                5: Y座標
			targetId //                6?: エンティティID
		];
		if (source.local) ret.push(source.local); // 7?: ローカル
		return ret;
	}

	pointMove(e: PlatformPointEvent): pl.PointMoveEvent {
		const holder = this._pointEventMap[e.identifier];
		if (!holder) return null;
		var prev = { x: 0, y: 0 };
		var start = { x: 0, y: 0 };
		this._pointMoveAndUp(holder, e.offset, prev, start);
		var ret: pl.PointMoveEvent = [
			pl.EventCode.PointMove, // 0: イベントコード
			EventPriority.Joined, //   1: 優先度
			this._playerId, //         2: プレイヤーID
			e.identifier, //           3: ポインターID
			holder.point.x, //         4: X座標
			holder.point.y, //         5: Y座標
			start.x, //                6: ポイントダウンイベントからのX座標の差
			start.y, //                7: ポイントダウンイベントからのY座標の差
			prev.x, //                 8: 直前のポイントムーブイベントからのX座標の差
			prev.y, //                 9: 直前のポイントムーブイベントからのY座標の差
			holder.targetId //         10?: エンティティID
		];
		if (holder.local) ret.push(holder.local); // 11?: ローカル
		return ret;
	}

	pointUp(e: PlatformPointEvent): pl.PointUpEvent {
		const holder = this._pointEventMap[e.identifier];
		if (!holder) return null;
		const prev = { x: 0, y: 0 };
		const start = { x: 0, y: 0 };
		this._pointMoveAndUp(holder, e.offset, prev, start);
		delete this._pointEventMap[e.identifier];
		var ret: pl.PointUpEvent = [
			pl.EventCode.PointUp, // 0: イベントコード
			EventPriority.Joined, // 1: 優先度
			this._playerId, //       2: プレイヤーID
			e.identifier, //         3: ポインターID
			holder.point.x, //       4: X座標
			holder.point.y, //       5: Y座標
			start.x, //              6: ポイントダウンイベントからのX座標の差
			start.y, //              7: ポイントダウンイベントからのY座標の差
			prev.x, //               8: 直前のポイントムーブイベントからのX座標の差
			prev.y, //               9: 直前のポイントムーブイベントからのY座標の差
			holder.targetId //       10?: エンティティID
		];
		if (holder.local) ret.push(holder.local); // 11?: ローカル
		return ret;
	}

	private _pointMoveAndUp(holder: PointEventHolder, offset: CommonOffset, prevDelta: CommonOffset, startDelta: CommonOffset): void {
		startDelta.x = offset.x - holder.start.x;
		startDelta.y = offset.y - holder.start.y;
		prevDelta.x = offset.x - holder.prev.x;
		prevDelta.y = offset.y - holder.prev.y;

		holder.prev.x = offset.x;
		holder.prev.y = offset.y;
	}
}