import { Camera2D, CompositeOperation, E, PlainMatrix, PointDownEvent, PointSource, Scene } from "..";
import { customMatchers, EntityStateFlags, Game, Renderer, Runtime, skeletonRuntime } from "./helpers";
import { Matrix } from "../domain/Matrix";

expect.extend(customMatchers);

describe("test E", () => {
	let runtime: Runtime, e: E;

	function resetUpdated(runtime: Runtime): void {
		runtime.game.modified = false;
		e.state &= ~EntityStateFlags.Modified;
	}

	beforeEach(() => {
		runtime = skeletonRuntime();
		e = new E({ scene: runtime.scene });
		runtime.scene.append(e);
	});
	it("初期化", () => {
		let e = new E({ scene: runtime.scene });
		expect(e.children).toBeUndefined();
		expect(e.parent).toBeUndefined();
		expect(e.touchable).toEqual(false);
		expect(e.local).toBe(false);
		expect(e.scene).toBe(runtime.scene);
		expect(e.state).toBe(EntityStateFlags.None);
		expect(e._hasTouchableChildren).toBe(false);
		expect(e.x).toBe(0);
		expect(e.y).toBe(0);
		expect(e.width).toBe(0);
		expect(e.height).toBe(0);
		expect(e.opacity).toBe(1);
		expect(e.scaleX).toBe(1);
		expect(e.scaleY).toBe(1);

		let c1 = new E({ scene: runtime.scene, x: 10, y: 10, local: true });
		let c2 = new E({ scene: runtime.scene, x: 0, y: 0, local: true });
		e = new E({
			scene: runtime.scene,
			local: true,
			children: [c1, c2],
			touchable: true,
			hidden: true,
			x: 10,
			y: 20,
			width: 5,
			height: 4,
			opacity: 0.5,
			scaleX: 2,
			scaleY: 3
		});

		expect(e.parent).toBeUndefined();
		expect(e.children.length).toBe(2);
		expect(e.children[0]).toBe(c1);
		expect(e.children[1]).toBe(c2);
		expect(e.touchable).toBe(true);
		expect(e.local).toBe(true);
		expect(e.scene).toBe(runtime.scene);
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.Hidden);
		expect(e._hasTouchableChildren).toBe(false);
		expect(e.id in runtime.game.db).toBe(false);
		expect(e.id in runtime.game._localDb).toBe(true);
		expect(e.x).toBe(10);
		expect(e.y).toBe(20);
		expect(e.width).toBe(5);
		expect(e.height).toBe(4);
		expect(e.opacity).toBe(0.5);
		expect(e.scaleX).toBe(2);
		expect(e.scaleY).toBe(3);

		// parameter object で初期化してもコンストラクタ内で modified() していないが、問題なく動作することを確認しておく
		const mat = new PlainMatrix();
		mat.update(5, 4, 2, 3, 0, 10, 20, 0, 0);
		expect(e.getMatrix()._matrix).toEqual(mat._matrix);

		e = new E({
			id: 400,
			scene: runtime.scene,
			touchable: true,
			x: 100,
			y: 10
		});
		expect(e.id).toBe(400);
		expect(runtime.game.db[e.id]).toBe(e);
		expect(e.scene).toBe(runtime.scene);
		expect(e.x).toBe(100);
		expect(e.y).toBe(10);
		expect(e.touchable).toBe(true);

		// 重複IDはエラー
		expect(() => {
			return new E({ id: 400, scene: runtime.scene });
		}).toThrowError("AssertionError");
		// localは負のID
		expect(() => {
			return new E({ id: 500, scene: runtime.scene, local: true });
		}).toThrowError("AssertionError");

		expect(runtime.game._idx).toBe(400);

		// コンストラクタでのparent, tag指定チェック
		const p = new E({ scene: runtime.scene });
		c1 = new E({ scene: runtime.scene, parent: p });
		c2 = new E({ scene: runtime.scene, parent: p, tag: "tagged" });
		expect(c1.parent).toBe(p);
		expect(c2.parent).toBe(p);
		expect(p.children[0]).toBe(c1);
		expect(p.children[1]).toBe(c2);
		expect(c2.tag).toBe("tagged");
	});

	it("findPointSourceByPoint", () => {
		const e2 = new E({ scene: runtime.scene });
		e2.width = 100;
		e2.height = 100;
		runtime.scene.append(e2);
		e2.modified();

		const point = { x: e2.width / 2, y: e2.height / 2 };
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({
			target: e2,
			point: point,
			local: false
		});

		const e3 = new E({ scene: runtime.scene });
		e3.x = e3.y = 10;
		e3.width = 100;
		e3.height = 100;
		e2.append(e3);
		e3.modified();

		const pointForE3 = { x: point.x - e3.x, y: point.y - e3.y };
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({
			target: e3,
			point: pointForE3,
			local: false
		});

		e2.touchable = true;
		e2.local = true;
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({
			target: e2,
			point: point,
			local: true
		});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({
			target: e3,
			point: pointForE3,
			local: false
		});
		point.x = e2.width + 1;
		point.y = e2.height + 1;
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
	});

	it("show", () => {
		const e2 = new E({ scene: runtime.scene });
		e2.show();
		expect(e2.state).toEqual(0); // modified変更なし
	});

	it("hide", () => {
		const e2 = new E({ scene: runtime.scene });
		e2.hide();
		expect(e2.state).toEqual(EntityStateFlags.Hidden);
	});

	it("テスト内の便利関数テスト", () => {
		expect(runtime.game).not.toBeFalsy();
		expect(runtime.scene).not.toBeFalsy();
		expect(runtime.scene.children).not.toBeFalsy();
		expect(runtime.scene.children.length).toBe(1);
		expect(runtime.scene.children[0]).toEqual(e);

		const runtime2 = skeletonRuntime();
		expect(runtime2.game).not.toBeFalsy();
		expect(runtime2.scene).not.toBeFalsy();
		expect(runtime2.scene.children).not.toBeFalsy();
		expect(runtime2.scene.children.length).toBe(0);
	});

	it("scene", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game });
		const e2 = new E({ scene: scene });
		expect(e.game() === runtime.game).toBe(true);
		expect(e2.game() === game).toBe(true);
	});

	it("game", () => {
		expect(e.game()).toEqual(runtime.game);
	});

	it("append", () => {
		const e2 = new E({ scene: runtime.scene });
		e.append(e2);
		expect(e.parent).toEqual(runtime.scene);
		expect(e2.parent).toEqual(e);
	});

	it("insertBefore", () => {
		const e2 = new E({ scene: runtime.scene });
		const e3 = new E({ scene: runtime.scene });
		const e4 = new E({ scene: runtime.scene });
		const e5 = new E({ scene: runtime.scene });
		e.append(e2);
		e.insertBefore(e3, e2);
		expect(e.children[0]).toBe(e3);
		expect(e.children[1]).toBe(e2);
		e.insertBefore(e4, e5);
		expect(e.children[2]).toBe(e4);

		const e6 = new E({ scene: runtime.scene });
		const e7 = new E({ scene: runtime.scene });
		e6.insertBefore(e7, undefined);
		expect(e6.children[0]).toBe(e7);
	});

	it("remove", () => {
		const e2 = new E({ scene: runtime.scene });
		const e3 = new E({ scene: runtime.scene });
		expect(e2.scene).toBe(runtime.scene);
		expect(e3.scene).toBe(runtime.scene);
		expect(runtime.game.db[e.id]).toBe(e);
		expect(runtime.game.db[e2.id]).toBe(e2);
		expect(runtime.game.db[e3.id]).toBe(e3);

		e.append(e2);
		expect(e.parent).toBe(runtime.scene);
		expect(e2.parent).toBe(e);

		e2.remove();
		expect(e.parent).toBe(runtime.scene);
		expect(e2.parent).toBeUndefined();
		expect(runtime.game.db[e.id]).toBe(e);
		expect(runtime.game.db[e2.id]).toBe(e2);

		e2.destroy();
		expect(runtime.game.db[e2.id]).toBeUndefined();
		expect(e2.destroyed()).toBe(true);

		runtime.scene.append(e3);
		expect(e3.parent).toBe(runtime.scene);

		runtime.scene.remove(e3);
		expect(e3.parent).toBeUndefined();
		expect(runtime.game.db[e3.id]).toBe(e3);

		e3.destroy();
		expect(runtime.game.db[e3.id]).toBeUndefined();
	});

	it("remove - AssertionError", () => {
		const e2 = new E({ scene: runtime.scene });
		const e3 = new E({ scene: runtime.scene });
		e.append(e2);
		e2.remove();
		e2.destroy();
		expect(() => {
			e2.remove(e2);
		}).toThrowError("AssertionError");
	});

	it("destroy - has no handle", () => {
		const e2 = new E({ scene: runtime.scene });

		e.append(e2);
		expect(e.children.length).toBe(1);
		expect(e.children[0]).toBe(e2);

		e2.destroy();
		expect(e.children.length).toBe(0);

		const e3 = new E({ scene: runtime.scene });
		const e4 = new E({ scene: runtime.scene });
		e.append(e3);
		e.append(e4);

		expect(e.children.length).toBe(2);
		expect(e.children[0]).toBe(e3);
		expect(e.children[1]).toBe(e4);

		e3.destroy();
		expect(e.children.length).toBe(1);
		expect(e.children[0]).toBe(e4);
		expect(e3.parent).toBe(undefined);
		expect(e3.destroyed()).toBe(true);

		const e5 = new E({ scene: runtime.scene });
		e.append(e5);
		expect(e.children.length).toBe(2);
		expect(e.children[0]).toBe(e4);
		expect(e.children[1]).toBe(e5);

		e.destroy();
		expect(e.parent).toBe(undefined);
		expect(e.destroyed()).toBe(true);
		expect(e.children).toBe(undefined);
		expect(e4.parent).toBe(undefined);
		expect(e4.destroyed()).toBe(true);
		expect(e4.children).toBe(undefined);
		expect(e5.parent).toBe(undefined);
		expect(e5.destroyed()).toBe(true);
		expect(e5.children).toBe(undefined);
	});

	it("destroy - has handles", () => {
		e.message.add(() => {
			/* do nothing */
		});
		e.pointDown.add(() => {
			/* do nothing */
		});
		e.pointMove.add(() => {
			/* do nothing */
		});
		e.pointUp.add(() => {
			/* do nothing */
		});
		expect((e as any)._message).toBeDefined();
		expect((e as any)._pointDown).toBeDefined();
		expect((e as any)._pointMove).toBeDefined();
		expect((e as any)._pointUp).toBeDefined();

		e.destroy();
		expect(e.parent).toBe(undefined);
		expect(e.destroyed()).toBe(true);
		expect(e.children).toBe(undefined);
		expect((e as any)._message).toBeUndefined();
		expect((e as any)._pointDown).toBeUndefined();
		expect((e as any)._pointMove).toBeUndefined();
		expect((e as any)._pointUp).toBeUndefined();
	});

	it("modified", () => {
		resetUpdated(runtime);
		expect(runtime.game.modified).toBe(false);

		e.modified();
		expect(runtime.game.modified).toBe(true);

		resetUpdated(runtime);

		const e2 = new E({ scene: runtime.scene });
		e.append(e2);
		expect(runtime.game.modified).toBe(true);

		resetUpdated(runtime);
		const e3 = new E({ scene: runtime.scene });
		e.append(e3);
		expect(runtime.game.modified).toBe(true);
	});

	it("modified with hide/show", () => {
		resetUpdated(runtime);
		expect(runtime.game.modified).toBe(false);
		e.hide();
		expect(runtime.game.modified).toBe(true);
		runtime.game.render();
		expect(runtime.game.modified).toBe(false);
		e.show();
		expect(runtime.game.modified).toBe(true);
	});

	it("update", () => {
		expect((e as any)._update).toBeUndefined();
		expect(runtime.scene.update.length > 0).toBe(false);
		runtime.game.tick(true);

		// auto chain
		expect(e.update).not.toBeUndefined();
		expect((e as any)._update).not.toBeUndefined();
		expect((e as any)._update.chain).not.toBeUndefined();
		expect(runtime.scene.update.length > 0).toBe(false);

		runtime.game.tick(true);

		let estate = false;
		let esuccess = false;
		e.update.add(() => {
			if (!estate) fail("efail");
			esuccess = true;
		});
		expect(runtime.scene.update.length > 0).toBe(true);

		estate = true;
		runtime.game.tick(true);
		expect(esuccess).toBe(true);

		const scene2 = new Scene({ game: runtime.game });
		runtime.game.pushScene(scene2);
		runtime.game._flushSceneChangeRequests();
		estate = false;
		runtime.game.tick(true);
		runtime.game.tick(true);
		runtime.game.tick(true);

		runtime.game.popScene();
		runtime.game._flushSceneChangeRequests();
		estate = true;
		esuccess = false;
		runtime.game.tick(true);
		expect(esuccess).toBe(true);

		const scene3 = new Scene({ game: runtime.game });
		runtime.game.replaceScene(scene3);
		runtime.game._flushSceneChangeRequests();
		estate = false;

		expect(scene3.update.length > 0).toBe(false);
		expect(runtime.scene.update.destroyed()).toBe(true);
		runtime.game.tick(true);
	});

	it("operate", () => {
		expect((e as any)._pointDown).toBeUndefined();
		expect(runtime.scene.pointDownCapture.length > 0).toBe(false);
		expect(e.pointDown).not.toBeUndefined();
		expect((e as any)._pointDown).not.toBeUndefined();
		expect((e as any)._pointDown.chain).not.toBeUndefined();
		expect(runtime.scene.pointDownCapture.length > 0).toBe(false);

		const operationTick = () => {
			runtime.game.events.push(new PointDownEvent(1, e, { x: 0, y: 0 }, { id: "1" }));
			runtime.game.tick(true);
		};
		let estate = false;
		let esuccess = false;
		e.pointDown.add(() => {
			if (!estate) fail("efail");
			esuccess = true;
		});
		operationTick();
		e.touchable = true;

		estate = true;
		operationTick();
		expect(esuccess).toBe(true);

		const scene2 = new Scene({ game: runtime.game });
		runtime.game.pushScene(scene2);
		runtime.game._flushSceneChangeRequests();
		estate = false;
		operationTick();
		operationTick();
		operationTick();

		runtime.game.popScene();
		runtime.game._flushSceneChangeRequests();
		estate = true;
		esuccess = false;
		operationTick();
		expect(esuccess).toBe(true);

		runtime.game.replaceScene(new Scene({ game: runtime.game }));
		runtime.game._flushSceneChangeRequests();
		estate = false;

		expect(runtime.scene.pointDownCapture.destroyed()).toBe(true);
		operationTick();
	});

	it("findPointSource", () => {
		e.touchable = true;
		e.x = e.y = 100;
		e.width = e.height = 100;

		const face1 = new E({ scene: runtime.scene });
		face1.touchable = true;
		face1.x = face1.y = 10;
		face1.width = face1.height = 10;
		e.append(face1);
		face1.modified();

		let found: PointSource;
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toBe(e);
		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toBe(face1);

		const cam1 = new Camera2D({});
		cam1.x = cam1.y = 10;

		found = runtime.game.findPointSource({ x: 115, y: 115 }, cam1);
		expect(found && found.target).toBe(e);

		const face2 = new E({ scene: runtime.scene });
		face2.x = face2.y = 10;
		face2.width = face2.height = 10;
		e.append(face2);
		face2.modified();

		face2.touchable = true;
		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toBe(face2);

		face2.touchable = false;
		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toBe(face1);

		face1.touchable = false;
		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toBe(e);
	});

	it("findPointSource - deep", () => {
		const e2 = new E({ scene: runtime.scene });
		const e3 = new E({ scene: runtime.scene });
		const e4 = new E({ scene: runtime.scene });
		e.append(e2);
		e2.append(e3);
		e3.append(e4);

		e.x = e.y = e2.x = e2.y = e3.x = e3.y = 0;
		e4.x = e4.y = 0;
		e4.width = e4.height = 100;
		e4.modified();

		let found;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBeUndefined();

		e4.touchable = true;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBe(e4);

		e4.remove();
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBeUndefined();
	});

	it("findPointSource - rotated/scaled", () => {
		e.touchable = true;
		e.width = e.height = 100;
		e.x = e.y = 100 + e.width / 2;
		e.anchorX = e.anchorY = 0.5;

		let found;
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toBe(e);
		found = runtime.game.findPointSource({ x: 105, y: 105 });
		expect(found && found.target).toBe(e);

		e.angle = 45;
		e.modified();
		found = runtime.game.findPointSource({ x: 105, y: 105 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		found = runtime.game.findPointSource({ x: 150, y: 95 });
		expect(found && found.target).toBe(e);

		e.scaleY = 0.5;
		e.modified();
		found = runtime.game.findPointSource({ x: 150, y: 95 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		found = runtime.game.findPointSource({ x: 150, y: 105 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toBe(e);
	});

	it("findPointSource - dynamic", () => {
		e.x = e.y = 100;
		e.width = e.height = 99;

		const child = new E({ scene: runtime.scene });
		child.x = child.y = 90;
		child.width = child.height = 90;
		child.touchable = true;
		e.append(child);

		const sibling = new E({ scene: runtime.scene });
		sibling.x = 200;
		sibling.y = 0;
		sibling.width = sibling.height = 10;
		runtime.scene.append(sibling);
		sibling.modified();

		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(false);

		let found = runtime.game.findPointSource({
			x: 100 + 90 + 5,
			y: 100 + 90 + 5
		});
		expect(found && found.target).toBe(child);
		found = runtime.game.findPointSource({ x: 100 + 5, y: 100 + 5 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		}); // on e (untouchable)

		sibling.append(child);
		expect(e._hasTouchableChildren).toBe(false);
		expect(sibling._hasTouchableChildren).toBe(true);

		found = runtime.game.findPointSource({ x: 100 + 90 + 5, y: 100 + 90 + 5 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
		found = runtime.game.findPointSource({ x: 200 + 90 + 5, y: 0 + 90 + 5 });
		expect(found && found.target).toBe(child);

		e.append(child);
		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(false);

		found = runtime.game.findPointSource({ x: 100 + 90 + 5, y: 100 + 90 + 5 });
		expect(found && found.target).toBe(child);
		found = runtime.game.findPointSource({ x: 100 + 5, y: 100 + 5 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		}); // on e (untouchable)

		sibling.append(e);
		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(true);

		found = runtime.game.findPointSource({
			x: 100 + 200 + 90 + 5,
			y: 100 + 0 + 90 + 5
		});
		expect(found && found.target).toBe(child);

		const e2 = new E({ scene: runtime.scene });
		runtime.scene.append(e2);
		e2.append(sibling);

		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(true);
		expect(e2._hasTouchableChildren).toBe(true);

		sibling.remove();
		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(true);
		expect(e2._hasTouchableChildren).toBe(false);
	});

	it("findPointSource - hide", () => {
		e.touchable = true;
		e.x = e.y = 0;
		e.width = 100;
		e.height = 100;
		e.modified();

		let found;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBe(e);
		e.hide();
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found).toEqual({
			target: undefined,
			point: undefined,
			local: false
		});
	});

	it("findPointSource - clipping", () => {
		const e2 = new E({ scene: runtime.scene });
		e.append(e2);

		e.x = e.y = e2.x = e2.y = 0;
		e.width = 100;
		e.height = 100;
		e.modified();
		e2.touchable = true;
		e2.width = 200;
		e2.height = 200;
		e2.modified();

		let found;
		found = runtime.scene.findPointSourceByPoint({ x: 150, y: 150 });
		expect(found && found.target).toBe(e2);
		e.shouldFindChildrenByPoint = () => {
			return false;
		};
		found = runtime.scene.findPointSourceByPoint({ x: 150, y: 150 });
		expect(found && found.target).toBeUndefined();
	});

	it("findPointSource - local scene", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const scene = new Scene({ game: game, local: true });
		game.pushScene(scene);
		game._flushSceneChangeRequests();

		const e = new E({
			scene: scene,
			touchable: true,
			x: 100,
			y: 100,
			width: 100,
			height: 100
		});
		scene.append(e);

		let found;
		found = game.findPointSource({ x: 150, y: 150 });
		expect(found).toEqual({ target: e, point: { x: 50, y: 50 }, local: true });
		found = game.findPointSource({ x: 0, y: 0 });
		expect(found).toEqual({ target: undefined, point: undefined, local: true });
	});

	it("findPointSource - local entity", () => {
		const eparam = {
			scene: runtime.scene,
			local: true,
			touchable: true
		};
		e = new E(eparam);
		e.x = e.y = 100;
		e.width = e.height = 100;
		runtime.scene.append(e);

		let found;
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found).toEqual({ target: e, point: { x: 50, y: 50 }, local: true });
	});

	it("get update", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._update).toBeUndefined();

		const u = e.update;

		expect((e as any)._update).toBe(u);
		expect(e.update).toBe(u);

		let firedFlg = false;
		u.add(() => {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		u.fire();

		expect(firedFlg).toBe(true);
	});

	it("get message", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._message).toBeUndefined();

		const m = e.message;

		expect((e as any)._message).toBe(m);
		expect(e.message).toBe(m);

		let firedFlg = false;
		m.add(() => {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		m.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointDown", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._pointDown).toBeUndefined();

		const p = e.pointDown;

		expect((e as any)._pointDown).toBe(p);
		expect(e.pointDown).toBe(p);

		let firedFlg = false;
		p.add(() => {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointUp", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._pointUp).toBeUndefined();

		const p = e.pointUp;

		expect((e as any)._pointUp).toBe(p);
		expect(e.pointUp).toBe(p);

		let firedFlg = false;
		p.add(() => {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointMove", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._pointMove).toBeUndefined();

		const p = e.pointMove;

		expect((e as any)._pointMove).toBe(p);
		expect(e.pointMove).toBe(p);

		let firedFlg = false;
		p.add(() => {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("set/get touchable", () => {
		const e = new E({ scene: runtime.scene });

		expect((e as any)._touchable).toBe(false);
		expect(e.touchable).toBe(false);

		e.touchable = true;
		expect((e as any)._touchable).toBe(true);
		expect(e.touchable).toBe(true);

		let enableFlg = false;
		e._enableTouchPropagation = () => {
			enableFlg = true;
		};

		e.touchable = false;
		expect(enableFlg).toBe(false);
		e.touchable = true;
		expect(enableFlg).toBe(true);

		let disableFlg = false;
		e._disableTouchPropagation = () => {
			disableFlg = true;
		};

		e.touchable = true;
		expect(disableFlg).toBe(false);
		e.touchable = false;
		expect(disableFlg).toBe(true);
	});

	it("render with camera", () => {
		const e = new E({ scene: runtime.scene });
		const r = new Renderer();
		const c = new Camera2D({});

		r.clearMethodCallHistory();
		e.modified();
		e.render(r, c);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);

		r.clearMethodCallHistory();
		e.scale(2);
		e.render(r, c);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);

		r.clearMethodCallHistory();
		e.opacity = 0;
		e.render(r, c);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);
		e.opacity = 1;

		r.clearMethodCallHistory();
		e.hide();
		e.render(r, c);
		expect(r.methodCallHistory).toEqual([]);
		e.show();

		r.clearMethodCallHistory();
		const e2 = new E({ scene: runtime.scene });
		e.children = [e2];
		e.render(r, c);
		expect(r.methodCallHistory).toEqual(["translate", "save", "translate", "restore", "translate"]);
	});

	it("render without camera", () => {
		const e = new E({ scene: runtime.scene });
		const r = new Renderer();

		e.modified();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);

		r.clearMethodCallHistory();
		e.scale(2);
		e.render(r);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);

		r.clearMethodCallHistory();
		e.opacity = 0;
		e.render(r);
		expect(r.methodCallHistory).toEqual(["translate", "translate"]);
		e.opacity = 1;

		r.clearMethodCallHistory();
		e.hide();
		e.render(r);
		expect(r.methodCallHistory).toEqual([]);
		e.show();

		r.clearMethodCallHistory();
		const e2 = new E({ scene: runtime.scene });
		e.children = [e2];
		e.render(r);
		expect(r.methodCallHistory).toEqual(["translate", "save", "translate", "restore", "translate"]);
	});

	it("renderSelf with camera", () => {
		const e = new E({ scene: runtime.scene });
		const r = new Renderer();
		const c = new Camera2D({});

		expect(e.renderSelf(r, c)).toBe(true);
		expect(r.methodCallHistory).toEqual([]);
	});

	it("renderSelf without camera", () => {
		const e = new E({ scene: runtime.scene });
		const r = new Renderer();

		expect(e.renderSelf(r)).toBe(true);
		expect(r.methodCallHistory).toEqual([]);
	});

	it("visible", () => {
		const e = new E({ scene: runtime.scene });

		expect(e.visible()).toBe(true);
		e.hide();
		expect(e.visible()).toBe(false);
		e.show();
		expect(e.visible()).toBe(true);
	});

	it("_enableTouchPropagation", () => {
		const e = new E({ scene: runtime.scene });
		const e2 = new E({ scene: runtime.scene });
		e.append(e2);

		expect(e._hasTouchableChildren).toBe(false);
		e2._enableTouchPropagation();
		expect(e._hasTouchableChildren).toBe(true);
	});

	it("_disableTouchPropagation", () => {
		const e = new E({ scene: runtime.scene });
		const e2 = new E({ scene: runtime.scene });
		const e3 = new E({ scene: runtime.scene });
		const e4 = new E({ scene: runtime.scene });
		e3.append(e4);
		e2.append(e3);
		e.append(e2);
		e2.touchable = true;
		e4.touchable = true;

		expect(e._hasTouchableChildren).toBe(true);
		e2._disableTouchPropagation();
		expect(e._hasTouchableChildren).toBe(true); // e4 is touchable
		e._disableTouchPropagation();
		expect(e._hasTouchableChildren).toBe(true);
		e4._disableTouchPropagation();
		expect(e._hasTouchableChildren).toBe(true); // e4 and e2 is touchable

		const parent = new E({ scene: runtime.scene });
		const child1 = new E({ scene: runtime.scene });
		const child2 = new E({ scene: runtime.scene });
		parent.append(child1);
		parent.append(child2);
		child1.touchable = true;
		child2.touchable = true;
		expect(child1.touchable).toBe(true);
		expect(child2.touchable).toBe(true);
		child2.touchable = false;
		expect(child1.touchable).toBe(true);
		expect(child2.touchable).toBe(false);
	});

	it("_isTargetOperation", () => {
		const e = new E({ scene: runtime.scene });
		const p = new PointDownEvent(0, e, { x: 0, y: 0 });

		expect(e._isTargetOperation(p)).toBe(false);
		e.touchable = true;
		expect(e._isTargetOperation(p)).toBe(true);
		e.hide();
		expect(e._isTargetOperation(p)).toBe(false);
		e.show();
		expect(e._isTargetOperation(p)).toBe(true);
		expect(e._isTargetOperation(null)).toBe(false);

		const e2 = new E({ scene: runtime.scene });
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.touchable = true;
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.hide();
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.show();
		expect(e2._isTargetOperation(p)).toBe(false);
		expect(e2._isTargetOperation(null)).toBe(false);
	});

	it("render - compositeOperation", () => {
		const e = new E({ scene: runtime.scene });
		const r = new Renderer();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "restore"]);
		e.compositeOperation = CompositeOperation.SourceAtop;
		r.clearMethodCallHistory();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "setCompositeOperation", "restore"]);
		expect(r.methodCallParamsHistory("setCompositeOperation")[0]).toEqual({
			operation: CompositeOperation.SourceAtop
		});
		e.compositeOperation = undefined;
		r.clearMethodCallHistory();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "restore"]);
	});

	it("calculateBoundingRect", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene });
		e.width = 100;
		e.height = 50;
		e.scale(2);
		scene.append(e);
		e.modified();

		const result = e.calculateBoundingRect();
		expect(result.left).toBe(0);
		expect(result.right).toBe(200);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(100);

		const e2 = new E({ scene });
		e2.width = 100;
		e2.height = 50;
		e2.anchor(0.5, 0.5);
		e2.scale(2);
		e2.moveTo(-50, -10);
		scene.append(e2);
		e2.modified();

		const result2 = e2.calculateBoundingRect();
		expect(result2.left).toBe(-150);
		expect(result2.right).toBe(50);
		expect(result2.top).toBe(-60);
		expect(result2.bottom).toBe(40);

		const e3 = new E({ scene });
		e3.width = 300;
		e3.height = 400;
		e3.scale(0.5);
		e3.anchor(1, 1);
		e3.moveTo(10, 20);
		scene.append(e3);
		e3.modified();

		const result3 = e3.calculateBoundingRect();
		expect(result3.left).toBe(-140);
		expect(result3.right).toBe(10);
		expect(result3.top).toBe(-180);
		expect(result3.bottom).toBe(20);
	});

	it("calculateBoundingRect with children", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene: scene });
		e.width = 100;
		e.height = 50;
		scene.append(e);

		const e2 = new E({ scene: scene });
		e2.width = 400;
		e2.height = 200;
		scene.append(e2);
		e.append(e2);

		const e3 = new E({ scene: scene });
		e3.width = 200;
		e3.height = 400;
		scene.append(e3);
		e.append(e3);

		const result = e.calculateBoundingRect();
		expect(result.left).toBe(0);
		expect(result.right).toBe(400);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(400);
	});

	it("calculateBoundingRect with grandchild", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene: scene });
		e.width = 100;
		e.height = 50;
		scene.append(e);

		const e2 = new E({ scene: scene });
		e2.width = 200;
		e2.height = 200;
		scene.append(e2);
		e.append(e2);

		const e3 = new E({ scene: scene });
		e3.width = 400;
		e3.height = 200;
		scene.append(e3);
		e2.append(e3);

		const e4 = new E({ scene: scene });
		e4.width = 200;
		e4.height = 400;
		scene.append(e4);
		e3.append(e4);

		const result = e.calculateBoundingRect();
		expect(result.left).toBe(0);
		expect(result.right).toBe(400);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(400);
	});

	it("EntityStateFlags", () => {
		const e = new E({ scene: runtime.scene });
		expect(e.state).toBe(EntityStateFlags.None);
		e.x += 1;
		e.modified();
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
		const r = new Renderer();
		e.render(r, runtime.game.focusingCamera);
		expect(e.state).toBe(EntityStateFlags.ContextLess);
		e.angle = 10;
		e.modified();
		expect(e.state).toBe(EntityStateFlags.Modified);
		e.render(r, runtime.game.focusingCamera);
		e.angle = 0;
		e.modified();
		expect(e.state).toBe(EntityStateFlags.Modified | EntityStateFlags.ContextLess);
	});
	describe("localToGlobal, globalToLocal", () => {
		let p: E;
		let p2: E;
		let p3: E;
		let e: E;
		let anotherRuntime: Runtime;
		beforeEach(() => {
			p = new E({ scene: runtime.scene, x: 100, y: 100, scaleX: 0.5, scaleY: 0.5, anchorX: 1, anchorY: 1});
			p2 = new E({ scene: runtime.scene, angle: 45, anchorX: 0.5, anchorY: 0.5, parent: p });
			p3 = new E({ scene: runtime.scene, x: 20, y: 20, scaleX: 2, scaleY: 3, parent: p2 });
			e = new E({ scene: runtime.scene, parent: p3, x: 10, y: 0 });
			anotherRuntime = skeletonRuntime();
		});
		it("can convert local point to global point", () => {
			// 一番上の親エンティティのparentがundefinedの場合
			const targetPoint = { x: 5, y: 30 };
			const matrixs = [e.getMatrix(), p3.getMatrix(), p2.getMatrix(), p.getMatrix()];
			let matrix: Matrix = new PlainMatrix();
			matrixs.forEach(m => matrix = m.multiplyNew(matrix));
			const actual = e.localToGlobal(targetPoint);
			const expected = matrix.multiplyPoint(targetPoint);
			expect(actual.x).toBeApproximation(expected.x, 10);
			expect(actual.y).toBeApproximation(expected.y, 10);

			// 一番上の親エンティティのparentがsceneに変わってもlocalToGlobalの結果は変わらない
			p.parent = anotherRuntime.scene;
			anotherRuntime.scene.append(p);
			const actual2 = e.localToGlobal(targetPoint);
			expect(actual2.x).toBeApproximation(expected.x, 10);
			expect(actual2.y).toBeApproximation(expected.y, 10);
		});
		it("can convert global point to local point", () => {
			// 一番上の親エンティティのparentがundefinedの場合
			const targetPoint = { x: 500, y: 500 };
			const matrixs = [p.getMatrix(), p2.getMatrix(), p3.getMatrix(), e.getMatrix()];
			let expected = targetPoint;
			matrixs.forEach(m => expected = m.multiplyInverseForPoint(expected));
			const actual = e.globalToLocal(targetPoint);
			expect(actual.x).toBeApproximation(expected.x, 10);
			expect(actual.y).toBeApproximation(expected.y, 10);

			// 一番上の親エンティティのparentがsceneに変わってもlocalToGlobalの結果は変わらない
			p.parent = anotherRuntime.scene;
			anotherRuntime.scene.append(p);
			const actual2 = e.globalToLocal(targetPoint);
			expect(actual2.x).toBeApproximation(expected.x, 10);
			expect(actual2.y).toBeApproximation(expected.y, 10);
		});
		it("is reversible", () => {
			const targetPoint = { x: 0, y: 0 };
			const actual = e.localToGlobal(e.globalToLocal(targetPoint));
			expect(actual.x).toBeApproximation(targetPoint.x, 10);
			expect(actual.y).toBeApproximation(targetPoint.y, 10);
			const actual2 = e.globalToLocal(e.localToGlobal(targetPoint));
			expect(actual2.x).toBeApproximation(targetPoint.x, 10);
			expect(actual2.y).toBeApproximation(targetPoint.y, 10);
		});
	});
});
