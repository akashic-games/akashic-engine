var g = require("../lib/main.node.js");
var mock = require("./helpers/mock");
describe("test E", function () {
	var runtime, e;
	var skeletonRuntime = require("./helpers/skeleton");

	function resetUpdated(runtime) {
		runtime.game.modified = false;
		e.state &= ~mock.EntityStateFlags.Modified;
	}

	beforeEach(function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		runtime = skeletonRuntime();
		e = new g.E({ scene: runtime.scene });
		runtime.scene.append(e);
	});
	afterEach(function () {
	});
	it("初期化", function () {
		var e = new g.E({ scene: runtime.scene });
		expect(e).toHaveUndefinedValue("children", "parent");
		expect(e.touchable).toEqual(false);
		expect(e.local).toBe(false);
		expect(e.scene).toBe(runtime.scene);
		expect(e.state).toBe(mock.EntityStateFlags.None);
		expect(e._targetCameras).toBeUndefined();
		expect(e._hasTouchableChildren).toBe(false);
		expect(e.x).toBe(0);
		expect(e.y).toBe(0);
		expect(e.width).toBe(0);
		expect(e.height).toBe(0);
		expect(e.opacity).toBe(1);
		expect(e.scaleX).toBe(1);
		expect(e.scaleY).toBe(1);

		var c1 = new g.E({ scene: runtime.scene, x: 10, y: 10, local: true });
		var c2 = new g.E({ scene: runtime.scene, x: 0, y: 0, local: true });
		var e = new g.E({
			scene: runtime.scene,
			local: true,
			children: [c1, c2],
			targetCameras: [],
			touchable: true,
			hidden: true,
			x: 10, y: 20, width: 5, height: 4,
			opacity: 0.5,
			scaleX: 2, scaleY: 3,
		});

		expect(e).toHaveUndefinedValue("parent");
		expect(e.children.length).toBe(2);
		expect(e.children[0]).toBe(c1);
		expect(e.children[1]).toBe(c2);
		expect(e.touchable).toBe(true);
		expect(e.local).toBe(true);
		expect(e.scene).toBe(runtime.scene);
		expect(e.state).toBe(mock.EntityStateFlags.Modified | mock.EntityStateFlags.Hidden);
		expect(e._targetCameras).toEqual([]);
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
		var mat = new g.PlainMatrix();
		mat.update(5, 4, 2, 3, 0, 10, 20, 0.5, 0.5);
		expect(e.getMatrix()._matrix).toEqual(mat._matrix);

		var e = new g.E({
			id: 400,
			scene: runtime.scene,
			touchable: true,
			x: 100, y: 10,
		});
		expect(e.id).toBe(400);
		expect(runtime.game.db[e.id]).toBe(e);
		expect(e.scene).toBe(runtime.scene);
		expect(e.x).toBe(100);
		expect(e.y).toBe(10);
		expect(e.touchable).toBe(true);

		// 重複IDはエラー
		expect(function () { new g.E({ id: 400, scene: runtime.scene }); }).toThrowError("AssertionError");
		// localは負のID
		expect(function () { new g.E({ id: 500, scene: runtime.scene, local: true }); }).toThrowError("AssertionError");

		expect(runtime.game._idx).toBe(400);

		//コンストラクタでのparent, tag指定チェック
		var p = new g.E({ scene: runtime.scene });
		var c1 = new g.E({ scene: runtime.scene, parent: p});
		var c2 = new g.E({ scene: runtime.scene, parent: p, tag: "tagged"});
		expect(c1.parent).toBe(p);
		expect(c2.parent).toBe(p);
		expect(p.children[0]).toBe(c1);
		expect(p.children[1]).toBe(c2);
		expect(c2.tag).toBe("tagged");
	});

	it("findPointSourceByPoint", function () {
		var e2 = new g.E({scene: runtime.scene});
		e2.width = 100;
		e2.height = 100;
		runtime.scene.append(e2);
		e2.modified();

		var point = {x:e2.width/2,y:e2.height/2};
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({target:undefined,point:undefined,local:false});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({target:e2,point:point,local:false});

		var e3 = new g.E({ scene: runtime.scene });
		e3.x = e3.y = 10;
		e3.width = 100;
		e3.height = 100;
		e2.append(e3);
		e3.modified();

		var pointForE3 = { x: point.x - e3.x, y: point.y - e3.y };
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({target:undefined,point:undefined,local:false});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({target:e3,point:pointForE3,local:false});

		e2.touchable = true;
		e2.local = true;
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({target:e2,point:point,local:true});
		expect(runtime.scene.findPointSourceByPoint(point, true)).toEqual({target:e3,point:pointForE3,local:false});
		point = {x:e2.width+1,y:e2.height+1};
		expect(runtime.scene.findPointSourceByPoint(point)).toEqual({target:undefined,point:undefined,local:false});
	});

	it("show", function () {
		var e2 = new g.E({ scene: runtime.scene });
		e2.show();
		expect(e2.state).toEqual(0);	// modified変更なし
	});

	it("hide", function () {
		var e2 = new g.E({ scene: runtime.scene });
		e2.hide();
		expect(e2.state).toEqual(mock.EntityStateFlags.Hidden);
	});

	it("テスト内の便利関数テスト", function() {
		expect(runtime.game).not.toBeFalsy();
		expect(runtime.scene).not.toBeFalsy();
		expect(runtime.scene.children).not.toBeFalsy();
		expect(runtime.scene.children.length).toBe(1);
		expect(runtime.scene.children[0]).toEqual(e);

		var runtime2 = skeletonRuntime();
		expect(runtime2.game).not.toBeFalsy();
		expect(runtime2.scene).not.toBeFalsy();
		expect(runtime2.scene.children).not.toBeFalsy();
		expect(runtime2.scene.children.length).toBe(0);
	});

	it("scene", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var scene = new g.Scene({game: game});
		var e2 = new g.E({ scene: scene });
		expect(e.game() === runtime.game).toBe(true);
		expect(e2.game() === game).toBe(true);
	});

	it("game", function () {
		expect(e.game()).toEqual(runtime.game);
	});

	it("append", function () {
		var e2 = new g.E({ scene: runtime.scene });
		e.append(e2);
		expect(e.parent).toEqual(runtime.scene);
		expect(e2.parent).toEqual(e);
	});

	it("insertBefore", function () {
		var e2 = new g.E({ scene: runtime.scene });
		var e3 = new g.E({ scene: runtime.scene });
		var e4 = new g.E({ scene: runtime.scene });
		var e5 = new g.E({ scene: runtime.scene });
		e.append(e2);
		e.insertBefore(e3, e2);
		expect(e.children[0]).toBe(e3);
		expect(e.children[1]).toBe(e2);
		e.insertBefore(e4, e5);
		expect(e.children[2]).toBe(e4);


		var e6 = new g.E({ scene: runtime.scene });
		var e7 = new g.E({ scene: runtime.scene });
		e6.insertBefore(e7);
		expect(e6.children[0]).toBe(e7);
	});

	it("remove", function () {
		var e2 = new g.E({ scene: runtime.scene });
		var e3 = new g.E({ scene: runtime.scene });
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

	it("remove - AssertionError", function () {
 		var e2 = new g.E({ scene: runtime.scene });
 		var e3 = new g.E({ scene: runtime.scene });
 		e.append(e2);
 		e2.remove();
 		e2.destroy();
 		expect(function(){e2.remove(e2);}).toThrowError("AssertionError");
 	});

	it("destroy - has no handle", function () {
		var e2 = new g.E({ scene: runtime.scene });

		e.append(e2);
		expect(e.children.length).toBe(1);
		expect(e.children[0]).toBe(e2);

		e2.destroy();
		expect(e.children.length).toBe(0);

		var e3 = new g.E({ scene: runtime.scene });
		var e4 = new g.E({ scene: runtime.scene });
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

		var e5 = new g.E({ scene: runtime.scene });
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

	it("destroy - has handles", function () {
		e.message.add(function(){});
		e.pointDown.add(function(){});
		e.pointMove.add(function(){});
		e.pointUp.add(function(){});
		expect(e._message).toBeDefined();
		expect(e._pointDown).toBeDefined();
		expect(e._pointMove).toBeDefined();
		expect(e._pointUp).toBeDefined();

		e.destroy();
		expect(e.parent).toBe(undefined);
		expect(e.destroyed()).toBe(true);
		expect(e.children).toBe(undefined);
		expect(e._message).toBeUndefined();
		expect(e._pointDown).toBeUndefined();
		expect(e._pointMove).toBeUndefined();
		expect(e._pointUp).toBeUndefined();
	});

	it("modified", function () {
		resetUpdated(runtime);
		expect(runtime.game.modified).toBe(false);

		e.modified();
		expect(runtime.game.modified).toBe(true);

		resetUpdated(runtime);

		var e2 = new g.E({ scene: runtime.scene });
		e.append(e2);
		expect(runtime.game.modified).toBe(true);

		resetUpdated(runtime);
		var e3 = new g.E({ scene: runtime.scene });
		e.append(e3);
		expect(runtime.game.modified).toBe(true);
	});

	it("modified with hide/show", function() {
		resetUpdated(runtime);
		expect(runtime.game.modified).toBe(false);
		e.hide();
		expect(runtime.game.modified).toBe(true);
		runtime.game.render();
		expect(runtime.game.modified).toBe(false);
		e.show();
		expect(runtime.game.modified).toBe(true);
	});

	it("update", function () {
		expect(e._update).toBeUndefined();
		expect(runtime.scene.update.length > 0).toBe(false);
		runtime.game.tick(1);

		// auto chain
		expect(e.update).not.toBeUndefined();
		expect(e._update).not.toBeUndefined();
		expect(e._update.chain).not.toBeUndefined();
		expect(runtime.scene.update.length > 0).toBe(false);

		runtime.game.tick(1);

		var estate = false;
		var esuccess = false;
		e.update.add(function() {
			if (!estate)
				fail("efail");
			esuccess = true;
		});
		expect(runtime.scene.update.length > 0).toBe(true);

		estate = true;
		runtime.game.tick(1);
		expect(esuccess).toBe(true);

		var scene2 = new g.Scene({game: runtime.game});
		runtime.game.pushScene(scene2);
		runtime.game._flushSceneChangeRequests();
		estate = false;
		runtime.game.tick(1);
		runtime.game.tick(1);
		runtime.game.tick(1);

		runtime.game.popScene();
		runtime.game._flushSceneChangeRequests();
		estate = true;
		esuccess = false;
		runtime.game.tick(1);
		expect(esuccess).toBe(true);

		var scene3 = new g.Scene({game: runtime.game});
		runtime.game.replaceScene(scene3);
		runtime.game._flushSceneChangeRequests();
		estate = false;

		expect(scene3.update.length > 0).toBe(false);
		expect(runtime.scene.update.destroyed()).toBe(true);
		runtime.game.tick(1);
	});

	it("operate", function () {
		expect(e._pointDown).toBeUndefined();
		expect(runtime.scene.pointDownCapture.length > 0).toBe(false);
		expect(e.pointDown).not.toBeUndefined();
		expect(e._pointDown).not.toBeUndefined();
		expect(e._pointDown.chain).not.toBeUndefined();
		expect(runtime.scene.pointDownCapture.length > 0).toBe(false);

		var operationTick = function() {
			runtime.game.events.push(new g.PointDownEvent(1, e, {x: 0, y: 0}, {id: 1}));
			runtime.game.tick(1);
		}
		var estate = false;
		var esuccess = false;
		e.pointDown.add(function() {
			if (!estate)
				fail("efail");
			esuccess = true;
		});
		operationTick();
		e.touchable = true;

		estate = true;
		operationTick();
		expect(esuccess).toBe(true);

		var scene2 = new g.Scene({game: runtime.game});
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

		runtime.game.replaceScene(new g.Scene({game: runtime.game}));
		runtime.game._flushSceneChangeRequests();
		estate = false;

		expect(runtime.scene.pointDownCapture.destroyed()).toBe(true);
		operationTick();
	});

	it("findPointSource", function() {
		var cam1 = new g.Camera2D({game: runtime.game});

		e.touchable = true;
		e.x = e.y = 100;
		e.width = e.height = 100;

		var face1 = new g.E({scene: runtime.scene});
		face1.touchable = true;
		face1.x = face1.y = 10;
		face1.width = face1.height = 10;
		face1.targetCameras.push(cam1);
		e.append(face1);
		face1.modified();

		var found;
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toEqual(e);
		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toEqual(e);

		found = runtime.game.findPointSource({ x: 115, y: 115 }, cam1);
		expect(found && found.target).toBe(face1);

		var cam2 = new g.Camera2D({game: runtime.game});
		var face2 = new g.E({scene: runtime.scene});
		face2.touchable = true;
		face2.x = face2.y = 10;
		face2.width = face2.height = 10;
		face2.targetCameras.push(cam2);
		e.append(face2);
		face2.modified();

		found = runtime.game.findPointSource({ x: 115, y: 115 });
		expect(found && found.target).toBe(e);
		found = runtime.game.findPointSource({ x: 115, y: 115 }, cam1);
		expect(found && found.target).toBe(face1);
		found = runtime.game.findPointSource({ x: 115, y: 115 }, cam2);
		expect(found && found.target).toBe(face2);
	});

	it("findPointSource - deep", function() {
		var e2 = new g.E({ scene: runtime.scene });
		var e3 = new g.E({ scene: runtime.scene });
		var e4 = new g.E({ scene: runtime.scene });
		e.append(e2);
		e2.append(e3);
		e3.append(e4);

		e.x = e.y = e2.x = e2.y = e3.x = e3.y = 0;
		e4.x = e4.y = 0;
		e4.width = e4.height = 100;
		e4.modified();

		var found;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBeUndefined();

		e4.touchable = true;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBe(e4);

		e4.remove();
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBeUndefined();
	});

	it("findPointSource - rotated/scaled", function() {
		e.touchable = true;
		e.x = e.y = 100;
		e.width = e.height = 100;

		var found;
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toBe(e);
		found = runtime.game.findPointSource({ x: 105, y: 105 });
		expect(found && found.target).toBe(e);

		e.angle = 45;
		e.modified();
		found = runtime.game.findPointSource({ x: 105, y: 105 });
		expect(found).toEqual({target: undefined, point: undefined, local: false});
		found = runtime.game.findPointSource({ x: 150, y: 95 });
		expect(found && found.target).toBe(e);

		e.scaleY = 0.5;
		e.modified();
		found = runtime.game.findPointSource({ x: 150, y: 95 });
		expect(found).toEqual({target: undefined, point: undefined, local: false});
		found = runtime.game.findPointSource({ x: 150, y: 105 });
		expect(found).toEqual({target: undefined, point: undefined, local: false});
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found && found.target).toBe(e);
	});

	it("findPointSource - dynamic", function() {
		e.x = e.y = 100;
		e.width = e.height = 99;

		var child = new g.E({scene: runtime.scene});
		child.x = child.y = 90;
		child.width = child.height = 90;
		child.touchable = true;
		e.append(child);

		var sibling = new g.E({scene: runtime.scene});
		sibling.x = 200;
		sibling.y = 0;
		sibling.width = sibling.height = 10;
		runtime.scene.append(sibling);
		sibling.modified();

		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(false);

		var found;
		found = runtime.game.findPointSource({ x: 100 + 90 + 5, y: 100 + 90 + 5 });
		expect(found && found.target).toBe(child);
		found = runtime.game.findPointSource({ x: 100 + 5, y: 100 + 5 });
		expect(found).toEqual({target: undefined, point: undefined, local: false}); // on e (untouchable)

		sibling.append(child);
		expect(e._hasTouchableChildren).toBe(false);
		expect(sibling._hasTouchableChildren).toBe(true);

		found = runtime.game.findPointSource({ x: 100 + 90 + 5, y: 100 + 90 + 5 });
		expect(found).toEqual({target: undefined, point: undefined, local: false});
		found = runtime.game.findPointSource({ x: 200 + 90 + 5, y: 0 + 90 + 5 });
		expect(found && found.target).toBe(child);

		e.append(child);
		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(false);

		var found;
		found = runtime.game.findPointSource({ x: 100 + 90 + 5, y: 100 + 90 + 5 });
		expect(found && found.target).toBe(child);
		found = runtime.game.findPointSource({ x: 100 + 5, y: 100 + 5 });
		expect(found).toEqual({target: undefined, point: undefined, local: false}); // on e (untouchable)

		sibling.append(e);
		expect(e._hasTouchableChildren).toBe(true);
		expect(sibling._hasTouchableChildren).toBe(true);

		var found;
		found = runtime.game.findPointSource({ x: 100 + 200 + 90 + 5, y: 100 + 0 + 90 + 5 });
		expect(found && found.target).toBe(child);

		var e2 = new g.E({scene: runtime.scene});
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

	it("findPointSource - hide", function() {
		e.touchable = true;
		e.x = e.y = 0;
		e.width = 100;
		e.height = 100;
		e.modified();

		var found;
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50 });
		expect(found && found.target).toBe(e);
		e.hide();
		found = runtime.scene.findPointSourceByPoint({ x: 50, y: 50});
		expect(found).toEqual({target: undefined, point: undefined, local: false});
	});

	it("findPointSource - clipping", function() {
		var e2 = new g.E({scene: runtime.scene});
		e.append(e2);

		e.x = e.y = e2.x = e2.y = 0;
		e.width = 100;
		e.height = 100;
		e.modified();
		e2.touchable = true;
		e2.width = 200;
		e2.height = 200;
		e2.modified();

		var found;
		found = runtime.scene.findPointSourceByPoint({ x: 150, y: 150 });
		expect(found && found.target).toBe(e2);
		e.shouldFindChildrenByPoint = function() {
			return false;
		};
		found = runtime.scene.findPointSourceByPoint({ x: 150, y: 150 });
		expect(found && found.target).toBeUndefined();
	});

	it("findPointSource - local scene", function() {
		var game = new mock.Game({width: 320, height: 320});
		var scene = new g.Scene({game: game,local: true});
		game.pushScene(scene);
		game._flushSceneChangeRequests();

		var e = new g.E({
			scene: scene,
			touchable: true,
			x: 100,
			y: 100,
			width: 100,
			height: 100
		});
		scene.append(e);

		var found;
		found = game.findPointSource({ x: 150, y: 150 });
		expect(found).toEqual({target: e, point: {x: 50, y: 50}, local: true});
		found = game.findPointSource({ x: 0, y: 0 });
		expect(found).toEqual({target: undefined, point: undefined, local: true});
	});

	it("findPointSource - local entity", function() {
		var eparam = {
			scene: runtime.scene,
			local: true,
			touchable: true
		}
		e = new g.E(eparam);
		e.x = e.y = 100;
		e.width = e.height = 100;
		runtime.scene.append(e);
		found = runtime.game.findPointSource({ x: 150, y: 150 });
		expect(found).toEqual({target: e, point: {x: 50, y: 50}, local: true});
	});

	it("get update", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._update).toBeUndefined();

		var u = e.update;

		expect(e._update).toBe(u);
		expect(e.update).toBe(u);

		var firedFlg = false;
		u.add(function() {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		u.fire();

		expect(firedFlg).toBe(true);
	});

	it("get message", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._message).toBeUndefined();

		var m = e.message;

		expect(e._message).toBe(m);
		expect(e.message).toBe(m);

		var firedFlg = false;
		m.add(function() {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		m.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointDown", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._pointDown).toBeUndefined();

		var p = e.pointDown;

		expect(e._pointDown).toBe(p);
		expect(e.pointDown).toBe(p);

		var firedFlg = false;
		p.add(function() {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointUp", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._pointUp).toBeUndefined();

		var p = e.pointUp;

		expect(e._pointUp).toBe(p);
		expect(e.pointUp).toBe(p);

		var firedFlg = false;
		p.add(function() {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("get pointMove", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._pointMove).toBeUndefined();

		var p = e.pointMove;

		expect(e._pointMove).toBe(p);
		expect(e.pointMove).toBe(p);

		var firedFlg = false;
		p.add(function() {
			firedFlg = true;
		});

		expect(firedFlg).toBe(false);

		p.fire();

		expect(firedFlg).toBe(true);
	});

	it("set/get targetCameras", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._targetCameras).toBeUndefined();
		expect(e.targetCameras).toEqual([]);
		expect(e._targetCameras).toEqual([]);

		var c = new g.Camera2D({game: runtime.game});
		e.targetCameras = [c];

		expect(e._targetCameras).toEqual([c]);
		expect(e.targetCameras).toEqual([c]);

		var c2 = new g.Camera2D({game: runtime.game});
		e.targetCameras = [c, c2];

		expect(e._targetCameras).toEqual([c, c2]);
		expect(e.targetCameras).toEqual([c, c2]);

		e.targetCameras = [];

		expect(e._targetCameras).toEqual([]);
		expect(e.targetCameras).toEqual([]);
	});

	it("set/get touchable", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e._touchable).toBe(false);
		expect(e.touchable).toBe(false);

		e.touchable = true;
		expect(e._touchable).toBe(true);
		expect(e.touchable).toBe(true);

		var enableFlg = false;
		e._enableTouchPropagation = function() {
			enableFlg = true;
		};

		e.touchable = false;
		expect(enableFlg).toBe(false);
		e.touchable = true;
		expect(enableFlg).toBe(true);

		var disableFlg = false;
		e._disableTouchPropagation = function() {
			disableFlg = true;
		};

		e.touchable = true;
		expect(disableFlg).toBe(false);
		e.touchable = false;
		expect(disableFlg).toBe(true);
	});

	it("render with camera", function() {
		var e = new g.E({scene: runtime.scene});
		var r = new mock.Renderer();
		var c = new g.Camera2D({game: runtime.game});

		var c2 = new g.Camera2D({game: runtime.game});
		e.targetCameras = [c2];
		e.render(r, c);
		expect(r.methodCallHistory).toEqual([]);
		e.targetCameras = [c];

		r.clearMethodCallHistory();
		e.modified();
		e.render(r, c);
		expect(r.methodCallHistory).toEqual([ "translate", "translate"]);

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
		var e2 = new g.E({scene: runtime.scene});
		e.children = [e2];
		e.render(r, c);
		expect(r.methodCallHistory).toEqual(["translate", "save", "translate", "restore", "translate"]);
	});

	it("render without camera", function() {
		var e = new g.E({scene: runtime.scene});
		var r = new mock.Renderer();

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
		var e2 = new g.E({scene: runtime.scene});
		e.children = [e2];
		e.render(r);
		expect(r.methodCallHistory).toEqual(["translate", "save", "translate", "restore", "translate"]);
	});

	it("renderSelf with camera", function() {
		var e = new g.E({scene: runtime.scene});
		var r = new mock.Renderer();
		var c = new g.Camera2D({game: runtime.game});

		expect(e.renderSelf(r, c)).toBe(true);
		expect(r.methodCallHistory).toEqual([]);
	});

	it("renderSelf without camera", function() {
		var e = new g.E({scene: runtime.scene});
		var r = new mock.Renderer();

		expect(e.renderSelf(r)).toBe(true);
		expect(r.methodCallHistory).toEqual([]);
	});

	it("visible", function() {
		var e = new g.E({scene: runtime.scene});

		expect(e.visible()).toBe(true);
		e.hide();
		expect(e.visible()).toBe(false);
		e.show();
		expect(e.visible()).toBe(true);
	});

	it("_enableTouchPropagation", function() {
		var e = new g.E({scene: runtime.scene});
		var e2 = new g.E({scene: runtime.scene});
		e.append(e2);

		expect(e._hasTouchableChildren).toBe(false);
		e2._enableTouchPropagation();
		expect(e._hasTouchableChildren).toBe(true);
	});

	it("_disableTouchPropagation", function() {
		var e = new g.E({scene: runtime.scene});
		var e2 = new g.E({scene: runtime.scene});
		var e3 = new g.E({scene: runtime.scene});
		var e4 = new g.E({scene: runtime.scene});
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
		expect(e._hasTouchableChildren).toBe(true);	//e4 and e2 is touchable

		var parent = new g.E({scene: runtime.scene});
		var child1 = new g.E({scene: runtime.scene});
		var child2 = new g.E({scene: runtime.scene});
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

	it("_isTargetOperation", function() {
		var e = new g.E({scene: runtime.scene});
		var p = new g.PointEvent(0, e, {x:0,y:0});

		expect(e._isTargetOperation(p)).toBe(false);
		e.touchable = true;
		expect(e._isTargetOperation(p)).toBe(true);
		e.hide();
		expect(e._isTargetOperation(p)).toBe(false);
		e.show();
		expect(e._isTargetOperation(p)).toBe(true);
		expect(e._isTargetOperation(null)).toBe(false);

		var e2 = new g.E({scene: runtime.scene});
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.touchable = true;
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.hide();
		expect(e2._isTargetOperation(p)).toBe(false);
		e2.show();
		expect(e2._isTargetOperation(p)).toBe(false);
		expect(e2._isTargetOperation(null)).toBe(false);
	});

	it("render - compositeOperation", function() {
		var e = new g.E({scene: runtime.scene});
		var r = new mock.Renderer();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "restore"]);
		e.compositeOperation = g.CompositeOperation.SourceAtop;
		r.clearMethodCallHistory();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "setCompositeOperation", "restore"]);
		expect(r.methodCallParamsHistory("setCompositeOperation")[0])
			.toEqual({operation: g.CompositeOperation.SourceAtop});
		e.compositeOperation = undefined;
		r.clearMethodCallHistory();
		e.render(r);
		expect(r.methodCallHistory).toEqual(["save", "translate", "restore"]);
	});

	it("calculateBoundingRect", function() {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		e.scale(2);
		scene.append(e);
		e.modified();

		var result = e.calculateBoundingRect();
		expect(result.left).toBe(-50);
		expect(result.right).toBe(150);
		expect(result.top).toBe(-25);
		expect(result.bottom).toBe(75);

		var e2 = new g.E({scene: scene});
		e2.width = 100;
		e2.height = 50;
		e2.scale(2);
		e2.moveTo(-100, -50);
		scene.append(e2);
		e2.modified();

		var result2 = e2.calculateBoundingRect();
		expect(result2.left).toBe(-150);
		expect(result2.right).toBe(50);
		expect(result2.top).toBe(-75);
		expect(result2.bottom).toBe(25);

		var e3 = new g.E({scene: scene});
		e3.width = 300;
		e3.height = 300;
		e3.scale(0.5);
		scene.append(e3);
		e3.modified();

		var result3 = e3.calculateBoundingRect();
		expect(result3.left).toBe(300 / 4);
		expect(result3.right).toBe(300 / 4 * 3);
		expect(result3.top).toBe(300 / 4);
		expect(result3.bottom).toBe(300 / 4 * 3);
	});

	it("calculateBoundingRect with camera", function() {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		scene.append(e);

		var e2 = new g.E({scene: scene});
		e2.width = 200;
		e2.height = 200;
		scene.append(e2);
		e.append(e2);

		var camera = new g.Camera2D({game: runtime.game});
		e.targetCameras.push(camera);

		var result = e.calculateBoundingRect(camera);
		expect(result.left).toBe(0);
		expect(result.right).toBe(100);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(50);

		e2.targetCameras.push(camera);

		var result2 = e.calculateBoundingRect(camera);
		expect(result2.left).toBe(0);
		expect(result2.right).toBe(200);
		expect(result2.top).toBe(0);
		expect(result2.bottom).toBe(200);
	});

	it("calculateBoundingRect with children", function() {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		scene.append(e);

		var e2 = new g.E({scene: scene});
		e2.width = 400;
		e2.height = 200;
		scene.append(e2);
		e.append(e2);

		var e3 = new g.E({scene: scene});
		e3.width = 200;
		e3.height = 400;
		scene.append(e3);
		e.append(e3);

		var result = e.calculateBoundingRect();
		expect(result.left).toBe(0);
		expect(result.right).toBe(400);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(400);
	});

	it("calculateBoundingRect with grandchild", function() {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		scene.append(e);

		var e2 = new g.E({scene: scene});
		e2.width = 200;
		e2.height = 200;
		scene.append(e2);
		e.append(e2);

		var e3 = new g.E({scene: scene});
		e3.width = 400;
		e3.height = 200;
		scene.append(e3);
		e2.append(e3);

		var e4 = new g.E({scene: scene});
		e4.width = 200;
		e4.height = 400;
		scene.append(e4);
		e3.append(e4);

		var result = e.calculateBoundingRect();
		expect(result.left).toBe(0);
		expect(result.right).toBe(400);
		expect(result.top).toBe(0);
		expect(result.bottom).toBe(400);
	});

	it("EntityStateFlags", function () {
		var e = new g.E({ scene: runtime.scene });
		expect(e.state).toBe(mock.EntityStateFlags.None);
		e.x += 1;
		e.modified();
		expect(e.state).toBe(mock.EntityStateFlags.Modified | mock.EntityStateFlags.ContextLess);
		var r = new mock.Renderer();
		e.render(r, runtime.game.focusingCamera);
		expect(e.state).toBe(mock.EntityStateFlags.ContextLess);
		e.angle = 10;
		e.modified();
		expect(e.state).toBe(mock.EntityStateFlags.Modified);
		e.render(r, runtime.game.focusingCamera);
		e.angle = 0;
		e.modified();
		expect(e.state).toBe(mock.EntityStateFlags.Modified | mock.EntityStateFlags.ContextLess);
	});
});
