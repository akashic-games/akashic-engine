import type { CommonOffset } from "@akashic/pdi-types";
import * as pl from "@akashic/playlog";
import type { E } from "./entities/E";
import { PointDownEvent, PointMoveEvent, PointUpEvent } from "./entities/E";
import type { Event } from "./Event";
import { JoinEvent, LeaveEvent, MessageEvent, OperationEvent, PlayerInfoEvent, TimestampEvent } from "./Event";
import { EventIndex } from "./EventIndex";
import { ExceptionFactory } from "./ExceptionFactory";
import type { InternalOperationPluginOperation } from "./OperationPluginOperation";
import type { Player } from "./Player";
import type { WeakRefKVS } from "./WeakRefKVS";

// TODO: Game を意識しないインターフェース を検討する
export interface EventConverterParameterObjectGameLike {
	db: WeakRefKVS<E>;
	_localDb: WeakRefKVS<E>;
	_decodeOperationPluginOperation: (code: number, op: (number | string)[]) => any;
}

export interface EventConverterParameterObject {
	game: EventConverterParameterObjectGameLike;
	playerId?: string;
}

/**
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 * @ignore
 */
export class EventConverter {
	_game: EventConverterParameterObjectGameLike;
	_playerId: string | null;
	_playerTable: { [key: string]: Player };

	constructor(param: EventConverterParameterObject) {
		this._game = param.game;
		this._playerId = param.playerId ?? null;
		this._playerTable = {};
	}

