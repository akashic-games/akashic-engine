import { PlatformButtonType, PlatformPointType } from "@akashic/pdi-types";
import * as pl from "@akashic/playlog";
import { FilledRect } from "../entities/FilledRect";
import { EventPriority } from "../EventPriority";
import { PointEventResolver } from "../PointEventResolver";
import { expectToBeDefined, skeletonRuntime } from "./helpers";

describe("PointEventResolver", () => {
	it("can be instantiated", () => {
		const game = skeletonRuntime().game;
		// @ts-ignore
		const resolver = new PointEventResolver({ sourceResolver: game, playerId: game.selfId });
		expect(resolver._sourceResolver).toBe(game);
		expect(resolver._playerId).toBe(game.selfId);
	});

	it("makes PointDownEvent for pointDown()", () => {
		const runtime = skeletonRuntime();
		const game = runtime.game;
		const scene = runtime.scene;
		const playerId = "dummyPlayerId";
		const resolver = new PointEventResolver({ sourceResolver: game, playerId });

		const rect1 = new FilledRect({
			scene,
			cssColor: "red",
			x: 100,
			y: 100,
			width: 50,
			height: 50,
			touchable: true
		});
		scene.append(rect1);
		const rect2 = new FilledRect({
			scene,
			cssColor: "blue",
			x: 130,
			y: 130,
			width: 50,
			height: 50,
			touchable: true,
			local: true
		});
		scene.append(rect2);

		let e: pl.PointDownEvent | null;
		// (10, 20) の位置 (何もない)
		e = resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 10, y: 20 },
			button: PlatformButtonType.Primary
		});
		expectToBeDefined(e);
		expect(e.length).toBe(8);
		expect(e[0]).toBe(pl.EventCode.PointDown); // 0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //   1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //        2: プレイヤーID
		expect(e[3]).toBe(0); //                      3: ポインターID
		expect(e[4]).toBe(10); //                     4: X座標
		expect(e[5]).toBe(20); //                     5: Y座標
		expect(e[6]).toBeUndefined(); //              6?: エンティティID
		expect(e[7]).toBe(0); //                      7?: ボタンの種類

		// (110, 110) の位置 (50x50の赤いFilledRectが(100, 100)にある)
		e = resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 110, y: 110 },
			button: PlatformButtonType.Primary
		});
		expectToBeDefined(e);
		expect(e.length).toBe(8);
		expect(e[0]).toBe(pl.EventCode.PointDown); // 0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //   1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //        2: プレイヤーID
		expect(e[3]).toBe(0); //                      3: ポインターID
		expect(e[4]).toBe(10); //                     4: X座標
		expect(e[5]).toBe(10); //                     5: Y座標
		expect(e[6]).toBeGreaterThan(0); //           6?: エンティティID
		expect(e[7]).toBe(0); //                      7?: ボタンの種類

		// (110, 110) を PlatformButtonType.Secondary でタッチ
		e = resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 110, y: 110 },
			button: PlatformButtonType.Secondary
		});
		expectToBeDefined(e);
		expect(e.length).toBe(8);
		expect(e[0]).toBe(pl.EventCode.PointDown); // 0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //   1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //        2: プレイヤーID
		expect(e[3]).toBe(0); //                      3: ポインターID
		expect(e[4]).toBe(10); //                     4: X座標
		expect(e[5]).toBe(10); //                     5: Y座標
		expect(e[6]).toBeGreaterThan(0); //           6?: エンティティID
		expect(e[7]).toBe(2); //                      7?: ボタンの種類

		// (150, 150) の位置 (50x50の青いlocalのFilledRectが(130, 130)にある)
		e = resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 150, y: 150 },
			button: PlatformButtonType.Primary
		});
		expectToBeDefined(e);
		expect(e.length).toBe(9);
		expect(e[0]).toBe(pl.EventCode.PointDown); // 0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); // 1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //        2: プレイヤーID
		expect(e[3]).toBe(0); //                      3: ポインターID
		expect(e[4]).toBe(20); //                     4: X座標
		expect(e[5]).toBe(20); //                     5: Y座標
		expect(e[6]! < 0).toBe(true); //              6?: エンティティID
		expect(e[7]).toBe(0); //                      7?: ボタンの種類
		expect(e[8]).toBe(true); //                   8?: ローカル
	});

	it("makes Point(Move|Up)Event for pointDown()/pointUp()", () => {
		const runtime = skeletonRuntime();
		const game = runtime.game;
		const scene = runtime.scene;
		const playerId = "dummyPlayerId";
		const resolver = new PointEventResolver({ sourceResolver: game, playerId });

		const rect1 = new FilledRect({
			scene,
			cssColor: "red",
			x: 100,
			y: 100,
			width: 50,
			height: 50,
			touchable: true
		});
		scene.append(rect1);
		const rect2 = new FilledRect({
			scene,
			cssColor: "blue",
			x: 130,
			y: 130,
			width: 50,
			height: 50,
			touchable: true,
			local: true
		});
		scene.append(rect2);

		let e: pl.PointDownEvent | pl.PointMoveEvent | pl.PointUpEvent;
		// (10, 20) の位置 (何もない)
		resolver.pointDown({ type: PlatformPointType.Down, identifier: 0, offset: { x: 10, y: 20 }, button: PlatformButtonType.Primary });
		e = resolver.pointMove({
			type: PlatformPointType.Move,
			identifier: 0,
			offset: { x: 20, y: 25 },
			button: PlatformButtonType.Unchanged
		})!;
		expect(e.length).toBe(12);
		expect(e[0]).toBe(pl.EventCode.PointMove); //        0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //          1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //               2: プレイヤーID
		expect(e[3]).toBe(0); //                             3: ポインターID
		expect(e[4]).toBe(10); //                            4: X座標
		expect(e[5]).toBe(20); //                            5: Y座標
		expect(e[6]).toBe(10); //                            6: ポイントダウンイベントからのX座標の差
		expect(e[7]).toBe(5); //                             7: ポイントダウンイベントからのY座標の差
		expect(e[8]).toBe(10); //                            8: 直前のポイントムーブイベントからのX座標の差
		expect(e[9]).toBe(5); //                             9: 直前のポイントムーブイベントからのY座標の差
		expect(e[10]).toBeUndefined(); //                    10?: エンティティID
		expect(e[11]).toBe(PlatformButtonType.Unchanged); // 11?: ボタンの種類
		e = resolver.pointUp({
			type: PlatformPointType.Up,
			identifier: 0,
			offset: { x: 22, y: 23 },
			button: PlatformButtonType.Secondary
		})!;
		expect(e.length).toBe(12);
		expect(e[0]).toBe(pl.EventCode.PointUp); //          0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //          1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //               2: プレイヤーID
		expect(e[3]).toBe(0); //                             3: ポインターID
		expect(e[4]).toBe(10); //                            4: X座標
		expect(e[5]).toBe(20); //                            5: Y座標
		expect(e[6]).toBe(12); //                            6: ポイントダウンイベントからのX座標の差
		expect(e[7]).toBe(3); //                             7: ポイントダウンイベントからのY座標の差
		expect(e[8]).toBe(2); //                             8: 直前のポイントムーブイベントからのX座標の差
		expect(e[9]).toBe(-2); //                            9: 直前のポイントムーブイベントからのY座標の差
		expect(e[10]).toBeUndefined(); //                    10?: エンティティID
		expect(e[11]).toBe(PlatformButtonType.Secondary); // 11?: ボタンの種類

		// (110, 110) の位置 (50x50の赤いFilledRectが(100, 100)にある)
		resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 110, y: 110 },
			button: PlatformButtonType.Secondary
		});
		e = resolver.pointMove({
			type: PlatformPointType.Move,
			identifier: 0,
			offset: { x: 130, y: 115 },
			button: PlatformButtonType.Primary
		})!;
		expect(e.length).toBe(12);
		expect(e[0]).toBe(pl.EventCode.PointMove); //      0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //        1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //             2: プレイヤーID
		expect(e[3]).toBe(0); //                           3: ポインターID
		expect(e[4]).toBe(10); //                          4: X座標
		expect(e[5]).toBe(10); //                          5: Y座標
		expect(e[6]).toBe(20); //                          6: ポイントダウンイベントからのX座標の差
		expect(e[7]).toBe(5); //                           7: ポイントダウンイベントからのY座標の差
		expect(e[8]).toBe(20); //                          8: 直前のポイントムーブイベントからのX座標の差
		expect(e[9]).toBe(5); //                           9: 直前のポイントムーブイベントからのY座標の差
		expect(e[10]).toBeGreaterThan(0); //               10?: エンティティID
		expect(e[11]).toBe(PlatformButtonType.Primary); // 11?: ボタンの種類
		e = resolver.pointUp({
			type: PlatformPointType.Up,
			identifier: 0,
			offset: { x: 127, y: 100 },
			button: PlatformButtonType.Auxiliary
		})!;
		expect(e.length).toBe(12);
		expect(e[0]).toBe(pl.EventCode.PointUp); //          0: イベントコード
		expect(e[1]).toBe(EventPriority.Joined); //          1: 優先度
		expect(e[2]).toBe("dummyPlayerId"); //               2: プレイヤーID
		expect(e[3]).toBe(0); //                             3: ポインターID
		expect(e[4]).toBe(10); //                            4: X座標
		expect(e[5]).toBe(10); //                            5: Y座標
		expect(e[6]).toBe(17); //                            6: ポイントダウンイベントからのX座標の差
		expect(e[7]).toBe(-10); //                           7: ポイントダウンイベントからのY座標の差
		expect(e[8]).toBe(-3); //                            8: 直前のポイントムーブイベントからのX座標の差
		expect(e[9]).toBe(-15); //                           9: 直前のポイントムーブイベントからのY座標の差
		expect(e[10]).toBeGreaterThan(0); //                 10?: エンティティID
		expect(e[11]).toBe(PlatformButtonType.Auxiliary); // 11?: ボタンの種類
	});

	it("ignores 'move'/'up' not following to 'down'", () => {
		const runtime = skeletonRuntime();
		const game = runtime.game;
		const playerId = "dummyPlayerId";
		const resolver = new PointEventResolver({ sourceResolver: game, playerId });

		resolver.pointDown({
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 10, y: 20 },
			button: PlatformButtonType.Primary
		});

		expect(
			resolver.pointMove({
				type: PlatformPointType.Move,
				identifier: 1, // pointDown() の identifier と異なる値
				offset: { x: 0, y: 0 },
				button: PlatformButtonType.Unchanged
			})
		).toBeNull();

		expect(
			resolver.pointUp({
				type: PlatformPointType.Up,
				identifier: 1, // pointDown() の identifier と異なる値
				offset: { x: 0, y: 0 },
				button: PlatformButtonType.Primary
			})
		).toBeNull();
	});

	it("can not multi-touch more than maxPoints", () => {
		const runtime = skeletonRuntime();
		const game = runtime.game;
		const playerId = "dummyPlayerId";
		const maxPoints = 1;
		const resolver = new PointEventResolver({ sourceResolver: game, playerId, maxPoints });
		const pointDownEvent = {
			type: PlatformPointType.Down,
			identifier: 0,
			offset: { x: 10, y: 20 },
			button: PlatformButtonType.Primary
		};
		const anotherPointDownEvent = {
			type: PlatformPointType.Down,
			identifier: 1,
			offset: { x: 20, y: 10 },
			button: PlatformButtonType.Primary
		};

		expect(resolver.pointDown(pointDownEvent)).not.toBeNull();
		// maxPointsが1なので2個以上のマルチタップは無効となる
		expect(resolver.pointDown(anotherPointDownEvent)).toBeNull();
		expect(
			resolver.pointUp({
				type: PlatformPointType.Up,
				identifier: 0, // pointDownEventと同じidentifier
				offset: { x: 0, y: 0 },
				button: PlatformButtonType.Primary
			})
		).not.toBeNull();
		// pointDownEvent解放後はanotherPointDownEventのタップが有効となる
		expect(resolver.pointDown(anotherPointDownEvent)).not.toBeNull();
		// anotherPointDownEventでタップ中のため無効
		expect(resolver.pointDown(pointDownEvent)).toBeNull();
	});
});
