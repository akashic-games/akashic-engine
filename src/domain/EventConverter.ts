import * as pl from "@akashic/playlog";
import { ExceptionFactory } from "../commons/ExceptionFactory";
import { CommonOffset } from "../pdi-types/commons";
import { EventIndex } from "../types/EventIndex";
import { InternalOperationPluginOperation } from "../types/OperationPluginOperation";
import { Player } from "../types/Player";
import { E, PointDownEvent, PointMoveEvent, PointUpEvent } from "./entities/E";
import { Event, JoinEvent, LeaveEvent, MessageEvent, OperationEvent, PlayerInfoEvent, TimestampEvent } from "./Event";
import { StorageValueStore } from "./Storage";

// TODO: Game を意識しないインターフェース を検討する
interface EventConverterParameterObejctGameLike {
	db: { [idx: number]: E };
	_localDb: { [id: number]: E };
	_decodeOperationPluginOperation: (code: number, op: (number | string)[]) => any;
}

export interface EventConverterParameterObejct {
	game: EventConverterParameterObejctGameLike;
	playerId: string;
}

/**
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class EventConverter {
	_game: EventConverterParameterObejctGameLike;
	_playerId: string;
	_playerTable: { [key: string]: Player };

	constructor(param: EventConverterParameterObejct) {
		this._game = param.game;
		this._playerId = param.playerId;
		this._playerTable = {};
	}

	/**
	 * playlog.Eventからg.Eventへ変換する。
	 */
	toGameEvent(pev: pl.Event): Event {
		let pointerId: number;
		let entityId: number;
		let target: E;
		let point: CommonOffset;
		let startDelta: CommonOffset;
		let prevDelta: CommonOffset;
		let local: boolean;
		let timestamp: number;

		const eventCode = pev[EventIndex.General.Code];
		const prio = pev[EventIndex.General.Priority];
		const playerId = pev[EventIndex.General.PlayerId];
		let player = this._playerTable[playerId] || { id: playerId };
		switch (eventCode) {
			case pl.EventCode.Join:
				player = {
					id: playerId,
					name: pev[EventIndex.Join.PlayerName]
				};
				if (this._playerTable[playerId] && this._playerTable[playerId].userData != null) {
					player.userData = this._playerTable[playerId].userData;
				}
				this._playerTable[playerId] = player;

				let store: StorageValueStore = undefined;
				if (pev[EventIndex.Join.StorageData]) {
					let keys: pl.StorageReadKey[] = [];
					let values: pl.StorageValue[][] = [];
					pev[EventIndex.Join.StorageData].map((data: pl.StorageData) => {
						keys.push(data.readKey);
						values.push(data.values);
					});
					store = new StorageValueStore(keys, values);
				}
				return new JoinEvent(player, store, prio);

			case pl.EventCode.Leave:
				delete this._playerTable[player.id];
				return new LeaveEvent(player, prio);

			case pl.EventCode.Timestamp:
				timestamp = pev[EventIndex.Timestamp.Timestamp];
				return new TimestampEvent(timestamp, player, prio);

			case pl.EventCode.PlayerInfo:
				let playerName = pev[EventIndex.PlayerInfo.PlayerName];
				let userData: any = pev[EventIndex.PlayerInfo.UserData];
				this._playerTable[playerId] = {
					id: playerId,
					name: playerName,
					userData
				};
				return new PlayerInfoEvent(playerId, playerName, userData, prio);

			case pl.EventCode.Message:
				local = pev[EventIndex.Message.Local];
				return new MessageEvent(pev[EventIndex.Message.Message], player, local, prio);

			case pl.EventCode.PointDown:
				local = pev[EventIndex.PointDown.Local];
				pointerId = pev[EventIndex.PointDown.PointerId];
				entityId = pev[EventIndex.PointDown.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db[entityId] : this._game._localDb[entityId];
				point = {
					x: pev[EventIndex.PointDown.X],
					y: pev[EventIndex.PointDown.Y]
				};
				return new PointDownEvent(pointerId, target, point, player, local, prio);

			case pl.EventCode.PointMove:
				local = pev[EventIndex.PointMove.Local];
				pointerId = pev[EventIndex.PointMove.PointerId];
				entityId = pev[EventIndex.PointMove.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db[entityId] : this._game._localDb[entityId];
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
				return new PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio);

			case pl.EventCode.PointUp:
				local = pev[EventIndex.PointUp.Local];
				pointerId = pev[EventIndex.PointUp.PointerId];
				entityId = pev[EventIndex.PointUp.EntityId];
				target = entityId == null ? undefined : entityId >= 0 ? this._game.db[entityId] : this._game._localDb[entityId];
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
				return new PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio);

			case pl.EventCode.Operation:
				local = pev[EventIndex.Operation.Local];
				let operationCode = pev[EventIndex.Operation.OperationCode];
				let operationData = pev[EventIndex.Operation.OperationData];
				let decodedData = this._game._decodeOperationPluginOperation(operationCode, operationData);
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
		let targetId: number;
		let playerId: string;
		switch (e.type) {
			case "join":
			case "leave":
				// akashic-engine は決して Join と Leave を生成しない
				throw ExceptionFactory.createAssertionError("EventConverter#toPlaylogEvent: Invalid type: " + e.type);
			case "timestamp":
				let ts = <TimestampEvent>e;
				playerId = preservePlayer ? ts.player.id : this._playerId;
				return [
					pl.EventCode.Timestamp, // 0: イベントコード
					ts.priority, //            1: 優先度
					playerId, //               2: プレイヤーID
					ts.timestamp //            3: タイムスタンプ
				];
			case "player-info":
				let playerInfo = <PlayerInfoEvent>e;
				playerId = preservePlayer ? playerInfo.playerId : this._playerId;
				return [
					pl.EventCode.PlayerInfo, // 0: イベントコード
					playerInfo.priority, //     1: 優先度
					playerId, //                2: プレイヤーID
					playerInfo.playerName, //   3: プレイヤー名
					playerInfo.userData //      4: ユーザデータ
				];
			case "point-down":
				let pointDown = <PointDownEvent>e;
				targetId = pointDown.target ? pointDown.target.id : null;
				playerId = preservePlayer ? pointDown.player.id : this._playerId;
				return [
					pl.EventCode.PointDown, // 0: イベントコード
					pointDown.priority, //     1: 優先度
					playerId, //               2: プレイヤーID
					pointDown.pointerId, //    3: ポインターID
					pointDown.point.x, //      4: X座標
					pointDown.point.y, //      5: Y座標
					targetId, //               6?: エンティティID
					!!pointDown.local //       7?: 直前のポイントムーブイベントからのY座標の差
				];
			case "point-move":
				let pointMove = <PointMoveEvent>e;
				targetId = pointMove.target ? pointMove.target.id : null;
				playerId = preservePlayer ? pointMove.player.id : this._playerId;
				return [
					pl.EventCode.PointMove, // 0: イベントコード
					pointMove.priority, //     1: 優先度
					playerId, //               2: プレイヤーID
					pointMove.pointerId, //    3: ポインターID
					pointMove.point.x, //      4: X座標
					pointMove.point.y, //      5: Y座標
					pointMove.startDelta.x, // 6: ポイントダウンイベントからのX座標の差
					pointMove.startDelta.y, // 7: ポイントダウンイベントからのY座標の差
					pointMove.prevDelta.x, //  8: 直前のポイントムーブイベントからのX座標の差
					pointMove.prevDelta.y, //  9: 直前のポイントムーブイベントからのY座標の差
					targetId, //               10?: エンティティID
					!!pointMove.local //       11?: 直前のポイントムーブイベントからのY座標の差
				];
			case "point-up":
				let pointUp = <PointUpEvent>e;
				targetId = pointUp.target ? pointUp.target.id : null;
				playerId = preservePlayer ? pointUp.player.id : this._playerId;
				return [
					pl.EventCode.PointUp, // 0: イベントコード
					pointUp.priority, //     1: 優先度
					playerId, //             2: プレイヤーID
					pointUp.pointerId, //    3: ポインターID
					pointUp.point.x, //      4: X座標
					pointUp.point.y, //      5: Y座標
					pointUp.startDelta.x, // 6: ポイントダウンイベントからのX座標の差
					pointUp.startDelta.y, // 7: ポイントダウンイベントからのY座標の差
					pointUp.prevDelta.x, //  8: 直前のポイントムーブイベントからのX座標の差
					pointUp.prevDelta.y, //  9: 直前のポイントムーブイベントからのY座標の差
					targetId, //             10?: エンティティID
					!!pointUp.local //       11?: 直前のポイントムーブイベントからのY座標の差
				];
			case "message":
				let message = <MessageEvent>e;
				playerId = preservePlayer ? message.player.id : this._playerId;
				return [
					pl.EventCode.Message, // 0: イベントコード
					message.priority, //     1: 優先度
					playerId, //             2: プレイヤーID
					message.data, //         3: 汎用的なデータ
					!!message.local //       4?: ローカル
				];
			case "operation":
				let op = <OperationEvent>e;
				playerId = preservePlayer ? op.player.id : this._playerId;
				return [
					pl.EventCode.Operation, // 0: イベントコード
					op.priority, //            1: 優先度
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
		let playerId = this._playerId;
		let priority = op.priority != null ? op.priority : 0;
		return [
			pl.EventCode.Operation, // 0: イベントコード
			priority, //               1: 優先度
			playerId, //               2: プレイヤーID
			op._code, //               3: 操作プラグインコード
			op.data, //                4: 操作プラグインデータ
			!!op.local //              5: ローカル
		];
	}
}
