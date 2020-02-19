import * as pl from "@akashic/playlog";
import { Game, skeletonRuntime } from "./helpers";
import { EventConverter } from "../domain/EventConverter";
import { JoinEvent, MessageEvent, OperationEvent, TimestampEvent, LeaveEvent, PlayerInfoEvent } from "../domain/Event";
import { Player } from "../types/Player";
import { StorageRegion, StorageValueStore } from "../domain/Storage";
import { FilledRect } from "../domain/entities/FilledRect";
import { PointDownEvent, PointMoveEvent, PointUpEvent } from "../domain/entities/E";
import { EventPriority } from "../types/EventPriority";

describe("EventConverter", () => {
	it("can be instantiated", () => {
		const game = new Game({
			width: 320,
			height: 320,
			fps: 30,
			main: ""
		});
		const self = new EventConverter({ game, playerId: "dummyPlayerId" });
		expect(self._game).toBe(game);
		expect(self._playerId).toBe("dummyPlayerId");
		expect(self._playerTable).toEqual({});
	});

	it("encode/decode events", () => {
		const runtime = skeletonRuntime();
		const game = runtime.game;
		const scene = runtime.scene;
		const player: Player = { id: "dummyPlayerId", name: "dummyName" };
		const self = new EventConverter({ game, playerId: player.id });

		const sds = [{ readKey: { region: StorageRegion.Slots, regionKey: "reg-key" }, values: [{ data: 100 }] }];
		const pjoin: pl.JoinEvent = [pl.EventCode.Join, EventPriority.System, player.id, player.name, sds];
		const join = new JoinEvent(player, new StorageValueStore([sds[0].readKey], [sds[0].values]), EventPriority.System);
		const join2 = self.toGameEvent(pjoin);
		expect(join).toEqual(join2);
		expect(() => {
			self.toPlaylogEvent(join2);
		}).toThrow();

		const rect = new FilledRect({
			scene,
			cssColor: "red",
			x: 100,
			y: 100,
			width: 100,
			height: 100,
			touchable: true
		});
		scene.append(rect);

		// エンティティが存在する位置
		const source = game.findPointSource({ x: 110, y: 120 });
		expect(source.target.id).toBeGreaterThan(0);
		expect(source.point).toEqual({ x: 10, y: 20 });

		const pd = new PointDownEvent(1, source.target, source.point, player, false, EventPriority.Joined);
		const pd2 = self.toGameEvent(self.toPlaylogEvent(pd));
		expect(pd).toEqual(pd2);
		const pm = new PointMoveEvent(1, source.target, source.point, { x: 2, y: 3 }, { x: 2, y: 3 }, player, false, EventPriority.Lowest);
		const pm2 = self.toGameEvent(self.toPlaylogEvent(pm));
		expect(pm).toEqual(pm2);
		const pu = new PointUpEvent(1, source.target, source.point, { x: 4, y: 1 }, { x: 6, y: 4 }, player, false, EventPriority.Joined);
		const pu2 = self.toGameEvent(self.toPlaylogEvent(pu));
		expect(pu).toEqual(pu2);

		// エンティティが存在する位置
		const point = { x: 10, y: 10 };
		const nonJoinedPlayer: Player = { id: "nonjoined-dummy-id" };
		const source2 = game.findPointSource(point);
		expect(source2.target).toBe(undefined);
		expect(source2.point).toEqual(undefined);
		expect(source2.local).toEqual(false);
		const lpd = new PointDownEvent(1, source2.target, point, nonJoinedPlayer, false, EventPriority.System);
		const lpd2 = self.toGameEvent(self.toPlaylogEvent(lpd, true));
		expect(lpd).toEqual(lpd2);
		const lpm = new PointMoveEvent(
			1,
			source2.target,
			point,
			{ x: 2, y: 3 },
			{ x: 2, y: 3 },
			nonJoinedPlayer,
			false,
			EventPriority.Unjoined
		);
		const lpm2 = self.toGameEvent(self.toPlaylogEvent(lpm, true));
		expect(lpm).toEqual(lpm2);
		const lpu = new PointUpEvent(1, source2.target, point, { x: 4, y: 1 }, { x: 6, y: 4 }, nonJoinedPlayer, false);
		const lpu2 = self.toGameEvent(self.toPlaylogEvent(lpu, true));
		expect(lpu).toEqual(lpu2);

		const msg = new MessageEvent({ value: "data" }, player, true, EventPriority.Joined);
		const msg2 = self.toGameEvent(self.toPlaylogEvent(msg));
		expect(msg).toEqual(msg2);

		const op = new OperationEvent(42, { value: "op" }, player, false, EventPriority.Joined);
		const op2 = self.toGameEvent(self.toPlaylogEvent(op));
		expect(op).toEqual(op2);

		// Timestamp: Code, Priority, PlayerId, Timestamp
		const timestamp = new TimestampEvent(4201, player, EventPriority.System);
		const timestamp2 = self.toGameEvent(self.toPlaylogEvent(timestamp));
		expect(timestamp).toEqual(timestamp2);

		// Leave: Code, Priority, PlayerId
		const pleave: pl.LeaveEvent = [pl.EventCode.Leave, EventPriority.System, "dummyPlayerId"];
		const leave = new LeaveEvent(player, EventPriority.System);
		const leave2 = self.toGameEvent(pleave);
		expect(leave).toEqual(leave2);
		expect(() => {
			self.toPlaylogEvent(leave2);
		}).toThrow();

		// PlayerInfo: Code, Priority, PlayerId, PlayerName, UserData
		const pPlayerInfo: pl.PlayerInfoEvent = [
			pl.EventCode.PlayerInfo,
			EventPriority.System,
			"dummyPlayerId",
			"dummyName",
			{ userData: "dummy" }
		];
		const playerInfo = new PlayerInfoEvent("dummyPlayerId", "dummyName", { userData: "dummy" }, EventPriority.System);
		const playerInfo2 = self.toGameEvent(pPlayerInfo);
		expect(playerInfo).toEqual(playerInfo2);

		// PlayerInfoEvent 送信後にプレイヤー情報が取得できていることを確認
		const pdown: pl.PointDownEvent = [pl.EventCode.PointDown, EventPriority.System, "dummyPlayerId", 0, 110, 120];
		const pointDown = self.toGameEvent(pdown) as PointDownEvent;
		expect(pointDown.player.id).toBe("dummyPlayerId");
		expect(pointDown.player.name).toBe("dummyName");
		expect(pointDown.player.userData).toEqual({ userData: "dummy" });

		// JoinEvent 送信後にユーザデータが上書きされていないことを確認
		const pjoin2: pl.JoinEvent = [pl.EventCode.Join, EventPriority.System, player.id, player.name, sds];
		self.toGameEvent(pjoin2);
		const pdown2: pl.PointDownEvent = [pl.EventCode.PointDown, EventPriority.System, "dummyPlayerId", 0, 110, 120];
		const pointDown2 = self.toGameEvent(pdown2) as PointDownEvent;
		expect(pointDown2.player.id).toBe("dummyPlayerId");
		expect(pointDown2.player.name).toBe("dummyName");
		expect(pointDown2.player.userData).toEqual({ userData: "dummy" });
	});
});