	/**
	 * playlog.Eventからg.Eventへ変換する。
	 */
	toGameEvent(pev: pl.Event): Event {
		let pointerId: number;
		let entityId: number;
		let target: E | undefined;
		let point: CommonOffset;
		let startDelta: CommonOffset;
		let prevDelta: CommonOffset;
		let local: boolean;
		let timestamp: number;
		let button: number;

		const eventCode = pev[EventIndex.General.Code];
		const prio = pev[EventIndex.General.EventFlags];
		const playerId = pev[EventIndex.General.PlayerId];
		// @ts-ignore
		let player = this._playerTable[playerId] || { id: playerId };
		switch (eventCode) {
			case pl.EventCode.Join:
				player = {
					id: playerId,
					name: pev[EventIndex.Join.PlayerName]
				};
				// @ts-ignore
				if (this._playerTable[playerId] && this._playerTable[playerId].userData != null) {
					// @ts-ignore
					player.userData = this._playerTable[playerId].userData;
				}
				// @ts-ignore
				this._playerTable[playerId] = player;

				return new JoinEvent(player, prio);

			case pl.EventCode.Leave:
				delete this._playerTable[player.id];
				return new LeaveEvent(player, prio);

			case pl.EventCode.Timestamp:
				timestamp = pev[EventIndex.Timestamp.Timestamp];
				return new TimestampEvent(timestamp, player, prio);

			case pl.EventCode.PlayerInfo:
				const playerName = pev[EventIndex.PlayerInfo.PlayerName];
				const userData: any = pev[EventIndex.PlayerInfo.UserData];
				player = {
					id: playerId,
					name: playerName,
					userData
				};
				// @ts-ignore
				this._playerTable[playerId] = player;
				return new PlayerInfoEvent(player, prio);

			case pl.EventCode.Message:
				local = pev[EventIndex.Message.Local];
				return new MessageEvent(pev[EventIndex.Message.Message], player, local, prio);

			case pl.EventCode.PointDown:
				local = pev[EventIndex.PointDown.Local];
				pointerId = pev[EventIndex.PointDown.PointerId];
				entityId = pev[EventIndex.PointDown.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
				point = {
					x: pev[EventIndex.PointDown.X],
					y: pev[EventIndex.PointDown.Y]
				};
				button = pev[EventIndex.PointDown.Button];
				return new PointDownEvent(pointerId, target, point, player, local, prio, button);

			case pl.EventCode.PointMove:
				local = pev[EventIndex.PointMove.Local];
				pointerId = pev[EventIndex.PointMove.PointerId];
				entityId = pev[EventIndex.PointMove.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
				point = {
					x: pev[EventIndex.PointMove.X],
					y: pev[EventIndex.PointMove.Y]
				};
				startDelta = {
					x: pev[EventIndex.PointMove.StartDeltaX],
					y: pev[EventIndex.PointMove.StartDeltaY]
				};
				prevDelta = {
					x: pev[EventIndex.PointMove.PrevDeltaX],
					y: pev[EventIndex.PointMove.PrevDeltaY]
				};
				button = pev[EventIndex.PointMove.Button];
				return new PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio, button);

			case pl.EventCode.PointUp:
				local = pev[EventIndex.PointUp.Local];
				pointerId = pev[EventIndex.PointUp.PointerId];
				entityId = pev[EventIndex.PointUp.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
				point = {
					x: pev[EventIndex.PointUp.X],
					y: pev[EventIndex.PointUp.Y]
				};
				startDelta = {
					x: pev[EventIndex.PointUp.StartDeltaX],
					y: pev[EventIndex.PointUp.StartDeltaY]
				};
				prevDelta = {
					x: pev[EventIndex.PointUp.PrevDeltaX],
					y: pev[EventIndex.PointUp.PrevDeltaY]
				};
				button = pev[EventIndex.PointUp.Button];
				return new PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio, button);

			case pl.EventCode.Operation:
				local = pev[EventIndex.Operation.Local];
				const operationCode = pev[EventIndex.Operation.OperationCode];
				const operationData = pev[EventIndex.Operation.OperationData];
				const decodedData = this._game._decodeOperationPluginOperation(operationCode, operationData);
				return new OperationEvent(operationCode, decodedData, player, local, prio);

			default:
				// TODO handle error
				throw ExceptionFactory.createAssertionError("EventConverter#toGameEvent");
		}
	}

	/**
	 * g.Eventからplaylog.Eventに変換する。
	 */
	toPlaylogEvent(e: Event, preservePlayer?: boolean): pl.Event {
		let targetId: number | null;
		let playerId: string | null;
		switch (e.type) {
			case "join":
			case "leave":
				// akashic-engine は決して Join と Leave を生成しない
				throw ExceptionFactory.createAssertionError("EventConverter#toPlaylogEvent: Invalid type: " + e.type);
			case "timestamp":
				const ts = e as TimestampEvent;
				playerId = preservePlayer ? ts.player.id ?? null : this._playerId;
				return [
					pl.EventCode.Timestamp, // 0: イベントコード
					ts.eventFlags, //          1: イベントフラグ値
					playerId, //               2: プレイヤーID
					ts.timestamp //            3: タイムスタンプ
				];
			case "player-info":
				const playerInfo = e as PlayerInfoEvent;
				playerId = preservePlayer ? playerInfo.player.id ?? null : this._playerId;
				return [
					pl.EventCode.PlayerInfo, //   0: イベントコード
					playerInfo.eventFlags, //     1: イベントフラグ値
					playerId, //                  2: プレイヤーID
					playerInfo.player.name, //    3: プレイヤー名
					playerInfo.player.userData // 4: ユーザデータ
				];
			case "point-down":
				const pointDown = e as PointDownEvent;
				targetId = pointDown.target ? pointDown.target.id : null;
				playerId = preservePlayer && pointDown.player ? pointDown.player.id ?? null : this._playerId;
				return [
					pl.EventCode.PointDown, // 0: イベントコード
					pointDown.eventFlags, //   1: イベントフラグ値
					playerId, //               2: プレイヤーID
					pointDown.pointerId, //    3: ポインターID
					pointDown.point.x, //      4: X座標
					pointDown.point.y, //      5: Y座標
					targetId, //               6?: エンティティID
					pointDown.button, //       7?: ボタンの種類
					!!pointDown.local //       8?: ローカルイベントかどうか
				];
			case "point-move":
				const pointMove = e as PointMoveEvent;
				targetId = pointMove.target ? pointMove.target.id : null;
				playerId = preservePlayer && pointMove.player ? pointMove.player.id ?? null : this._playerId;
				return [
					pl.EventCode.PointMove, // 0: イベントコード
					pointMove.eventFlags, //   1: イベントフラグ値
					playerId, //               2: プレイヤーID
					pointMove.pointerId, //    3: ポインターID
					pointMove.point.x, //      4: X座標
					pointMove.point.y, //      5: Y座標
					pointMove.startDelta.x, // 6: ポイントダウンイベントからのX座標の差
					pointMove.startDelta.y, // 7: ポイントダウンイベントからのY座標の差
					pointMove.prevDelta.x, //  8: 直前のポイントムーブイベントからのX座標の差
					pointMove.prevDelta.y, //  9: 直前のポイントムーブイベントからのY座標の差
					targetId, //               10?: エンティティID
					pointMove.button, //       11?:
					!!pointMove.local //       12?: ローカルイベントかどうか
				];
			case "point-up":
				const pointUp = e as PointUpEvent;
				targetId = pointUp.target ? pointUp.target.id : null;
				playerId = preservePlayer && pointUp.player ? pointUp.player.id ?? null : this._playerId;
				return [
					pl.EventCode.PointUp, // 0: イベントコード
					pointUp.eventFlags, //   1: イベントフラグ値
					playerId, //             2: プレイヤーID
					pointUp.pointerId, //    3: ポインターID
					pointUp.point.x, //      4: X座標
					pointUp.point.y, //      5: Y座標
					pointUp.startDelta.x, // 6: ポイントダウンイベントからのX座標の差
					pointUp.startDelta.y, // 7: ポイントダウンイベントからのY座標の差
					pointUp.prevDelta.x, //  8: 直前のポイントムーブイベントからのX座標の差
					pointUp.prevDelta.y, //  9: 直前のポイントムーブイベントからのY座標の差
					targetId, //             10?: エンティティID
					pointUp.button, //       11?:
					!!pointUp.local //       12?: ローカルイベントかどうか
				];
			case "message":
				const message = e as MessageEvent;
				playerId = preservePlayer && message.player ? message.player.id ?? null : this._playerId;
				return [
					pl.EventCode.Message, // 0: イベントコード
					message.eventFlags, //   1: イベントフラグ値
					playerId, //             2: プレイヤーID
					message.data, //         3: 汎用的なデータ
					!!message.local //       4?: ローカル
				];
			case "operation":
				const op = e as OperationEvent;
				playerId = preservePlayer && op.player ? op.player.id ?? null : this._playerId;
				return [
					pl.EventCode.Operation, // 0: イベントコード
					op.eventFlags, //          1: イベントフラグ値
					playerId, //               2: プレイヤーID
					op.code, //                3: 操作プラグインコード
					op.data, //                4: 操作プラグインデータ
					!!op.local //              5?: ローカル
				];
			default:
				throw ExceptionFactory.createAssertionError("Unknown type: " + e.type);
		}
	}

	makePlaylogOperationEvent(op: InternalOperationPluginOperation): pl.Event {
		const playerId = this._playerId;
		const eventFlags = op.priority != null ? op.priority & pl.EventFlagsMask.Priority : 0;
		return [
			pl.EventCode.Operation, // 0: イベントコード
			eventFlags, //             1: イベントフラグ値
			playerId, //               2: プレイヤーID
			op._code, //               3: 操作プラグインコード
			op.data, //                4: 操作プラグインデータ
			!!op.local //              5: ローカル
		];
	}
}
